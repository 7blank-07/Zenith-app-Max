import { RANK_SPRITE_IMAGE_URLS } from './static-image-urls';

export function parseRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

export function renderStars(value) {
  const stars = Number.isFinite(Number(value)) ? Math.max(0, Math.min(5, Number(value))) : 0;
  if (!stars) return 'N/A';
  return `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
}

export function getPlayerCardVariant(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function looksLikeImageUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function deriveDisplayLabel(value, fallbackPrefix, index) {
  const text = String(value || '').trim();
  if (!text) return `${fallbackPrefix} ${index + 1}`;
  if (!looksLikeImageUrl(text)) return text;

  const fileName = text
    .split('/')
    .pop()
    ?.split('?')[0]
    ?.replace(/\.[a-z0-9]+$/i, '');

  if (!fileName) return `${fallbackPrefix} ${index + 1}`;

  const normalized = fileName
    .replace(/^skillmovelogo_[0-9]+_?/i, 'Skill Move ')
    .replace(/^celebrationlogo_[0-9]+_?/i, 'Celebration ')
    .replace(/^skill_[a-z0-9]+_/i, '')
    .replace(/^skill_/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  if (!normalized) return `${fallbackPrefix} ${index + 1}`;

  return normalized
    .split(' ')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part))
    .join(' ');
}

export function buildProfileOverviewItems(names, images, fallbackPrefix, idPrefix) {
  const normalizedNames = Array.isArray(names) ? names.filter(Boolean) : [];
  const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];

  return Array.from({ length: Math.max(normalizedNames.length, normalizedImages.length) }, (_, index) => {
    const rawName = normalizedNames[index] || '';
    const rawImage = normalizedImages[index] || '';
    const icon = looksLikeImageUrl(rawImage) ? rawImage : looksLikeImageUrl(rawName) ? rawName : '';

    return {
      id: `${idPrefix}-${index}`,
      name: deriveDisplayLabel(rawName || rawImage, fallbackPrefix, index),
      icon
    };
  }).filter((entry) => entry.name);
}

export function formatWorkRateText(value) {
  const text = String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ');

  if (!text) return 'Unknown';

  return text
    .split(/\s+/)
    .map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

export function formatProfileValue(value, fallback = 'Unknown') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

export const RANK_COLORS = Object.freeze({
  0: '#98A0A6',
  1: '#3BD671',
  2: '#6366F1',
  3: '#8B5CF6',
  4: '#FF6B6B',
  5: '#FFB86B'
});

export const RANK_SPRITES = RANK_SPRITE_IMAGE_URLS;
