import { describe, expect, it } from 'vitest';
import { P10_BATCH_C_DEPTH, p10BatchCDepthViolations } from './p10-batch-c-depth';
describe('P10 Batch C depth', () => { it('ok', () => { expect(p10BatchCDepthViolations()).toEqual([]); expect(P10_BATCH_C_DEPTH).toHaveLength(5); }); });
