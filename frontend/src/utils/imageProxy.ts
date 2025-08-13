export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  // Already proxied
  if (originalUrl.startsWith('/api/image/')) {
    return originalUrl;
  }

  try {
    // Ensure we can parse both absolute and relative URLs
    const parsed = new URL(originalUrl, 'http://placeholder');
    const pathname = parsed.pathname;

    const imagesPrefix = '/images/';
    const idx = pathname.indexOf(imagesPrefix);
    if (idx === -1) {
      // Not an image path we handle; return as-is
      return originalUrl;
    }

    const pathAfterImages = pathname.slice(idx + imagesPrefix.length);
    const search = parsed.search || '';

    return `/api/image/${pathAfterImages}${search}`;
  } catch {
    // If URL constructor fails for some edge case, return original
    return originalUrl;
  }
}
