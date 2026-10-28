/**
 * P07 — Achievement registry + Reward grant + Collection/Inventory projection.
 *
 * Guardrails (P01-C/D, ADR engagement):
 * - unlock once per learning identity; never revoked; achievement ≠ mastery;
 * - grants are idempotent by deterministic key; offline replay cannot double-grant;
 * - inventory is reconstructable from authoritative grants only;
 * - no child-facing price/gem/balance; STAR_PROGRESS is a meter, not currency;
 * - presentation (seen by child) is separate from grant (server fact).
 *
 * The old `CHILD_ACHIEVEMENTS` (A01–A05) remain as a compatibility presentation
 * list in product-surface.ts; authoritative unlocks live here + migration 0059.
 */
import type { AchievementFamily } from './engagement-policy';
import { ACHIEVEMENT_FAMILIES, ACHIEVEMENT_MILESTONE_THRESHOLDS, REWARD_ECONOMY_V1, isRewardAllowedForSource, rewardDefinitionViolations } from './engagement-policy';
import type { RewardSourceType, RewardType } from './engagement';
import { rewardGrantKeyString } from './engagement';
import { G1_STATIONS } from './progression';
import { ST01_ACHIEVEMENT, ST01_CHALLENGE_CODE, ST01_CHALLENGE_REWARD_CODE } from './st01-slice';

export const COLLECTION_ENGINE_VERSION = '2026-10-05-p07-v1' as const;

// ---------------------------------------------------------------------------
// Achievement registry
// ---------------------------------------------------------------------------

export type AchievementTriggerType =
  | 'STATION_COMPLETED'
  | 'CHALLENGE_COMPLETED'
  | 'FAMILY_MILESTONE';

export interface AchievementDefinitionV1 {
  id: string;
  code: string;
  version: number;
  family: AchievementFamily;
  titleFa: string;
  descriptionFa: string;
  /** Visual asset ref only — never implies mastery. */
  visualAssetRef: string;
  trigger: {
    type: AchievementTriggerType;
    /** Station short id (ST01) or challenge code or family name. */
    targetRef: string | null;
    count: number;
  };
  /** Optional reward granted once on unlock. */
  rewardCode: string | null;
  impliesMastery: false;
  status: 'ACTIVE' | 'RETIRED';
}

