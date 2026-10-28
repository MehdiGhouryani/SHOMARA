/**
 * P09 — World + long-term progression layer on top of the existing 25-station path.
 *
 * Rules:
 * - Path remains the real progression surface (G1_STATIONS / G1_UNITS).
 * - Worlds map 1:1 to units; no parallel curriculum.
 * - World completion is derived from authoritative station passes only.
 * - World challenges are synthesis practice, never mastery / station-pass replacements.
 * - No fake local unlocks.
 */
import { G1_STATIONS, G1_UNITS, type UnitDefinition } from './progression';

export const WORLD_ENGINE_VERSION = '2026-10-05-p09-v1' as const;

export type WorldStatus = 'LOCKED' | 'CURRENT' | 'COMPLETED';

export interface WorldDefinition {
  id: string;
  code: string;
  number: number;
  unitId: string;
  titleFa: string;
  storyArcFa: string;
  accentToken: 'primary' | 'violet' | 'teal' | 'secondary' | 'coral';
  stationIds: readonly string[];
  /** Synthesis challenge code (P04 engine); content depth expands in P10. */
  worldChallengeCode: string;
  completionRewardCode: string;
  collectibleSetCode: string;
}

const WORLD_META: readonly {
  titleFa: string;
  storyArcFa: string;
  accentToken: WorldDefinition['accentToken'];
}[] = [
  { titleFa: 'دره‌ی عددها', storyArcFa: 'شمارش، جهت و شکل‌های آشنا را پیدا کن.', accentToken: 'primary' },
  { titleFa: 'جنگل اندازه‌ها', storyArcFa: 'اندازه بگیر، مقایسه کن و عددهای تازه بساز.', accentToken: 'violet' },
  { titleFa: 'رودخانه‌ی مسئله', storyArcFa: 'جمع و تفریق را در مسئله‌های واقعی به کار ببر.', accentToken: 'teal' },
  { titleFa: 'قله‌ی زمان', storyArcFa: 'زمان، الگو و عددهای بزرگ‌تر را کشف کن.', accentToken: 'secondary' },
  { titleFa: 'دشت اندازه‌گیری', storyArcFa: 'اندازه‌گیری و مسئله‌های چندمرحله‌ای را تمام کن.', accentToken: 'coral' },
] as const;

export const G1_WORLDS: readonly WorldDefinition[] = G1_UNITS.map((unit, index) => {
  const meta = WORLD_META[index] ?? WORLD_META[0]!;
  const stationIds = G1_STATIONS.filter((s) => s.unitId === unit.id).map((s) => s.id);
  return {
    id: `G1-W0${unit.number}`,
    code: `G1-WORLD-${unit.number}`,
    number: unit.number,
    unitId: unit.id,
    titleFa: meta.titleFa,
    storyArcFa: meta.storyArcFa,
    accentToken: meta.accentToken,
    stationIds,
    worldChallengeCode: `G1-WCH-${unit.number}`,
    completionRewardCode: `G1-R-WORLD-${unit.number}`,
    collectibleSetCode: `G1-COLLECT-W${unit.number}`,
  };
});

export interface WorldChallengeDefinition {
  code: string;
  worldId: string;
  titleFa: string;
  objectiveFa: string;
  /** Synthesis loop — not mastery. */
  phases: readonly ['RECALL', 'USE', 'COMBINE', 'DECIDE', 'CELEBRATE'];
  skillCoverageNoteFa: string;
  isMasteryCheck: false;
  countsTowardStationPass: false;
  /** Wired to P04 challenge engine when content exists (P10 expands). */
  challengeEngineReady: boolean;
}

export const G1_WORLD_CHALLENGES: readonly WorldChallengeDefinition[] = G1_WORLDS.map((w) => ({
  code: w.worldChallengeCode,
  worldId: w.id,
  titleFa: `چالش ${w.titleFa}`,
  objectiveFa: 'چیزهایی که در این دنیا یاد گرفتی را با هم ترکیب کن.',
  phases: ['RECALL', 'USE', 'COMBINE', 'DECIDE', 'CELEBRATE'] as const,
  skillCoverageNoteFa: `پوشش مهارت‌های ${w.unitId}؛ ارزیابی آموزشی در P10 نهایی می‌شود.`,
  isMasteryCheck: false as const,
  countsTowardStationPass: false as const,
  /** Scaffold only until P10 station/world content batches land. */
  challengeEngineReady: false,
}));

