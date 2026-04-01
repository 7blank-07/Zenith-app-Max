'use client';

import { useEffect, useRef } from 'react';

const FRAME_COUNT = 36;
const FPS = 18;
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const FRAME_COLUMNS = 6;
const BASE_SPRITE_SIZE = 192;

function resolveIconSize(element, fallbackSize) {
  const computedStyle = window.getComputedStyle(element);
  const computedWidth = Number.parseFloat(computedStyle.width);
  if (Number.isFinite(computedWidth) && computedWidth > 0) {
    return Math.round(computedWidth);
  }

  const datasetSize = Number.parseInt(String(element.dataset.iconSize ?? ''), 10);
  if (Number.isFinite(datasetSize) && datasetSize > 0) {
    return datasetSize;
  }

  return fallbackSize;
}

export default function AnimatedRankIcon({ rank, spriteUrl, size = 56, className, style }) {
  const iconRef = useRef(null);
  const intervalRef = useRef(0);

  useEffect(() => {
    const element = iconRef.current;
    if (!element || !spriteUrl) return () => {};

    const startAnimation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = 0;
      }

      const iconSize = resolveIconSize(element, size);
      const scaleFactor = iconSize / FRAME_WIDTH;
      const scaledFrameWidth = FRAME_WIDTH * scaleFactor;
      const scaledFrameHeight = FRAME_HEIGHT * scaleFactor;
      const spriteSheetSize = Math.round(BASE_SPRITE_SIZE * scaleFactor);
      const intervalMs = 1000 / FPS;

      element.style.backgroundSize = `${spriteSheetSize}px ${spriteSheetSize}px`;
      element.style.backgroundPosition = '0px 0px';

      let currentFrame = 0;
      intervalRef.current = window.setInterval(() => {
        currentFrame = (currentFrame + 1) % FRAME_COUNT;
        const col = currentFrame % FRAME_COLUMNS;
        const row = Math.floor(currentFrame / FRAME_COLUMNS);
        const xOffset = -(col * scaledFrameWidth);
        const yOffset = -(row * scaledFrameHeight);
        element.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
      }, intervalMs);
    };

    startAnimation();

    const resizeObserver = new ResizeObserver(() => {
      startAnimation();
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = 0;
      }
    };
  }, [rank, size, spriteUrl]);

  return (
    <div
      ref={iconRef}
      className={className}
      data-rank={rank}
      data-icon-size={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url('${spriteUrl}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0px 0px',
        display: 'block',
        flexShrink: 0,
        imageRendering: 'pixelated',
        ...style
      }}
    />
  );
}
