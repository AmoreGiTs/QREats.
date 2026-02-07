/**
 * Cloudflare Worker for Edge Caching and Routing
 */

export interface Env {
    API_URL: string;
    CACHE_TTL: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Only cache GET requests
        if (request.method !== 'GET') {
            return fetch(request);
        }

        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);

        // Check cache
        let response = await cache.match(cacheKey);

        if (!response) {
            console.log(`🌐 Cache miss: ${url.pathname}. Fetching from origin...`);

            const originResponse = await fetch(`${env.API_URL}${url.pathname}${url.search}`);

            // Clone response to cache it
            response = new Response(originResponse.body, originResponse);

            // Cache for the configured TTL
            response.headers.append('Cache-Control', `public, s-maxage=${env.CACHE_TTL || '300'}`);

            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        } else {
            console.log(`⚡ Cache hit: ${url.pathname}`);
        }

        return response;
    },
};
