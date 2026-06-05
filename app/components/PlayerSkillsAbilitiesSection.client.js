'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAYER_SKILL_BOOSTS_EVENT,
  aggregateSkillBoostsByLevel,
  calculateSkillMaxLevels,
  checkSkillUnlocked,
  clamp,
  fetchApiJson,
  getSkillId,
  getSkillImage,
  getSkillName,
  getSkillUnlockMessage,
  pruneLockedSkillLevels,
  toNumber
} from './player-skill-stats-utils';

function dispatchSkillBoosts(playerId, boosts) {
  if (typeof window === 'undefined') return;
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId) return;
  window.dispatchEvent(
    new CustomEvent(PLAYER_SKILL_BOOSTS_EVENT, {
      detail: {
        playerId: normalizedPlayerId,
        boosts: boosts && typeof boosts === 'object' ? boosts : {}
      }
    })
  );
}

export default function PlayerSkillsAbilitiesSection({ playerId, currentRank = 0 }) {
  const normalizedPlayerId = String(playerId || '').trim();
  const normalizedRank = clamp(toNumber(currentRank, 0), 0, 5);
  const skillRequestSequenceRef = useRef(0);
  const skillModalRef = useRef(null);

  const [hasMounted, setHasMounted] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsLoadMessage, setSkillsLoadMessage] = useState('Loading skills...');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillPointBudget, setSkillPointBudget] = useState(Math.max(0, normalizedRank));
  const [skillLevelsById, setSkillLevelsById] = useState({});
  const [skillBoostCatalogById, setSkillBoostCatalogById] = useState({});
  const [activeSkillDetail, setActiveSkillDetail] = useState(null);
  const [skillBoostLevels, setSkillBoostLevels] = useState([]);
  const [skillModalLoading, setSkillModalLoading] = useState(false);
  const [skillModalError, setSkillModalError] = useState('');

  const skillPointsSpent = useMemo(
    () => Object.values(skillLevelsById).reduce((sum, level) => sum + Math.max(0, toNumber(level, 0)), 0),
    [skillLevelsById]
  );
  const skillPointsRemaining = Math.max(0, skillPointBudget - skillPointsSpent);
  const skillMaxLevels = useMemo(
    () => calculateSkillMaxLevels(availableSkills, skillBoostCatalogById),
    [availableSkills, skillBoostCatalogById]
  );
  const aggregatedBoosts = useMemo(
    () => aggregateSkillBoostsByLevel(skillLevelsById, skillBoostCatalogById),
    [skillLevelsById, skillBoostCatalogById]
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    dispatchSkillBoosts(normalizedPlayerId, aggregatedBoosts);
  }, [aggregatedBoosts, normalizedPlayerId]);

  useEffect(
    () => () => {
      dispatchSkillBoosts(normalizedPlayerId, {});
    },
    [normalizedPlayerId]
  );

  const lastPlayerIdRef = useRef(normalizedPlayerId);

  useEffect(() => {
    const isSamePlayer = lastPlayerIdRef.current === normalizedPlayerId;
    lastPlayerIdRef.current = normalizedPlayerId;

    if (!isSamePlayer) {
      setSkillsLoading(true);
      setSkillsLoadMessage('Loading skills...');
      setAvailableSkills([]);
      setSkillLevelsById({});
      setSkillBoostCatalogById({});
      setActiveSkillDetail(null);
      setSkillBoostLevels([]);
      setSkillModalLoading(false);
      setSkillModalError('');
    }
    
    setSkillPointBudget(Math.max(0, normalizedRank));
    skillRequestSequenceRef.current += 1;

    if (!normalizedPlayerId) {
      setSkillsLoading(false);
      setSkillsLoadMessage('No skills available');
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadSkills = async () => {
      try {
        const payload = await fetchApiJson(
          `/players/${encodeURIComponent(normalizedPlayerId)}?rank=${encodeURIComponent(normalizedRank)}`,
          controller.signal
        );
        if (!isActive) return;
        const fetchedSkills = Array.isArray(payload?.skills) ? payload.skills : [];
        const fetchedBudget = Math.max(0, toNumber(payload?.available_skill_points, normalizedRank));
        
        setAvailableSkills(fetchedSkills);
        setSkillPointBudget(fetchedBudget);
        
        // Only prune if player changed, otherwise keep selected levels
        if (!isSamePlayer) {
            setSkillLevelsById((current) => pruneLockedSkillLevels(current, fetchedSkills));
        } else {
            // Re-apply budget logic if points were reduced
            setSkillLevelsById((current) => {
                let spending = Object.values(current).reduce((sum, val) => sum + toNumber(val, 0), 0);
                if (spending <= fetchedBudget) return current;

                // Prune skills from the end until budget is met
                const next = { ...current };
                const keys = Object.keys(next).reverse();
                for (const key of keys) {
                    while (next[key] > 0 && spending > fetchedBudget) {
                        next[key] -= 1;
                        spending -= 1;
                    }
                    if (next[key] === 0) delete next[key];
                    if (spending <= fetchedBudget) break;
                }
                return next;
            });
        }

        setSkillsLoadMessage(fetchedSkills.length ? '' : 'No skills available');
        setSkillsLoading(false);
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[player-detail] Failed to load skills:', error);
        if (!isSamePlayer) {
            setAvailableSkills([]);
            setSkillLevelsById({});
        }
        setSkillPointBudget(Math.max(0, normalizedRank));
        setSkillsLoadMessage('Failed to load skills');
        setSkillsLoading(false);
      }
    };

    loadSkills();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [normalizedPlayerId, normalizedRank]);

  useEffect(() => {
    const availableSkillIds = availableSkills
      .map((skill) => getSkillId(skill))
      .filter(Boolean);
    const missingSkillIds = availableSkillIds.filter((skillId) => !Array.isArray(skillBoostCatalogById[skillId]));
    if (!missingSkillIds.length) return undefined;

    let isActive = true;
    const controller = new AbortController();

    const loadBoostCatalog = async () => {
      try {
        const rows = await Promise.all(
          missingSkillIds.map(async (skillId) => {
            try {
              const payload = await fetchApiJson(`/skill-boosts/${encodeURIComponent(skillId)}`, controller.signal);
              return [skillId, Array.isArray(payload?.boosts) ? payload.boosts : []];
            } catch (error) {
              if (error?.name === 'AbortError') throw error;
              console.error(`[player-detail] Failed to load boosts for ${skillId}:`, error);
              return [skillId, []];
            }
          })
        );
        if (!isActive) return;
        setSkillBoostCatalogById((current) => {
          const next = { ...current };
          rows.forEach(([skillId, boosts]) => {
            next[skillId] = boosts;
          });
          return next;
        });
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[player-detail] Failed to load skill boost catalog:', error);
      }
    };

    loadBoostCatalog();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [availableSkills, skillBoostCatalogById]);

  const closeSkillDetailModal = useCallback(() => {
    skillRequestSequenceRef.current += 1;
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
  }, []);

  useEffect(() => {
    if (!activeSkillDetail || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frameId = window.requestAnimationFrame(() => {
      skillModalRef.current?.focus({ preventScroll: true });
      skillModalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeSkillDetailModal();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeSkillDetail, closeSkillDetailModal]);

  const handleSkillCardOpen = async (skill) => {
    if (!skill) return;
    const skillId = getSkillId(skill);
    if (!skillId) return;

    const requestId = skillRequestSequenceRef.current + 1;
    skillRequestSequenceRef.current = requestId;
    setActiveSkillDetail(skill);
    setSkillModalError('');
    setSkillModalLoading(true);

    const cachedBoosts = Array.isArray(skillBoostCatalogById[skillId]) ? skillBoostCatalogById[skillId] : null;
    if (cachedBoosts) {
      setSkillBoostLevels(cachedBoosts);
      setSkillModalLoading(false);
      return;
    }

    try {
      const payload = await fetchApiJson(`/skill-boosts/${encodeURIComponent(skillId)}`);
      if (requestId !== skillRequestSequenceRef.current) return;
      const boosts = Array.isArray(payload?.boosts) ? payload.boosts : [];
      setSkillBoostLevels(boosts);
      setSkillBoostCatalogById((current) => ({
        ...current,
        [skillId]: boosts
      }));
      setSkillModalLoading(false);
    } catch (error) {
      if (requestId !== skillRequestSequenceRef.current || error?.name === 'AbortError') return;
      console.error('[player-detail] Failed to load skill details:', error);
      setSkillBoostLevels([]);
      setSkillModalError('Failed to load skill details');
      setSkillModalLoading(false);
    }
  };

  const handleSkillLevelSelect = (targetLevel) => {
    if (!activeSkillDetail) return;
    const activeSkillId = getSkillId(activeSkillDetail);
    if (!activeSkillId) return;

    const currentLevel = Math.max(0, toNumber(skillLevelsById[activeSkillId], 0));
    const maxLevel = Math.max(1, toNumber(skillMaxLevels[activeSkillId], 1));
    const normalizedTargetLevel = clamp(toNumber(targetLevel, 0), 0, maxLevel);
    const nextLevel = normalizedTargetLevel === currentLevel ? 0 : normalizedTargetLevel;
    const unlocked = checkSkillUnlocked(activeSkillDetail, skillLevelsById, availableSkills);
    if (!unlocked && nextLevel > 0) return;

    const pointsDelta = nextLevel - currentLevel;
    if (pointsDelta > skillPointsRemaining) return;

    const provisionalLevels = { ...skillLevelsById };
    if (nextLevel > 0) provisionalLevels[activeSkillId] = nextLevel;
    else delete provisionalLevels[activeSkillId];
    const nextLevels = pruneLockedSkillLevels(provisionalLevels, availableSkills);
    setSkillLevelsById(nextLevels);
  };

  const handleResetSkills = () => {
    setSkillLevelsById({});
    closeSkillDetailModal();
  };

  const activeSkillId = getSkillId(activeSkillDetail);
  const activeSkillName = getSkillName(activeSkillDetail) || 'Skill';
  const activeSkillCurrentLevel = Math.max(0, toNumber(skillLevelsById[activeSkillId], 0));
  const activeSkillMaxLevel = Math.max(1, toNumber(skillMaxLevels[activeSkillId], 1));
  const activeSkillUnlocked = activeSkillDetail ? checkSkillUnlocked(activeSkillDetail, skillLevelsById, availableSkills) : true;
  const activeSkillUnlockMessage = activeSkillDetail ? getSkillUnlockMessage(activeSkillDetail) : 'Skill locked';
  const availablePointsForActiveSkill = Math.max(0, skillPointsRemaining + activeSkillCurrentLevel);

  return (
    <section className="player-skills-section" style={{ marginTop: '24px' }}>
      <div className="skills-header">
        <h3>Skills &amp; Abilities</h3>
        <button className="reset-skills-btn" type="button" onClick={handleResetSkills}>
          Reset Skills
        </button>
      </div>
      <div className="points-info">
        <span className="current-level-badge">Current Rank: {normalizedRank}</span>
        <span className="points-remaining-badge">
          Points Remaining: {skillPointsRemaining}/{skillPointBudget}
        </span>
      </div>
      <div className="skills-grid" id="player-skills-grid">
        {skillsLoading && <p style={{ color: '#98A0A6', textAlign: 'center', gridColumn: '1 / -1' }}>Loading skills...</p>}
        {!skillsLoading && !!skillsLoadMessage && !availableSkills.length && (
          <p style={{ color: '#98A0A6', textAlign: 'center', gridColumn: '1 / -1' }}>{skillsLoadMessage}</p>
        )}
        {!skillsLoading &&
          availableSkills.map((skill) => {
            const skillId = getSkillId(skill);
            const skillName = getSkillName(skill) || 'Skill';
            const skillImage = getSkillImage(skill) || '/assets/images/zenith_logo_main.png';
            const currentLevel = Math.max(0, toNumber(skillLevelsById[skillId], 0));
            const maxLevel = Math.max(1, toNumber(skillMaxLevels[skillId], 1));
            const unlocked = checkSkillUnlocked(skill, skillLevelsById, availableSkills);
            return (
              <div
                key={skillId || skillName}
                className={`skill-card ${unlocked ? '' : 'locked'}`}
                role="button"
                tabIndex={0}
                title={skillName}
                onClick={() => handleSkillCardOpen(skill)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSkillCardOpen(skill);
                  }
                }}
              >
                <div className="skill-card-inner">
                  <div className="skill-icon">
                    <img
                      src={skillImage}
                      alt={skillName}
                      onError={(event) => {
                        event.currentTarget.src = '/assets/images/zenith_logo_main.png';
                      }}
                    />
                    {!unlocked && <div className="lock-overlay">🔒</div>}
                  </div>
                  <div className="skill-name">{skillName}</div>
                  <div className="skill-level">
                    Level: <span className="level-number">{currentLevel}</span>/{maxLevel}
                  </div>
                  {!unlocked ? (
                    <div className="unlock-requirement">
                      <small>{getSkillUnlockMessage(skill)}</small>
                    </div>
                  ) : (
                    <div className="skill-actions">
                      {currentLevel >= maxLevel ? <div className="max-level-badge">MAX LEVEL</div> : <small style={{ color: '#98A0A6' }}>Tap to adjust</small>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {hasMounted && activeSkillDetail
        ? createPortal(
        <div id="skill-detail-modal" className="skill-detail-modal" onClick={closeSkillDetailModal}>
          <div
            id="skill-modal-content"
            ref={skillModalRef}
            className="skill-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-skill-detail-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close-btn" type="button" onClick={closeSkillDetailModal} aria-label="Close skill detail modal">
              ×
            </button>
            <h2 id="player-skill-detail-title">{activeSkillName}</h2>
            {!activeSkillUnlocked && <div style={{ marginTop: '8px', color: '#FFB86B', fontWeight: 600 }}>{activeSkillUnlockMessage}</div>}
            <div className="points-info">
              <div className="current-level-badge">
                Current Level: {activeSkillCurrentLevel}/{activeSkillMaxLevel}
              </div>
              <div className="points-remaining-badge">
                {availablePointsForActiveSkill} point{availablePointsForActiveSkill !== 1 ? 's' : ''} available
              </div>
            </div>
            <div className="boosts-container">
              {skillModalLoading && <p style={{ color: '#98A0A6' }}>Loading skill details...</p>}
              {!skillModalLoading && !!skillModalError && <p style={{ color: '#FF6B6B' }}>{skillModalError}</p>}
              {!skillModalLoading && !skillModalError && !skillBoostLevels.length && <p style={{ color: '#98A0A6' }}>No boost data available</p>}
              {!skillModalLoading &&
                !skillModalError &&
                skillBoostLevels.map((boost) => {
                  const levelNumber = Math.max(0, toNumber(boost?.level_number ?? boost?.levelNumber, 0));
                  if (!levelNumber || levelNumber > activeSkillMaxLevel) return null;
                  const isSelected = activeSkillCurrentLevel === levelNumber;
                  const pointsNeeded = levelNumber - activeSkillCurrentLevel;
                  const canAfford = pointsNeeded <= availablePointsForActiveSkill;
                  const isDisabled = !isSelected && (!activeSkillUnlocked || !canAfford);
                  const isPartiallyUnlocked = activeSkillCurrentLevel > levelNumber && !isSelected;
                  return (
                    <div
                      key={`${activeSkillId}-${levelNumber}`}
                      className={`boost-level-section ${isSelected ? 'selected' : ''} ${isPartiallyUnlocked ? 'unlocked' : ''} ${
                        isDisabled ? 'disabled' : ''
                      }`}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      onClick={() => {
                        if (isDisabled) return;
                        handleSkillLevelSelect(levelNumber);
                      }}
                      onKeyDown={(event) => {
                        if (isDisabled) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSkillLevelSelect(levelNumber);
                        }
                      }}
                      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    >
                      <div className={`level-checkbox ${isSelected ? 'checked' : ''} ${isPartiallyUnlocked ? 'partial' : ''} ${isDisabled ? 'disabled' : ''}`}>
                        {isSelected ? '✓' : isPartiallyUnlocked ? '○' : ''}
                      </div>
                      <h4>Level {levelNumber}</h4>
                      {isDisabled && pointsNeeded > 0 && (
                        <div className="insufficient-points">Need {pointsNeeded} more point{pointsNeeded !== 1 ? 's' : ''}</div>
                      )}
                      <div className="boost-stats">
                        {Object.entries(boost).map(([key, value]) => {
                          if (!key.startsWith('boost_')) return null;
                          const numericValue = toNumber(value, 0);
                          if (!numericValue) return null;
                          const statName = key.replace('boost_', '').replace(/_/g, ' ').toUpperCase();
                          return (
                            <div key={`${activeSkillId}-${levelNumber}-${key}`} className="boost-stat">
                              +{numericValue} {statName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>,
        document.body
      )
        : null}
    </section>
  );
}