const achId = (n: number) => `2f070000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** Path achievements: one per Grade 1 station (replaces hardcoded A01–A05 as the long-term model). */
export const G1_PATH_ACHIEVEMENTS: readonly AchievementDefinitionV1[] = G1_STATIONS.map((station, index) => {
  const short = station.id; // ST01 …
  const titles: Record<string, string> = {
    ST01: 'شمارش‌گر',
    ST02: 'جهت‌یاب',
    ST03: 'عددساز',
    ST04: 'شکل‌شناس',
    ST05: 'حسابگر',
  };
  return {
    id: achId(100 + index + 1),
    code: `G1-A-PATH-${short}`,
    version: 1,
    family: 'PATH' as const,
    titleFa: titles[short] ?? `پیشرفت ${short}`,
    descriptionFa: `ایستگاه ${short} را کامل کن.`,
    visualAssetRef: `achievement/path/${short.toLowerCase()}`,
    trigger: { type: 'STATION_COMPLETED' as const, targetRef: short, count: 1 },
    rewardCode: null,
    impliesMastery: false as const,
    status: 'ACTIVE' as const,
  };
});

/** Challenge family — first completion (ST01 seed preserved). */
export const G1_CHALLENGE_ACHIEVEMENTS: readonly AchievementDefinitionV1[] = [
  {
    id: achId(201),
    code: ST01_ACHIEVEMENT.code,
    version: 1,
    family: 'CHALLENGE',
    titleFa: ST01_ACHIEVEMENT.titleFa,
    descriptionFa: ST01_ACHIEVEMENT.childDescription,
    visualAssetRef: ST01_ACHIEVEMENT.visualAssetRef,
    trigger: { type: 'CHALLENGE_COMPLETED', targetRef: ST01_CHALLENGE_CODE, count: 1 },
    rewardCode: ST01_CHALLENGE_REWARD_CODE,
    impliesMastery: false,
    status: 'ACTIVE',
  },
];

/** Family milestone badges (thresholds from engagement-policy). */
export const G1_MILESTONE_ACHIEVEMENTS: readonly AchievementDefinitionV1[] = (['PATH', 'CHALLENGE'] as const).flatMap((family, fi) =>
  ACHIEVEMENT_MILESTONE_THRESHOLDS[family].map((threshold, ti) => ({
    id: achId(300 + fi * 10 + ti + 1),
    code: `G1-A-MILESTONE-${family}-${threshold}`,
    version: 1,
    family,
    titleFa: family === 'PATH' ? `مسیر ${threshold}` : `چالش ${threshold}`,
    descriptionFa: family === 'PATH' ? `${threshold} ایستگاه را کامل کرده‌ای.` : `${threshold} چالش ویژه را کامل کرده‌ای.`,
    visualAssetRef: `achievement/milestone/${family.toLowerCase()}-${threshold}`,
    trigger: { type: 'FAMILY_MILESTONE' as const, targetRef: family, count: threshold },
    rewardCode: 'G1-R-BADGE-MILESTONE' as string | null,
    impliesMastery: false as const,
    status: 'ACTIVE' as const,
  })),
);

export const G1_ACHIEVEMENT_CATALOG: readonly AchievementDefinitionV1[] = [
  ...G1_PATH_ACHIEVEMENTS,
  ...G1_CHALLENGE_ACHIEVEMENTS,
  ...G1_MILESTONE_ACHIEVEMENTS,
];

// ---------------------------------------------------------------------------
// Reward catalog (V1 classes only)
// ---------------------------------------------------------------------------

export interface CollectionRewardDefinition {
  code: string;
  type: RewardType;
  titleFa: string;
  descriptionFa: string;
  payload: Record<string, unknown>;
  status: 'ACTIVE' | 'RETIRED';
}

export const G1_COLLECTION_REWARDS: readonly CollectionRewardDefinition[] = [
  { code: 'G1-R-001', type: 'STAR_PROGRESS', titleFa: 'ستاره‌ی پیشرفت', descriptionFa: 'یک قدم در مسیر.', payload: { meter: 'PATH_PROGRESS', assetRef: 'reward/star-progress' }, status: 'ACTIVE' },
  { code: 'G1-R-002', type: 'STICKER', titleFa: 'برچسب تازه', descriptionFa: 'برچسب مجموعه.', payload: { sticker: 'PATTERN', assetRef: 'sticker/pattern' }, status: 'ACTIVE' },
  { code: 'G1-R-003', type: 'CHARACTER_REACTION', titleFa: 'تشویق دوست', descriptionFa: 'یک تشویق از همراهت.', payload: { reaction: 'CHEER', assetRef: 'reaction/cheer' }, status: 'ACTIVE' },
  { code: ST01_CHALLENGE_REWARD_CODE, type: 'STICKER', titleFa: 'برچسب مسیر الگو', descriptionFa: 'چون الگوها را ادامه دادی.', payload: { sticker: 'PATTERN_PATH', assetRef: 'sticker/pattern-path' }, status: 'ACTIVE' },
  { code: 'G1-R-BADGE-MILESTONE', type: 'MILESTONE_BADGE', titleFa: 'نشان پیشرفت', descriptionFa: 'یک نشان برای مسیرت.', payload: { badge: 'MILESTONE', assetRef: 'badge/milestone' }, status: 'ACTIVE' },
];

// ---------------------------------------------------------------------------
// Pure evaluation
// ---------------------------------------------------------------------------

export interface AchievementUnlockRecord {
  definitionCode: string;
  unlockedAt: string;
  rewardGrantKey: string | null;
}

export interface InventoryGrantRecord {
  idempotencyKey: string;
  rewardCode: string;
  rewardType: RewardType;
  sourceType: RewardSourceType;
  sourceRef: string;
  grantedAt: string;
  presentedAt: string | null;
}

export interface CollectionFacts {
  learningIdentityId: string;
  /** Station short ids that have authoritative pass (e.g. ST01). */
  passedStationIds: readonly string[];
  /** Challenge codes with at least one successful completion. */
  completedChallengeCodes: readonly string[];
  /** Existing unlocks (idempotent merge). */
  existingUnlocks: readonly AchievementUnlockRecord[];
  /** Existing grants (idempotent merge). */
  existingGrants: readonly InventoryGrantRecord[];
  nowIso: string;
}

export function achievementUnlockKey(learningIdentityId: string, code: string): string {
  return `${learningIdentityId}:ACHIEVEMENT:${code}`;
}

export function deriveAchievementUnlocks(
  facts: CollectionFacts,
  catalog: readonly AchievementDefinitionV1[] = G1_ACHIEVEMENT_CATALOG,
): AchievementUnlockRecord[] {
  const byCode = new Map(facts.existingUnlocks.map((u) => [u.definitionCode, u]));
  const pathCount = facts.passedStationIds.length;
  const challengeCount = facts.completedChallengeCodes.length;

  for (const def of catalog) {
    if (def.status !== 'ACTIVE' || byCode.has(def.code)) continue;
    let ok = false;
    if (def.trigger.type === 'STATION_COMPLETED' && def.trigger.targetRef) {
      ok = facts.passedStationIds.includes(def.trigger.targetRef);
    } else if (def.trigger.type === 'CHALLENGE_COMPLETED') {
      if (def.trigger.targetRef) ok = facts.completedChallengeCodes.includes(def.trigger.targetRef);
      else ok = challengeCount >= def.trigger.count;
    } else if (def.trigger.type === 'FAMILY_MILESTONE' && def.trigger.targetRef) {
      const n = def.trigger.targetRef === 'PATH' ? pathCount : def.trigger.targetRef === 'CHALLENGE' ? challengeCount : 0;
      ok = n >= def.trigger.count;
    }
    if (!ok) continue;
    const sourceType: RewardSourceType =
      def.family === 'CHALLENGE' ? 'CHALLENGE_COMPLETION' :
      def.trigger.type === 'FAMILY_MILESTONE' ? 'MILESTONE' :
      'LEARNING_ACHIEVEMENT';
    const rewardGrantKey = def.rewardCode
      ? rewardGrantKeyString({
          learningIdentityId: facts.learningIdentityId,
          sourceType,
          sourceRef: def.code,
          rewardDefinitionId: def.rewardCode,
        })
      : null;
    byCode.set(def.code, { definitionCode: def.code, unlockedAt: facts.nowIso, rewardGrantKey });
  }
  return [...byCode.values()];
}

export function deriveAchievementRewardGrants(
  learningIdentityId: string,
  unlocks: readonly AchievementUnlockRecord[],
  catalog: readonly AchievementDefinitionV1[] = G1_ACHIEVEMENT_CATALOG,
  rewards: readonly CollectionRewardDefinition[] = G1_COLLECTION_REWARDS,
  existing: readonly InventoryGrantRecord[] = [],
  nowIso: string,
): InventoryGrantRecord[] {
  const byKey = new Map(existing.map((g) => [g.idempotencyKey, g]));
  for (const unlock of unlocks) {
    const def = catalog.find((d) => d.code === unlock.definitionCode);
    if (!def?.rewardCode || !unlock.rewardGrantKey) continue;
    const reward = rewards.find((r) => r.code === def.rewardCode);
    if (!reward || reward.status !== 'ACTIVE') continue;
    const sourceType: RewardSourceType =
      def.family === 'CHALLENGE' ? 'CHALLENGE_COMPLETION' :
      def.trigger.type === 'FAMILY_MILESTONE' ? 'MILESTONE' :
      'LEARNING_ACHIEVEMENT';
    if (!isRewardAllowedForSource(sourceType, reward.type)) continue;
    if (byKey.has(unlock.rewardGrantKey)) continue;
    byKey.set(unlock.rewardGrantKey, {
      idempotencyKey: unlock.rewardGrantKey,
      rewardCode: reward.code,
      rewardType: reward.type,
      sourceType,
      sourceRef: def.code,
      grantedAt: nowIso,
      presentedAt: null,
    });
  }
  return [...byKey.values()];
}

export interface CollectionItemView {
  grantId: string;
  rewardCode: string;
  rewardType: RewardType;
  titleFa: string;
  descriptionFa: string;
  sourceType: RewardSourceType;
  grantedAt: string;
  presented: boolean;
}

export interface AchievementView {
  code: string;
  family: AchievementFamily;
  titleFa: string;
  descriptionFa: string;
  visualAssetRef: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface CollectionProjection {
  engineVersion: string;
  achievements: AchievementView[];
  inventory: CollectionItemView[];
  summary: {
    achievementsUnlocked: number;
    achievementsTotal: number;
    inventoryCount: number;
    pendingReveals: number;
  };
  /** Hard product invariants for clients/analytics. */
  setsMastery: false;
  setsStationCompletion: false;
  impliesMoneyValue: false;
}

export function buildCollectionProjection(
  unlocks: readonly AchievementUnlockRecord[],
  grants: readonly InventoryGrantRecord[],
  catalog: readonly AchievementDefinitionV1[] = G1_ACHIEVEMENT_CATALOG,
  rewards: readonly CollectionRewardDefinition[] = G1_COLLECTION_REWARDS,
): CollectionProjection {
  const unlockMap = new Map(unlocks.map((u) => [u.definitionCode, u]));
  const achievements: AchievementView[] = catalog
    .filter((d) => d.status === 'ACTIVE')
    .map((d) => {
      const u = unlockMap.get(d.code);
      return {
        code: d.code,
        family: d.family,
        titleFa: d.titleFa,
        descriptionFa: d.descriptionFa,
        visualAssetRef: d.visualAssetRef,
        unlocked: Boolean(u),
        unlockedAt: u?.unlockedAt ?? null,
      };
    });
  const inventory: CollectionItemView[] = grants.map((g, i) => {
    const reward = rewards.find((r) => r.code === g.rewardCode);
    return {
      grantId: g.idempotencyKey,
      rewardCode: g.rewardCode,
      rewardType: g.rewardType,
      titleFa: reward?.titleFa ?? g.rewardCode,
      descriptionFa: reward?.descriptionFa ?? '',
      sourceType: g.sourceType,
      grantedAt: g.grantedAt,
      presented: g.presentedAt != null,
    };
  });
  return {
    engineVersion: COLLECTION_ENGINE_VERSION,
    achievements,
    inventory,
    summary: {
      achievementsUnlocked: achievements.filter((a) => a.unlocked).length,
      achievementsTotal: achievements.length,
      inventoryCount: inventory.length,
      pendingReveals: inventory.filter((i) => !i.presented).length,
    },
    setsMastery: false,
    setsStationCompletion: false,
    impliesMoneyValue: false,
  };
}

export function acknowledgeInventoryPresentation(
  grants: readonly InventoryGrantRecord[],
  grantId: string,
  nowIso: string,
): InventoryGrantRecord[] {
  return grants.map((g) =>
    g.idempotencyKey === grantId && g.presentedAt == null ? { ...g, presentedAt: nowIso } : g,
  );
}

export function achievementCatalogViolations(catalog: readonly AchievementDefinitionV1[] = G1_ACHIEVEMENT_CATALOG): string[] {
  const violations: string[] = [];
  const codes = new Set<string>();
  for (const def of catalog) {
    if (codes.has(def.code)) violations.push(`DUPLICATE_CODE:${def.code}`);
    codes.add(def.code);
    if (def.impliesMastery !== false) violations.push(`IMPLIES_MASTERY:${def.code}`);
    if (!ACHIEVEMENT_FAMILIES.includes(def.family)) violations.push(`BAD_FAMILY:${def.code}`);
    if (def.trigger.count < 1) violations.push(`BAD_COUNT:${def.code}`);
  }
  return violations;
}

export function collectionRewardViolations(rewards: readonly CollectionRewardDefinition[] = G1_COLLECTION_REWARDS): string[] {
  const violations: string[] = [];
  for (const r of rewards) {
    if (!REWARD_ECONOMY_V1.rewardClasses.includes(r.type)) violations.push(`FORBIDDEN_CLASS:${r.code}`);
    violations.push(...rewardDefinitionViolations({ type: r.type, payload: r.payload }).map((v) => `${r.code}:${v}`));
  }
  return violations;
}

/** Compatibility: map path achievements to the old A01–A05 station list for UI that still expects stationId. */
export function pathAchievementStationId(code: string): string | null {
  const m = /^G1-A-PATH-(ST\d+)$/.exec(code);
  return m?.[1] ?? null;
}
