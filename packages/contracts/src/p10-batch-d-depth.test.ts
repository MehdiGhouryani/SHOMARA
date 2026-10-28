import { describe, expect, it } from 'vitest';
import { P10_BATCH_D_DEPTH, p10BatchDDepthViolations } from './p10-batch-d-depth';
describe('P10 Batch D depth', () => { it('ok', () => { expect(p10BatchDDepthViolations()).toEqual([]); expect(P10_BATCH_D_DEPTH).toHaveLength(5); }); });
