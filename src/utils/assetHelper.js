/**
 * Helper to resolve static assets across both local development,
 * Node Express server, and GitHub Pages production deployment (/ssp/).
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Strip leading slashes
  const cleanPath = path.replace(/^\/+/, '');

  // Vite sets import.meta.env.BASE_URL based on vite.config.js base
  let baseUrl = import.meta.env.BASE_URL || '/';
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  return `${baseUrl}${cleanPath}`;
}
