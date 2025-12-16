import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const url = request.nextUrl;
    let hostname = request.headers.get('host')!;

    // Handle localhost for dev
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        // For dev, we might want to simulate subdomains or just use path based.
        // Let's assume path-based for dev simplicity: localhost:3000/[slug]/...
        // Or we can rely on manual path navigation.
        // If we want to test "subdomains" locally, we'd need entry in /etc/hosts.

        // For now, let's keep it simple: No rewrite on localhost unless specific.
        return NextResponse.next();
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''
        }`;

    // Subdomain logic: tenant.qreats.app -> rewrite to /[tenant]
    const subdomain = hostname.split('.')[0];

    // If it's the main domain, don't rewrite (or rewrite to /home)
    if (subdomain === 'www' || subdomain === 'qreats') {
        return NextResponse.next();
    }

    // Rewrite everything else to /[subdomain]/path
    // Security Headers
    const responseHeaders = new Headers(request.headers);
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Rewrite path logic
    const rwResponse = NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url), {
        request: {
            headers: responseHeaders,
        },
    });

    // Apply headers to response as well? 
    // NextResponse.rewrite returns a response object that will forward the request.
    // To set headers on the RESPONSE to the client, we need to handle it differently usually in middleware.
    // But for rewrite, we can just return logic.
    // The snippet provided: "const response = NextResponse.next(); response.headers.set..."
    // Since we are rewriting, we can apply headers to the rewrite response object.

    // Security Headers
    const csp = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://images.unsplash.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const headers = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        'Content-Security-Policy': csp,
        'X-DNS-Prefetch-Control': 'off'
    };

    Object.entries(headers).forEach(([key, value]) => {
        rwResponse.headers.set(key, value);
    });

    return rwResponse;
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    ],
};
