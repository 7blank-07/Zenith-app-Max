/**
 * Zenith Image Optimization Utility
 * Focuses on real byte reduction via source transformation.
 */

export function zenithImageLoader({ src, width, quality }) {
  // If not a Zenith-hosted image, return as-is
  if (!src.includes('images.zenithfcm.com')) {
    return src;
  }

  // Common CDN pattern: append width and quality
  // Even if the server doesn't support it yet, this prepares for the aggressive pipeline
  const url = new URL(src);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', (quality || 75).toString());
  
  return url.toString();
}

/**
 * Manually applies optimization parameters to a Zenith URL string.
 * Used to avoid passing functions to Client Components.
 */
export function getOptimizedZenithUrl(src, width, quality = 75) {
  if (!src || typeof src !== 'string' || !src.includes('images.zenithfcm.com')) {
    return src;
  }
  
  try {
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    return url.toString();
  } catch {
    return src;
  }
}

/**
 * Surgically downscales flag and club icons based on URL patterns.
 * Example: flags_23_128x128_27 -> flags_23_64x64_27
 */
export function optimizeIconUrl(url, targetSize = 64) {
  if (!url || typeof url !== 'string') return url;
  
  // Pattern match for 128x128 or other large dimensions in Zenith URLs
  if (url.includes('images.zenithfcm.com')) {
    return url.replace(/\d+x\d+/, `${targetSize}x${targetSize}`);
  }
  
  return url;
}
