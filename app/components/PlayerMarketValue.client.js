'use client';

export default function PlayerMarketValue({ isUntradable = false }) {
  if (isUntradable) return <>Untradable</>;
  return <>Tradable</>;
}
