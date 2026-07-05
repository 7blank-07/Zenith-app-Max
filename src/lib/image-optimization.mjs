/**
 * Zenith Image Optimization Utility
 * Focuses on real byte reduction via source transformation.
 */

/**
 * Custom loader for Next.js Image component (Client-side usage).
 * NOTE: Do not pass this function as a prop from Server to Client components.
 */
export function zenithImageLoader({ src, width, quality }) {
  return getOptimizedZenithUrl(src, width, quality);
}

/**
 * Manually applies optimization parameters to a Zenith URL string.
 * This is the preferred build-safe method for Server Components.
 */
export function getOptimizedZenithUrl(src, width, quality = 75) {
  if (!src || typeof src !== 'string') return '';
  
  // If not a Zenith-hosted image, return as-is
  if (!src.includes('images.zenithfcm.com')) {
    return src;
  }
  
  try {
    // Handle both absolute and relative-like strings (though Zenith images are usually absolute)
    const url = new URL(src, 'https://images.zenithfcm.com');
    
    if (width) {
      url.searchParams.set('w', width.toString());
    }
    
    url.searchParams.set('q', (quality || 75).toString());
    url.searchParams.set('v', '2'); // Global cache buster to force browsers and Cloudflare to load fresh images
    
    return url.toString();
  } catch (error) {
    console.warn('[image-opt] Failed to transform Zenith URL:', src, error);
    return src;
  }
}

/**
 * Surgically downscales flag and club icons based on URL patterns.
 * Example: flags_23_128x128_27 -> flags_23_64x64_27
 */
export function optimizeIconUrl(url, targetSize = 64) {
  if (!url || typeof url !== 'string' || !url.includes('images.zenithfcm.com')) {
    return url;
  }
  
  // Pattern match for 128x128 or other large dimensions in Zenith URLs
  return url.replace(/\d+x\d+/, `${targetSize}x${targetSize}`);
}
