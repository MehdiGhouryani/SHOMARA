import { test, expect } from '@playwright/test';

test.describe('V1 API critical path', () => {
  test('session endpoint creates a version-pinned session in dev mode', async ({ request }) => {
    const response = await request.post('/api/v1/learning/sessions', {
      headers: { 'x-dev-learning-identity-id': 'child-dev-01' },
      data: {
        learningIdentityId: 'child-dev-01',
        relationshipContextId: 'platform',
        gradeId: 'G1',
        curriculumVersionId: 'G1-CV1',
        skillGraphVersionId: 'G1-SG1',
        sessionType: 'LEARNING',
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.gradeId).toBe('G1');
    expect(body.curriculumVersionId).toBe('G1-CV1');
    expect(body.skillGraphVersionId).toBe('G1-SG1');
  });

  test('sync endpoint rejects oversize batches', async ({ request }) => {
    const actions = Array.from({ length: 21 }, (_, i) => ({
      id: `a${i}`,
      clientInstallationId: 'install-dev-01',
      learningIdentityId: 'child-dev-01',
      operationType: 'EVENT_INGEST',
      idempotencyKey: `key-${i}`,
      payload: {},
    }));
    const response = await request.post('/api/v1/sync/batch', {
      headers: { 'X-Client-Installation-Id': 'install-dev-01', 'x-dev-learning-identity-id': 'child-dev-01' },
      data: { actions },
    });
    expect(response.status()).toBe(413);
    expect((await response.json()).code).toBe('SYNC_BATCH_TOO_LARGE');
  });
});
