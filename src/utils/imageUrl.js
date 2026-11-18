/**
 * Image URL Resolution Utility (Vercel + Railway Architecture)
 * Automatically handles:
 * 1. Local development (Vite proxy)
 * 2. Vercel deployment (static /uploads/ direct CDN)
 * 3. Railway backend deployment (full dynamic media URL)
 * 4. Graceful fallbacks if an asset is unavailable
 */

export const DEFAULT_PLACEHOLDER = '/uploads/necklaces.png';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '');

/**
 * Resolves any image URL to a safe displayable URL or CSS background string
 */
export function getSafeImageUrl(img, fallback = DEFAULT_PLACEHOLDER) {
  if (!img) return fallback;
  const str = String(img).trim();
  if (str.startsWith('var(')) return str;
  if (str.startsWith('--')) return `var(${str})`;
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) return str;

  // Handle local /uploads/ URLs
  if (str.startsWith('/uploads/')) {
    return str;
  }
  return str;
}

/**
 * Image tag onError fallback handler.
 * If a Vercel local image fails to load, attempts Railway backend URL, then fallback placeholder.
 */
export function handleImageError(e, fallbackUrl = null) {
  const target = e.currentTarget;
  if (!target) return;

  // 1. Try Railway backend if loading from relative Vercel path failed
  if (!target._hasRetriedBackend && BACKEND_URL && target.src && target.src.includes('/uploads/')) {
    target._hasRetriedBackend = true;
    const match = target.src.match(/\/uploads\/.+$/);
    if (match) {
      target.src = `${BACKEND_URL}${match[0]}`;
      return;
    }
  }

  // 2. Final fallback: reliable theme placeholder or default image
  if (!target._hasFailedOnce) {
    target._hasFailedOnce = true;
    target.src = fallbackUrl || '/uploads/jewels.png';
  }
}