export interface WorldProgressView {
  worldId: string;
  code: string;
  number: number;
  unitId: string;
  titleFa: string;
  storyArcFa: string;
  accentToken: WorldDefinition['accentToken'];
  status: WorldStatus;
  stationsCompleted: number;
  stationsTotal: number;
  /** True only when every station in the world has authoritative pass. */
  completed: boolean;
  completionRewardCode: string;
  worldChallengeCode: string;
  worldChallengeReady: boolean;
  whatChangedFa: string | null;
}

export interface WorldsProjection {
  engineVersion: string;
  worlds: WorldProgressView[];
  currentWorldId: string | null;
  completedWorldCount: number;
  /** Path remains primary; worlds are a narrative layer only. */
  pathIsPrimarySurface: true;
  setsMastery: false;
  inventsLocalUnlocks: false;
}

export function worldByUnitId(unitId: string): WorldDefinition | null {
  return G1_WORLDS.find((w) => w.unitId === unitId) ?? null;
}

export function deriveWorldStatus(
  world: WorldDefinition,
  passedStationIds: ReadonlySet<string>,
  previousWorldCompleted: boolean,
): WorldStatus {
  const completed = world.stationIds.every((id) => passedStationIds.has(id));
  if (completed) return 'COMPLETED';
  if (!previousWorldCompleted && world.number > 1) {
    // Still allow CURRENT if any station in this world is already available via path
    // (jump / sequential). Status CURRENT if at least one station passed or it's world 1 path head.
    const any = world.stationIds.some((id) => passedStationIds.has(id));
    if (any) return 'CURRENT';
    return 'LOCKED';
  }
  return 'CURRENT';
}

export function buildWorldsProjection(passedStationIds: readonly string[]): WorldsProjection {
  const passed = new Set(passedStationIds);
  let previousCompleted = true;
  const worlds: WorldProgressView[] = [];

  for (const world of G1_WORLDS) {
    const stationsCompleted = world.stationIds.filter((id) => passed.has(id)).length;
    const completed = stationsCompleted === world.stationIds.length && world.stationIds.length > 0;
    const status = deriveWorldStatus(world, passed, previousCompleted);
    const challenge = G1_WORLD_CHALLENGES.find((c) => c.worldId === world.id);

    worlds.push({
      worldId: world.id,
      code: world.code,
      number: world.number,
      unitId: world.unitId,
      titleFa: world.titleFa,
      storyArcFa: world.storyArcFa,
      accentToken: world.accentToken,
      status,
      stationsCompleted,
      stationsTotal: world.stationIds.length,
      completed,
      completionRewardCode: world.completionRewardCode,
      worldChallengeCode: world.worldChallengeCode,
      worldChallengeReady: challenge?.challengeEngineReady ?? false,
      whatChangedFa: completed
        ? `${world.titleFa} کامل شد. مجموعه‌ی ${world.collectibleSetCode} و پاداش دنیا باز می‌شود.`
        : status === 'CURRENT'
          ? `${stationsCompleted} از ${world.stationIds.length} ایستگاه این دنیا`
          : null,
    });

    previousCompleted = completed;
  }

  const current = worlds.find((w) => w.status === 'CURRENT') ?? worlds.find((w) => !w.completed) ?? null;

  return {
    engineVersion: WORLD_ENGINE_VERSION,
    worlds,
    currentWorldId: current?.worldId ?? null,
    completedWorldCount: worlds.filter((w) => w.completed).length,
    pathIsPrimarySurface: true,
    setsMastery: false,
    inventsLocalUnlocks: false,
  };
}

export function worldCatalogViolations(
  worlds: readonly WorldDefinition[] = G1_WORLDS,
  units: readonly UnitDefinition[] = G1_UNITS,
): string[] {
  const v: string[] = [];
  if (worlds.length !== units.length) v.push(`WORLD_UNIT_COUNT_MISMATCH:${worlds.length}/${units.length}`);
  for (const w of worlds) {
    const unit = units.find((u) => u.id === w.unitId);
    if (!unit) v.push(`MISSING_UNIT:${w.unitId}`);
    else {
      const expected = G1_STATIONS.filter((s) => s.unitId === unit.id).map((s) => s.id);
      if (w.stationIds.join(',') !== expected.join(',')) v.push(`STATION_MISMATCH:${w.code}`);
    }
    if (w.stationIds.length === 0) v.push(`EMPTY_WORLD:${w.code}`);
  }
  for (const c of G1_WORLD_CHALLENGES) {
    if (c.isMasteryCheck) v.push(`MASTERY_CHALLENGE:${c.code}`);
    if (c.countsTowardStationPass) v.push(`STATION_PASS_CHALLENGE:${c.code}`);
  }
  return v;
}
