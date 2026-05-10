import Image from 'next/image';
import { getOptimizedZenithUrl } from '../../../src/lib/image-optimization.mjs';

const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 675;

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

export default function OptimizedCoverImage({
  src,
  alt,
  className,
  width = FALLBACK_WIDTH,
  height = FALLBACK_HEIGHT,
  sizes = '100vw',
  priority = false,
  loading = 'lazy',
  fetchPriority = 'auto'
}) {
  const normalizedSrc = normalizeText(src);
  if (!normalizedSrc) return null;

  const optimizedSrc = getOptimizedZenithUrl(normalizedSrc, width);
  const normalizedFetchPriority = priority ? 'high' : fetchPriority;

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading}
      fetchPriority={normalizedFetchPriority}
      unoptimized
    />
  );
}
