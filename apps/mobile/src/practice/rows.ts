import { PRACTICE_GAMES, practiceListLimit, type PracticeGameDefinition } from '@math/contracts';

/**
 * The games the practice tab lists: the recommended game first, then `practiceListLimit(gradeId)`
 * SECONDARY games in contract order. The cap counts secondary rows only — the recommended row
 * comes on top of it (u7 counting fix; regression-tested in rows.test.ts, review R-3).
 */
export function practiceRowGames(gradeId: string | undefined, recommended: PracticeGameDefinition): PracticeGameDefinition[] {
  const listCap = practiceListLimit(gradeId);
  const others = PRACTICE_GAMES.filter((g) => g.id !== recommended.id).slice(0, Math.max(listCap, 0));
  return [recommended, ...others];
}
