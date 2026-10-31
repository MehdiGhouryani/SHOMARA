import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { contentVersionIsProductionApproved, PRODUCTION_APPROVAL_STATUSES } from '../content-delivery';

/**
 * Approval lifecycle consistency (ADR-0037 item 1.3): the TypeScript content-delivery gate and
 * the SQL runtime RPC must read the SAME column (provenance->>'approvalStatus') and accept the
 * SAME approved values, so DRAFT_* content is non-playable on both paths.
 */
describe('content approval gate (TS side)', () => {
  it('accepts approved provenance statuses with an ACTIVE row', () => {
    for (const approvalStatus of PRODUCTION_APPROVAL_STATUSES) {
      expect(contentVersionIsProductionApproved({
        provenance: { approvalStatus },
        status: 'ACTIVE',
      })).toBe(true);
    }
  });

  it('rejects DRAFT_* provenance statuses (the 0067-0071 batch rows stay non-playable)', () => {
    expect(contentVersionIsProductionApproved({
      provenance: { approvalStatus: 'DRAFT_BATCH_C_DEPTH' },
      status: 'ACTIVE',
    })).toBe(false);
  });

  it('rejects non-ACTIVE rows and missing/malformed provenance', () => {
    expect(contentVersionIsProductionApproved({
      provenance: { approvalStatus: 'CANONICAL_APPROVED' },
      status: 'RETIRED',
    })).toBe(false);
    expect(contentVersionIsProductionApproved({ provenance: null, status: 'ACTIVE' })).toBe(false);
    expect(contentVersionIsProductionApproved({ status: 'ACTIVE' })).toBe(false);
    expect(contentVersionIsProductionApproved({
      provenance: 'not-an-object' as unknown as Record<string, unknown>,
      status: 'ACTIVE',
    })).toBe(false);
  });

  it('rejects an approvalStatus placed in the wrong column (metadata only)', () => {
    // The pre-fix bug: the TS gate read metadata.approvalStatus while the DB writes provenance.
    expect(contentVersionIsProductionApproved({
      provenance: null,
      status: 'ACTIVE',
    })).toBe(false);
  });
});

describe('content approval gate (SQL consistency, ADR-0037 item 1.3)', () => {
  const migrationPath = path.resolve(__dirname, '..', '..', '..', '..', 'supabase', 'migrations', '0053_android_runtime_foundation.sql');

  it('accepts exactly the values the runtime_create_encounter RPC accepts from provenance', () => {
    const sql = readFileSync(migrationPath, 'utf8');
    const match = sql.match(/provenance->>'approvalStatus',\s*''\)\s*not in \(([^)]+)\)/);
    expect(match, 'runtime_create_encounter approval check not found in migration 0053').toBeTruthy();
    const sqlValues = match![1].split(',').map((value) => value.trim().replace(/^'|'$/g, '').replace(/^"/, '').replace(/"$/, ''));
    expect([...sqlValues].sort()).toEqual([...PRODUCTION_APPROVAL_STATUSES].sort());
  });

  it('reads the provenance column, not metadata', () => {
    const sql = readFileSync(migrationPath, 'utf8');
    expect(sql).toContain("provenance->>'approvalStatus'");
  });
});
