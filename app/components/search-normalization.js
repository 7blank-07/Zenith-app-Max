const DIACRITIC_MARKS_REGEX = /[\u0300-\u036f]/g;

export function normalizeSearchText(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.normalize('NFD').replace(DIACRITIC_MARKS_REGEX, '').toLowerCase();
}
