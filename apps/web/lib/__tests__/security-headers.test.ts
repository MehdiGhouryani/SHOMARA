import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('web security headers (wave A7)', () => {
  async function headerMap(): Promise<Map<string, string>> {
    const entries = nextConfig.headers ? await nextConfig.headers() : [];
    const map = new Map<string, string>();
    for (const entry of entries) {
      for (const h of entry.headers) map.set(h.key, h.value);
    }
    return map;
  }

  it('keeps the baseline hardening headers on every route', async () => {
    const map = await headerMap();
    expect(map.get('X-Content-Type-Options')).toBe('nosniff');
    expect(map.get('X-Frame-Options')).toBe('DENY');
    expect(map.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(map.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(map.get('Permissions-Policy')).toContain('camera=()');
  });

  it('ships CSP in Report-Only mode with locked-down baseline directives', async () => {
    const map = await headerMap();
    const csp = map.get('Content-Security-Policy-Report-Only');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("connect-src 'self'");
    // Report-Only is deliberate (START_HERE A7): enforcement waits for real violation review.
    expect(map.has('Content-Security-Policy')).toBe(false);
  });

  it('does not allow framing or arbitrary remote origins in connect/script sources', async () => {
    const map = await headerMap();
    const csp = map.get('Content-Security-Policy-Report-Only') ?? '';
    expect(csp).not.toContain('http://');
    expect(csp).not.toContain('https://');
  });
});
