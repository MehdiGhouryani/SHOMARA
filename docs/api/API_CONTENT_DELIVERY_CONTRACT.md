# Content Delivery API Contract

## Manifest
`GET /api/v1/content/manifest?gradeId={gradeId}`

Response: `ContentManifest`

## Package
`GET /api/v1/content/packages/{packageId}`

The route returns package bytes. Response headers include package ID and SHA-256 checksum.

## Entitlement
`GET /api/v1/content/entitlements/{packageId}`

Header: `x-learning-identity-id`.

Production implementation must use authenticated identity plus server-side authorization/RLS. Development uses `DEV_GRANT` only outside production.

## Assignment content requirement
`GET /api/v1/assignments/{assignmentId}/content`

Production implementation resolves `assignment_required_packages`; the current development route is intentionally a non-authoritative fixture.

## Client rules
- Never trust a package URL without a manifest record.
- Never mark a package usable before checksum verification.
- Never download future content by default.
- Never treat entitlement as equivalent to local cache presence.
- Package cache is disposable; canonical content access is server authoritative.
