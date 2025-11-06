import { createMiddleware, createStart } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

// Cloudflare Cache API middleware for runtime caching
const cacheMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  
  // Only cache GET requests for HTML pages
  if (request.method !== 'GET') {
    return next()
  }
  
  // @ts-expect-error - Cloudflare Workers global
  const cache = caches.default
  const cacheKey = new Request(url.toString(), request)
  
  // Try to get from cache
  let response = await cache.match(cacheKey)
  
  if (response) {
    console.log(`Cache HIT: ${url.pathname}`)
    return response
  }
  
  console.log(`Cache MISS: ${url.pathname}`)
  
  // Get fresh response
  response = await next()
  
  // Clone and cache the response
  if (response.ok) {
    const clonedResponse = response.clone()
    
    // Add cache headers
    const headers = new Headers(clonedResponse.headers)
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    
    const cachedResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers,
    })
    
    // Store in cache (non-blocking)
    // @ts-expect-error - Cloudflare Workers context
    if (typeof context !== 'undefined' && context.waitUntil) {
      // @ts-expect-error - Cloudflare Workers context
      context.waitUntil(cache.put(cacheKey, cachedResponse))
    } else {
      // Fallback: cache without waitUntil
      cache.put(cacheKey, cachedResponse)
    }
  }
  
  return response
})

// Middleware to redirect /vercel to the official Vercel site
const vercelRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  
  // Check if the path is /vercel
  if (url.pathname === '/vercel') {
    // Perform a redirect to the official Vercel site
    throw redirect({
      href: 'https://who-to-bother-at.vercel.app/',
      statusCode: 302,
    })
  }
  
  // Continue with the normal request flow
  return next()
})

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [cacheMiddleware, vercelRedirectMiddleware],
  }
})

