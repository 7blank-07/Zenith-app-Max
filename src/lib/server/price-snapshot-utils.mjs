function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseCapturedAtToMs(value) {
  const text = String(value ?? '').trim();
  if (!text) return Number.NaN;

  const nativeMs = Date.parse(text);
  if (Number.isFinite(nativeMs)) return nativeMs;

  const usMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (usMatch) {
    const [, monthText, dayText, yearText, hourText = '0', minuteText = '0', secondText = '0'] = usMatch;
    const month = Number.parseInt(monthText, 10);
    const day = Number.parseInt(dayText, 10);
    const year = Number.parseInt(yearText, 10);
    const hour = Number.parseInt(hourText, 10);
    const minute = Number.parseInt(minuteText, 10);
    const second = Number.parseInt(secondText, 10);
    const utcMs = Date.UTC(year, month - 1, day, hour, minute, second);
    return Number.isFinite(utcMs) ? utcMs : Number.NaN;
  }

  return Number.NaN;
}

export function getPriceForRankWithFallback(row, preferredRank = 0) {
  if (!row || typeof row !== 'object') return null;
  const normalizedRank = Math.min(5, Math.max(0, Number.parseInt(String(preferredRank ?? '0'), 10) || 0));

  const rankOrder = [normalizedRank];
  for (let rank = normalizedRank - 1; rank >= 0; rank -= 1) rankOrder.push(rank);
  for (let rank = normalizedRank + 1; rank <= 5; rank += 1) rankOrder.push(rank);

  for (const rank of rankOrder) {
    const value = toFiniteNumber(row[`price${rank}`]);
    if (Number.isFinite(value) && value > 0) {
      return { value, resolvedRank: rank };
    }
  }

  return null;
}

export function selectLatestSnapshotWithPrice(rows, preferredRank = 0) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  let best = null;
  let bestMs = Number.NaN;

  normalizedRows.forEach((row) => {
    const capturedMs = parseCapturedAtToMs(row?.captured_at);
    const price = getPriceForRankWithFallback(row, preferredRank);
    if (!price) return;

    if (!best || (Number.isFinite(capturedMs) && (!Number.isFinite(bestMs) || capturedMs > bestMs))) {
      best = { row, price };
      bestMs = capturedMs;
    }
  });

  return best;
}

export function buildHistorySnapshots(rows, preferredRank = 0, options = {}) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const startMs = Number.isFinite(options.startMs) ? options.startMs : Number.NEGATIVE_INFINITY;
  const endMs = Number.isFinite(options.endMs) ? options.endMs : Number.POSITIVE_INFINITY;

  return normalizedRows
    .map((row) => {
      const capturedAt = row?.captured_at ?? null;
      const capturedMs = parseCapturedAtToMs(capturedAt);
      const price = getPriceForRankWithFallback(row, preferredRank);
      if (!capturedAt || !Number.isFinite(capturedMs) || !price) return null;
      return {
        capturedAt,
        capturedMs,
        price: price.value,
        resolvedRank: price.resolvedRank
      };
    })
    .filter((entry) => entry && entry.capturedMs >= startMs && entry.capturedMs <= endMs)
    .sort((first, second) => first.capturedMs - second.capturedMs)
    .map((entry) => ({
      capturedAt: entry.capturedAt,
      price: entry.price,
      resolvedRank: entry.resolvedRank
    }));
}
