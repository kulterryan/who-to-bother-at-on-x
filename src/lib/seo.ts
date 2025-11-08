type MetaTag = 
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

/**
 * Gets the base URL for the application.
 * Uses the request URL if available, otherwise falls back to environment variable or default.
 */
export function getBaseUrl(request?: Request): string {
  // If we have a request, extract the origin from it
  if (request) {
    try {
      const url = new URL(request.url);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Fall through to other methods
    }
  }

  // Try environment variable (useful for Cloudflare Workers)
  if (typeof process !== 'undefined' && process.env?.SITE_URL) {
    return process.env.SITE_URL;
  }

  // Try Cloudflare Workers environment binding
  // @ts-expect-error - Cloudflare Workers environment
  if (typeof SITE_URL !== 'undefined') {
    // @ts-expect-error - Cloudflare Workers environment
    return SITE_URL;
  }

  // Default fallback (for development)
  return 'https://bother.at';
}

/**
 * Converts a relative path to an absolute URL.
 */
export function getAbsoluteUrl(path: string, request?: Request): string {
  const baseUrl = getBaseUrl(request);
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function seo({
  title,
  description,
  keywords,
  image,
  url,
}: {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}): MetaTag[] {
  const tags: MetaTag[] = [
    { title },
  ];

  if (description) {
    tags.push(
      { name: 'description', content: description },
      { property: 'og:description', content: description },
      { name: 'twitter:description', content: description }
    );
  }

  if (keywords) {
    tags.push({ name: 'keywords', content: keywords });
  }

  if (image) {
    tags.push(
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:image', content: image }
    );
  }

  if (url) {
    tags.push({ property: 'og:url', content: url });
  }

  tags.push(
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title }
  );

  return tags;
}

