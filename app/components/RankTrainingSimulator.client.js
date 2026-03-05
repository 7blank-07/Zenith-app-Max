'use client';

import { useMemo, useState } from 'react';

function normalizeRank(value) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function normalizeTraining(value) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(30, Math.max(0, parsed));
}

export default function RankTrainingSimulator({ baseOvr = 0, initialRank = 0 }) {
  const [targetRank, setTargetRank] = useState(normalizeRank(initialRank));
  const [trainingLevel, setTrainingLevel] = useState(0);

  const projectedOvr = useMemo(() => {
    const normalizedBase = Number.isFinite(Number(baseOvr)) ? Number(baseOvr) : 0;
    const trainingBoost = Math.floor(trainingLevel / 5);
    return normalizedBase + targetRank + trainingBoost;
  }, [baseOvr, targetRank, trainingLevel]);

  return (
    <section style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', border: '1px solid #d5d8dc' }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>Rank & Training Simulator</h3>
      <p style={{ marginTop: '8px', marginBottom: '10px' }}>
        Local estimate only (no server write): projected OVR <strong>{projectedOvr}</strong>
      </p>

      <label style={{ display: 'block', marginBottom: '8px' }}>
        Target Rank: {targetRank}
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={targetRank}
          onChange={(event) => setTargetRank(normalizeRank(event.target.value))}
          style={{ width: '100%' }}
        />
      </label>

      <label style={{ display: 'block' }}>
        Training Level: {trainingLevel}
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={trainingLevel}
          onChange={(event) => setTrainingLevel(normalizeTraining(event.target.value))}
          style={{ width: '100%' }}
        />
      </label>
    </section>
  );
}
