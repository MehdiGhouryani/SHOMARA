/**
 * P08 — Character customization + cosmetic collection.
 *
 * Guardrails:
 * - Child avatar identity is separate from companion cast (aria/qbo/dana/jiko).
 * - Ownership comes only from authoritative inventory grants (P07) or free starter items.
 * - Locked items must never appear as earned.
 * - Save/cancel are explicit; draft ≠ committed appearance.
 * - No randomized valuable unlocks in V1; no money value.
 */
import type { ChildAvatarPresetId } from './onboarding';
import { CHILD_AVATAR_PRESETS } from './onboarding';
import type { RewardType } from './engagement';

export const AVATAR_CUSTOMIZATION_VERSION = '2026-10-05-p08-v1' as const;

export type CosmeticCategory =
  | 'BASE_PRESET'
  | 'OUTFIT'
  | 'HAT'
  | 'ACCESSORY'
  | 'BACKGROUND';

export type CosmeticUnlockSource =
  | 'STARTER' // always owned
  | 'INVENTORY_GRANT'; // requires matching rewardCode in inventory

export interface CosmeticItemDefinition {
  id: string;
  code: string;
  category: CosmeticCategory;
  titleFa: string;
  descriptionFa: string;
  /** Maps to ChildAvatarPresetId when category is BASE_PRESET. */
  presetId: ChildAvatarPresetId | null;
  /** Reward catalog code required to own (null = starter). */
  requiredRewardCode: string | null;
  unlockSource: CosmeticUnlockSource;
  visualAssetRef: string;
  status: 'ACTIVE' | 'RETIRED';
}

export interface AvatarAppearance {
  basePresetId: ChildAvatarPresetId;
  outfitId: string | null;
  hatId: string | null;
  accessoryId: string | null;
  backgroundId: string | null;
  updatedAt: string | null;
}

export const DEFAULT_AVATAR_APPEARANCE: AvatarAppearance = {
  basePresetId: 'sun',
  outfitId: 'cosmetic-outfit-default',
  hatId: null,
  accessoryId: null,
  backgroundId: 'cosmetic-bg-default',
  updatedAt: null,
};

/** Starter + unlockable cosmetics. Unlockables use CHARACTER_COSMETIC rewards from P07 ledger. */
export const G1_COSMETIC_CATALOG: readonly CosmeticItemDefinition[] = [
  // Base presets (always owned — identity, not commerce)
  ...CHILD_AVATAR_PRESETS.map((p) => ({
    id: `cosmetic-base-${p.id}`,
    code: `G1-COS-BASE-${p.id.toUpperCase()}`,
    category: 'BASE_PRESET' as const,
    titleFa: p.label,
    descriptionFa: 'ظاهر پایه‌ی آواتار',
    presetId: p.id,
    requiredRewardCode: null,
    unlockSource: 'STARTER' as const,
    visualAssetRef: `avatar/base/${p.id}`,
    status: 'ACTIVE' as const,
  })),
  // Outfits
  {
    id: 'cosmetic-outfit-default',
    code: 'G1-COS-OUTFIT-DEFAULT',
    category: 'OUTFIT',
    titleFa: 'لباس ساده',
    descriptionFa: 'لباس شروع',
    presetId: null,
    requiredRewardCode: null,
    unlockSource: 'STARTER',
    visualAssetRef: 'avatar/outfit/default',
    status: 'ACTIVE',
  },
  {
    id: 'cosmetic-outfit-star',
    code: 'G1-COS-OUTFIT-STAR',
    category: 'OUTFIT',
    titleFa: 'لباس ستاره‌ای',
    descriptionFa: 'با نشان پیشرفت مسیر باز می‌شود',
    presetId: null,
    requiredRewardCode: 'G1-R-COS-OUTFIT-STAR',
    unlockSource: 'INVENTORY_GRANT',
    visualAssetRef: 'avatar/outfit/star',
    status: 'ACTIVE',
  },
  // Hats
  {
    id: 'cosmetic-hat-none',
    code: 'G1-COS-HAT-NONE',
    category: 'HAT',
    titleFa: 'بدون کلاه',
    descriptionFa: 'پیش‌فرض',
    presetId: null,
    requiredRewardCode: null,
    unlockSource: 'STARTER',
    visualAssetRef: 'avatar/hat/none',
    status: 'ACTIVE',
  },
  {
    id: 'cosmetic-hat-explorer',
    code: 'G1-COS-HAT-EXPLORER',
    category: 'HAT',
    titleFa: 'کلاه کاشف',
    descriptionFa: 'با اولین چالش ویژه',
    presetId: null,
    requiredRewardCode: 'G1-R-COS-HAT-EXPLORER',
    unlockSource: 'INVENTORY_GRANT',
    visualAssetRef: 'avatar/hat/explorer',
    status: 'ACTIVE',
  },
  // Accessories
  {
    id: 'cosmetic-acc-none',
    code: 'G1-COS-ACC-NONE',
    category: 'ACCESSORY',
    titleFa: 'بدون وسیله',
    descriptionFa: 'پیش‌فرض',
    presetId: null,
    requiredRewardCode: null,
    unlockSource: 'STARTER',
    visualAssetRef: 'avatar/accessory/none',
    status: 'ACTIVE',
  },
  {
    id: 'cosmetic-acc-badge',
    code: 'G1-COS-ACC-BADGE',
    category: 'ACCESSORY',
    titleFa: 'نشان مسیر',
    descriptionFa: 'با نشان پیشرفت',
    presetId: null,
    requiredRewardCode: 'G1-R-BADGE-MILESTONE',
    unlockSource: 'INVENTORY_GRANT',
    visualAssetRef: 'avatar/accessory/badge',
    status: 'ACTIVE',
  },
  // Backgrounds
  {
    id: 'cosmetic-bg-default',
    code: 'G1-COS-BG-DEFAULT',
    category: 'BACKGROUND',
    titleFa: 'پس‌زمینه ساده',
    descriptionFa: 'پیش‌فرض',
    presetId: null,
    requiredRewardCode: null,
    unlockSource: 'STARTER',
    visualAssetRef: 'avatar/bg/default',
    status: 'ACTIVE',
  },
  {
    id: 'cosmetic-bg-pattern',
    code: 'G1-COS-BG-PATTERN',
    category: 'BACKGROUND',
    titleFa: 'پس‌زمینه الگو',
    descriptionFa: 'با برچسب مسیر الگو',
    presetId: null,
    requiredRewardCode: 'G1-R-ST01-CH',
    unlockSource: 'INVENTORY_GRANT',
    visualAssetRef: 'avatar/bg/pattern',
    status: 'ACTIVE',
  },
] as const;

