import { describe, expect, it } from 'vitest';
import { PRACTICE_GAMES, pickRecommendedPractice, practiceListLimit } from '@math/contracts';
import { practiceRowGames } from './rows';

describe('practice row composition (page 13)', () => {
  it('counts the cap on secondary rows only — the recommended row comes on top of it', () => {
    const recommended = PRACTICE_GAMES[0]!;
    const rows = practiceRowGames('G1', recommended);
    expect(practiceListLimit('G1')).toBe(2);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.id).toBe(recommended.id);
    expect(rows.slice(1).map((g) => g.id)).toEqual(PRACTICE_GAMES.slice(1, 3).map((g) => g.id));
  });

  it('grows with the grade band cap, bounded by the catalog', () => {
    const rows = practiceRowGames('G3', PRACTICE_GAMES[0]!);
    expect(practiceListLimit('G3')).toBe(4);
    expect(rows).toHaveLength(Math.min(practiceListLimit('G3') + 1, PRACTICE_GAMES.length));
  });

  it('never repeats the recommended game among the secondary rows', () => {
    for (const recommended of PRACTICE_GAMES) {
      const rows = practiceRowGames('G6', recommended);
      expect(rows.filter((g) => g.id === recommended.id)).toHaveLength(1);
      expect(rows[0]?.id).toBe(recommended.id);
    }
  });

  it('keeps the contract order for the secondary rows', () => {
    const rows = practiceRowGames('G1', PRACTICE_GAMES[1]!);
    expect(rows.slice(1).map((g) => g.id)).toEqual(
      PRACTICE_GAMES.filter((g) => g.id !== PRACTICE_GAMES[1]!.id).slice(0, 2).map((g) => g.id),
    );
  });

  it('composes from the real contract recommendation for a fresh G1 learner', () => {
    const recommended = pickRecommendedPractice({ completedStationIds: [] });
    const rows = practiceRowGames('G1', recommended);
    expect(rows[0]?.id).toBe(recommended.id);
    expect(rows).toHaveLength(practiceListLimit('G1') + 1);
  });
});
