import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
  ],
  transpilePackages: [
    '@math/contracts',
    '@math/content-delivery',
    '@math/learning-runtime',
    '@math/assignment-runtime',
    '@math/adult-projections',
    '@math/offline-sync',
  ],
  turbopack: {},
  async headers() {
    // CSP ships as Report-Only first (wave A7 / START_HERE A7): enforcing without reviewing real
    // violation reports can break login/API/assets. 'unsafe-inline' (Next inline bootstrap +
    // React inline styles) and 'unsafe-eval' (Next dev overlay) are documented necessities; both
    // must be re-reviewed before switching to the enforcing header, together with a report-uri
    // collector. No report-uri yet: there is no violation collector endpoint.
    const cspReportOnly = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join('; ');
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
        ],
      },
    ];
  },
};

export default nextConfig;