/** Cosmetic reward definitions to seed into reward_catalog (CHARACTER_COSMETIC class). */
export const G1_COSMETIC_REWARDS: readonly {
  code: string;
  type: RewardType;
  titleFa: string;
  payload: Record<string, unknown>;
}[] = [
  { code: 'G1-R-COS-OUTFIT-STAR', type: 'CHARACTER_COSMETIC', titleFa: 'لباس ستاره‌ای', payload: { cosmeticId: 'cosmetic-outfit-star', assetRef: 'avatar/outfit/star' } },
  { code: 'G1-R-COS-HAT-EXPLORER', type: 'CHARACTER_COSMETIC', titleFa: 'کلاه کاشف', payload: { cosmeticId: 'cosmetic-hat-explorer', assetRef: 'avatar/hat/explorer' } },
];

export const COSMETIC_CATEGORIES: readonly { id: CosmeticCategory; titleFa: string }[] = [
  { id: 'BASE_PRESET', titleFa: 'چهره' },
  { id: 'OUTFIT', titleFa: 'لباس' },
  { id: 'HAT', titleFa: 'کلاه' },
  { id: 'ACCESSORY', titleFa: 'وسیله' },
  { id: 'BACKGROUND', titleFa: 'پس‌زمینه' },
] as const;

export function isCosmeticOwned(
  item: CosmeticItemDefinition,
  ownedRewardCodes: ReadonlySet<string>,
): boolean {
  if (item.status !== 'ACTIVE') return false;
  if (item.unlockSource === 'STARTER' || item.requiredRewardCode == null) return true;
  return ownedRewardCodes.has(item.requiredRewardCode);
}

export function ownedCosmetics(
  ownedRewardCodes: readonly string[],
  catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG,
): CosmeticItemDefinition[] {
  const set = new Set(ownedRewardCodes);
  return catalog.filter((c) => c.status === 'ACTIVE' && isCosmeticOwned(c, set));
}

export function cosmeticsByCategory(
  category: CosmeticCategory,
  catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG,
): CosmeticItemDefinition[] {
  return catalog.filter((c) => c.status === 'ACTIVE' && c.category === category);
}

