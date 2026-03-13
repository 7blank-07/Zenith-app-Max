import Image from 'next/image';

const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 675;

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function isRelativeSource(src) {
  return src.startsWith('/');
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

  const normalizedFetchPriority = priority ? 'high' : fetchPriority;

  if (isRelativeSource(normalizedSrc)) {
    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        fetchPriority={normalizedFetchPriority}
      />
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding="async"
      fetchPriority={normalizedFetchPriority}
    />
  );
}
