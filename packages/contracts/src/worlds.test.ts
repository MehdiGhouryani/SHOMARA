import { describe, expect, it } from 'vitest';
import {
  G1_WORLDS,
  G1_WORLD_CHALLENGES,
  buildWorldsProjection,
  worldCatalogViolations,
  WORLD_ENGINE_VERSION,
} from './worlds';
import { G1_UNITS } from './progression';

describe('P09 worlds catalog', () => {
  it('maps one world per unit with matching stations', () => {
    expect(worldCatalogViolations()).toEqual([]);
    expect(G1_WORLDS).toHaveLength(G1_UNITS.length);
  });

  it('never treats world challenges as mastery', () => {
    expect(G1_WORLD_CHALLENGES.every((c) => c.isMasteryCheck === false)).toBe(true);
    expect(G1_WORLD_CHALLENGES.every((c) => c.countsTowardStationPass === false)).toBe(true);
  });
});

describe('buildWorldsProjection', () => {
  it('derives completion only from passed stations', () => {
    const p = buildWorldsProjection(['ST01', 'ST02', 'ST03', 'ST04', 'ST05']);
    expect(p.engineVersion).toBe(WORLD_ENGINE_VERSION);
    expect(p.pathIsPrimarySurface).toBe(true);
    expect(p.setsMastery).toBe(false);
    expect(p.inventsLocalUnlocks).toBe(false);
    expect(p.worlds[0]?.completed).toBe(true);
    expect(p.worlds[0]?.status).toBe('COMPLETED');
    expect(p.worlds[0]?.whatChangedFa).toContain('کامل');
    expect(p.completedWorldCount).toBe(1);
  });

  it('does not invent completion without stations', () => {
    const p = buildWorldsProjection([]);
    expect(p.completedWorldCount).toBe(0);
    expect(p.worlds.every((w) => !w.completed)).toBe(true);
  });
});