/** Reject equipping items the learner does not own. Returns sanitized appearance. */
export function sanitizeAppearance(
  draft: AvatarAppearance,
  ownedRewardCodes: readonly string[],
  catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG,
): { appearance: AvatarAppearance; rejected: string[] } {
  const set = new Set(ownedRewardCodes);
  const rejected: string[] = [];
  const allow = (id: string | null): string | null => {
    if (id == null) return null;
    const item = catalog.find((c) => c.id === id);
    if (!item || !isCosmeticOwned(item, set)) {
      rejected.push(id);
      return null;
    }
    return id;
  };

  const baseOk = catalog.some(
    (c) => c.category === 'BASE_PRESET' && c.presetId === draft.basePresetId && isCosmeticOwned(c, set),
  );
  const basePresetId = baseOk ? draft.basePresetId : DEFAULT_AVATAR_APPEARANCE.basePresetId;
  if (!baseOk) rejected.push(`base:${draft.basePresetId}`);

  return {
    appearance: {
      basePresetId,
      outfitId: allow(draft.outfitId) ?? DEFAULT_AVATAR_APPEARANCE.outfitId,
      hatId: allow(draft.hatId),
      accessoryId: allow(draft.accessoryId),
      backgroundId: allow(draft.backgroundId) ?? DEFAULT_AVATAR_APPEARANCE.backgroundId,
      updatedAt: draft.updatedAt,
    },
    rejected,
  };
}

export interface AvatarWorkshopItemView {
  id: string;
  code: string;
  category: CosmeticCategory;
  titleFa: string;
  descriptionFa: string;
  owned: boolean;
  equipped: boolean;
  visualAssetRef: string;
  /** Never true for locked items — UI must not treat locked as earned. */
  lockedLabelFa: string | null;
}

export interface AvatarWorkshopProjection {
  engineVersion: string;
  appearance: AvatarAppearance;
  categories: readonly { id: CosmeticCategory; titleFa: string }[];
  items: AvatarWorkshopItemView[];
  /** Companion cast ids must not appear as equippable child cosmetics. */
  companionCastExcluded: true;
  setsMastery: false;
  impliesMoneyValue: false;
}

export function buildAvatarWorkshopProjection(
  appearance: AvatarAppearance,
  ownedRewardCodes: readonly string[],
  catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG,
): AvatarWorkshopProjection {
  const set = new Set(ownedRewardCodes);
  const equippedIds = new Set(
    [appearance.outfitId, appearance.hatId, appearance.accessoryId, appearance.backgroundId].filter(Boolean) as string[],
  );
  const items: AvatarWorkshopItemView[] = catalog
    .filter((c) => c.status === 'ACTIVE')
    .map((c) => {
      const owned = isCosmeticOwned(c, set);
      const equipped =
        c.category === 'BASE_PRESET'
          ? c.presetId === appearance.basePresetId
          : equippedIds.has(c.id);
      return {
        id: c.id,
        code: c.code,
        category: c.category,
        titleFa: c.titleFa,
        descriptionFa: c.descriptionFa,
        owned,
        equipped: owned && equipped,
        visualAssetRef: c.visualAssetRef,
        lockedLabelFa: owned ? null : 'با پیشرفت مسیر باز می‌شود — خریدنی نیست',
      };
    });

  return {
    engineVersion: AVATAR_CUSTOMIZATION_VERSION,
    appearance,
    categories: COSMETIC_CATEGORIES,
    items,
    companionCastExcluded: true,
    setsMastery: false,
    impliesMoneyValue: false,
  };
}

export function cosmeticCatalogViolations(catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG): string[] {
  const v: string[] = [];
  const ids = new Set<string>();
  for (const c of catalog) {
    if (ids.has(c.id)) v.push(`DUPLICATE:${c.id}`);
    ids.add(c.id);
    if (c.unlockSource === 'INVENTORY_GRANT' && !c.requiredRewardCode) v.push(`MISSING_REWARD:${c.id}`);
    if (c.category === 'BASE_PRESET' && !c.presetId) v.push(`MISSING_PRESET:${c.id}`);
  }
  return v;
}

/** Map a single category selection into an appearance patch. */
export function applyCategorySelection(
  current: AvatarAppearance,
  category: CosmeticCategory,
  itemId: string,
  ownedRewardCodes: readonly string[],
  catalog: readonly CosmeticItemDefinition[] = G1_COSMETIC_CATALOG,
): AvatarAppearance {
  const item = catalog.find((c) => c.id === itemId && c.category === category);
  if (!item || !isCosmeticOwned(item, new Set(ownedRewardCodes))) return current;
  if (category === 'BASE_PRESET' && item.presetId) {
    return { ...current, basePresetId: item.presetId };
  }
  if (category === 'OUTFIT') return { ...current, outfitId: item.id };
  if (category === 'HAT') return { ...current, hatId: item.id === 'cosmetic-hat-none' ? null : item.id };
  if (category === 'ACCESSORY') return { ...current, accessoryId: item.id === 'cosmetic-acc-none' ? null : item.id };
  if (category === 'BACKGROUND') return { ...current, backgroundId: item.id };
  return current;
}
