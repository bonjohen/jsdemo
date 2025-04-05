/**
 * Development utilities for cache busting and debugging
 */

/**
 * Clears browser caches (application cache, localStorage, sessionStorage)
 * and reloads the page
 */
export const clearCachesAndReload = () => {
  if (window.caches) {
    // Clear application cache
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log(`Cache ${cacheName} cleared`);
      });
    });
  }

  // Clear localStorage
  try {
    localStorage.clear();
    console.log('localStorage cleared');
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('sessionStorage cleared');
  } catch (e) {
    console.error('Failed to clear sessionStorage:', e);
  }

  // Reload the page
  window.location.reload(true);
};

/**
 * Adds a cache-busting parameter to a URL
 * @param {string} url - The URL to add the cache-busting parameter to
 * @returns {string} - The URL with the cache-busting parameter
 */
export const addCacheBuster = (url) => {
  // Create a URL object to safely manipulate the URL
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('v', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    console.warn('Failed to add cache buster to URL:', e);
    return url;
  }
};

// Add a global function for cache busting in development
if (import.meta.env.DEV) {
  window.__clearCache = clearCachesAndReload;
  console.info('Development mode: Use window.__clearCache() to clear caches and reload');
}

export default {
  clearCachesAndReload,
  addCacheBuster
};
