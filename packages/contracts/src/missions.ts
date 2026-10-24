/**
 * P06 — Mission Engine + Mission Hub (Roadmap P06, P01 decisions B-01..B-04, D-02/04/05/06, E-01).
 *
 * One shared, client-safe contract for the mission system:
 *   catalog (definitions) → deterministic daily selection → accepted events
 *   → idempotent progress receipts → completion → one reward grant → hub projection.
 *
 * Authority (ADR-0003, P01-B-03):
 * - the SERVER is the only engine. `supabase/migrations/0058_mission_engine_hub.sql`
 *   (`mission_sync`) is authoritative; `syncMissions()` below is its executable
 *   TypeScript mirror, used by tests/verifiers to pin the semantics. Clients render
 *   `MissionHubProjection` only and never report progress;
 * - progress counts only server-accepted facts (station pass from station_check_results,
 *   completed challenge runs, completed + evaluated non-mastery encounters);
 * - forbidden triggers (open app, time spent, screen viewed, idle, purchase, notification)
 *   cannot be used by any definition;
 * - completion and reward grants are idempotent: one receipt per (instance, source), one
 *   grant per deterministic key; replaying the same events changes nothing;
 * - expiry is silent and is not failure: it flips an instance to EXPIRED, removes no
 *   receipt, no grant, no learning progress, and carries nothing over (P01-B-04);
 * - missions never set mastery, station completion, or unlocks (reward ≠ mastery);
 * - no child-facing currency: rewards are STAR_PROGRESS / STICKER / CHARACTER_REACTION
 *   (QUEST source classes), previewed by kind, never by number or price (P01-D-02/04).
 *
 * The ST01 station mission keeps the P05 seed id/code/reward key (`G1-M-ST01`) so ST01
 * history stays reconstructable (see st01-slice.ts).
 */
import { DAILY_QUEST_SLOTS, rewardGrantKeyString, type DailyQuestSlot, type QuestTriggerType, type QuestType, type RewardSourceType, type RewardType } from './engagement';
import { FORBIDDEN_MISSION_TRIGGERS, MISSION_POLICY, REWARD_ECONOMY_V1, isMissionTriggerAllowed, isRewardAllowedForSource, localDayKey, type MissionCategory } from './engagement-policy';
import { G1_STATIONS } from './progression';
import { ST01_STATION_MISSION } from './st01-slice';

export const MISSION_ENGINE_VERSION = '2026-10-04-p06-v1' as const;
/** Fallback learner time zone when the client does not send a valid IANA zone. */
export const MISSION_DEFAULT_TIME_ZONE = 'Asia/Tehran' as const;
/** Period key used for non-expiring (STATION/WORLD/ADVENTURE) instances. */
export const MISSION_NO_PERIOD = 'NONE' as const;

// ---------------------------------------------------------------------------
// Definitions
// ---------------------------------------------------------------------------

/** Encounter-derived and fact-derived trigger types the server can emit (subset of QuestTriggerType). */
export type MissionEventType = Extract<QuestTriggerType, 'STATION_COMPLETED' | 'CHALLENGE_COMPLETED' | 'GAME_COMPLETED' | 'SKILL_REVIEW_COMPLETED' | 'TRANSFER_COMPLETED' | 'RECOVERY_COMPLETED'>;

export const MISSION_EVENT_TYPES: readonly MissionEventType[] = [
  'STATION_COMPLETED', 'CHALLENGE_COMPLETED', 'GAME_COMPLETED', 'SKILL_REVIEW_COMPLETED', 'TRANSFER_COMPLETED', 'RECOVERY_COMPLETED',
] as const;

export interface MissionStepDefinition {
  /** Stable step id inside a definition (receipts reference it). */
  id: string;
  type: MissionEventType;
  /** Station short id (`ST01`) or challenge code; null = any target. */
  targetRef: string | null;
  /** Distinct accepted sources required for the step (≥ 1). */
  count: number;
}

export type MissionEligibility = 'NONE' | 'CHALLENGE_AVAILABLE';

export interface MissionDefinitionV1 {
  id: string;
  code: string;
  version: number;
  category: MissionCategory;
  dailySlot: DailyQuestSlot | null;
  /** Full station code (`G1-ST01`) for STATION missions, else null. */
  stationCode: string | null;
  questType: QuestType;
  titleFa: string;
  objectiveFa: string;
  steps: readonly MissionStepDefinition[];
  reward: { code: string; type: RewardType; source: Extract<RewardSourceType, 'QUEST'> };
  /** Kind of reward, never a number or price (REWARD_ECONOMY_V1.missionRewardPreview). */
  rewardPreviewFa: string;
  requires: MissionEligibility;
  status: 'ACTIVE' | 'RETIRED';
}

export function missionMaxProgress(def: Pick<MissionDefinitionV1, 'steps'>): number {
  return def.steps.reduce((sum, step) => sum + step.count, 0);
}

/** Reward catalog rows the mission system grants (QUEST source classes only). */
export const MISSION_REWARD_CATALOG = [
  { code: 'G1-R-001', type: 'STAR_PROGRESS' as RewardType, titleFa: 'ستاره‌ی پیشرفت', payload: { meter: 'PATH_PROGRESS', assetRef: 'reward/star-progress' } },
  { code: 'G1-R-002', type: 'STICKER' as RewardType, titleFa: 'برچسب الگو', payload: { sticker: 'PATTERN', assetRef: 'sticker/pattern' } },
  { code: 'G1-R-003', type: 'CHARACTER_REACTION' as RewardType, titleFa: 'تشویق دوستت', payload: { reaction: 'CHEER', assetRef: 'reaction/cheer' } },
] as const;

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
/** Same mapping as SQL `translate(n::text, '0123456789', '۰۱۲۳۴۵۶۷۸۹')`. */
export function persianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]!);
}

const dailyId = (n: number) => `2f060000-0000-4000-8000-${String(100 + n).padStart(12, '0')}`;
const stationMissionId = (stationNumber: number) => `2f060000-0000-4000-8000-${String(200 + stationNumber).padStart(12, '0')}`;

const QUEST_REWARD = (code: 'G1-R-001' | 'G1-R-002' | 'G1-R-003') => {
  const entry = MISSION_REWARD_CATALOG.find((r) => r.code === code)!;
  return { code: entry.code, type: entry.type, source: 'QUEST' as const };
};

/**
 * Daily pool. One definition per slot is selected per learner per local day.
 * Every EASY_START / SKILL_BUILDER item is completable inside a normal station session
 * (the ST01 flow contains MINI_GAME, REVIEW and TRANSFER encounters). Recovery-only
 * missions are intentionally absent: recovery depends on learner need and a daily goal
 * that the child cannot choose to reach would be unfair (backlog BL-P06-03).
 */
export const G1_DAILY_MISSION_POOL: readonly MissionDefinitionV1[] = [
  {
    id: dailyId(1), code: 'G1-MD-EASY-01', version: 1, category: 'DAILY', dailySlot: 'EASY_START', stationCode: null, questType: 'GAME_PRACTICE',
    titleFa: 'یک بازی کوچک', objectiveFa: 'یک بازی ریاضی را در مسیر انجام بده.',
    steps: [{ id: 'GAME', type: 'GAME_COMPLETED', targetRef: null, count: 1 }],
    reward: QUEST_REWARD('G1-R-003'), rewardPreviewFa: 'تشویق دوستت', requires: 'NONE', status: 'ACTIVE',
  },
  {
    id: dailyId(2), code: 'G1-MD-EASY-02', version: 1, category: 'DAILY', dailySlot: 'EASY_START', stationCode: null, questType: 'SKILL_REVIEW',
    titleFa: 'یک مرور کوتاه', objectiveFa: 'یک مرور کوتاه از چیزهایی که یاد گرفتی انجام بده.',
    steps: [{ id: 'REVIEW', type: 'SKILL_REVIEW_COMPLETED', targetRef: null, count: 1 }],
    reward: QUEST_REWARD('G1-R-003'), rewardPreviewFa: 'تشویق دوستت', requires: 'NONE', status: 'ACTIVE',
  },
  {
    id: dailyId(3), code: 'G1-MD-SKILL-01', version: 1, category: 'DAILY', dailySlot: 'SKILL_BUILDER', stationCode: null, questType: 'GAME_PRACTICE',
    titleFa: 'دو بازی تمرینی', objectiveFa: 'دو بازی ریاضی را تا آخر انجام بده.',
    steps: [{ id: 'GAMES', type: 'GAME_COMPLETED', targetRef: null, count: 2 }],
    reward: QUEST_REWARD('G1-R-002'), rewardPreviewFa: 'یک برچسب تازه', requires: 'NONE', status: 'ACTIVE',
  },
  {
    id: dailyId(4), code: 'G1-MD-SKILL-02', version: 1, category: 'DAILY', dailySlot: 'SKILL_BUILDER', stationCode: null, questType: 'SKILL_REVIEW',
    titleFa: 'مرور و کاربرد', objectiveFa: 'یک مرور انجام بده و یاد گرفته‌ات را در یک موقعیت تازه به کار ببر.',
    steps: [
      { id: 'REVIEW', type: 'SKILL_REVIEW_COMPLETED', targetRef: null, count: 1 },
      { id: 'TRANSFER', type: 'TRANSFER_COMPLETED', targetRef: null, count: 1 },
    ],
    reward: QUEST_REWARD('G1-R-002'), rewardPreviewFa: 'یک برچسب تازه', requires: 'NONE', status: 'ACTIVE',
  },
  {
    id: dailyId(5), code: 'G1-MD-PROG-01', version: 1, category: 'DAILY', dailySlot: 'MEANINGFUL_PROGRESS', stationCode: null, questType: 'TRANSFER',
    titleFa: 'ریاضی در دنیای واقعی', objectiveFa: 'یاد گرفته‌ات را در یک موقعیت تازه به کار ببر.',
    steps: [{ id: 'TRANSFER', type: 'TRANSFER_COMPLETED', targetRef: null, count: 1 }],
    reward: QUEST_REWARD('G1-R-001'), rewardPreviewFa: 'یک ستاره‌ی پیشرفت', requires: 'NONE', status: 'ACTIVE',
  },
  {
    id: dailyId(6), code: 'G1-MD-PROG-02', version: 1, category: 'DAILY', dailySlot: 'MEANINGFUL_PROGRESS', stationCode: null, questType: 'GAME_PRACTICE',
    titleFa: 'چالش ویژه', objectiveFa: 'یک چالش ویژه‌ی ایستگاه را تا آخر انجام بده.',
    steps: [{ id: 'CHALLENGE', type: 'CHALLENGE_COMPLETED', targetRef: null, count: 1 }],
    reward: QUEST_REWARD('G1-R-001'), rewardPreviewFa: 'یک ستاره‌ی پیشرفت', requires: 'CHALLENGE_AVAILABLE', status: 'ACTIVE',
  },
] as const;

/**
 * One station mission per station. ST01 reuses the P05 seed (station pass + its signature
 * challenge). ST02–ST25 have only the station-pass step until their challenges exist (P10
 * adds the challenge step as a NEW definition version; existing instances keep theirs).
 */
export const G1_STATION_MISSIONS: readonly MissionDefinitionV1[] = G1_STATIONS.map((station): MissionDefinitionV1 => {
  if (station.id === 'ST01') {
    return {
      id: ST01_STATION_MISSION.id,
      code: ST01_STATION_MISSION.code,
      version: Number(ST01_STATION_MISSION.version),
      category: 'STATION',
      dailySlot: null,
      stationCode: 'G1-ST01',
      questType: 'PATH_PROGRESS',
      titleFa: ST01_STATION_MISSION.title,
      objectiveFa: ST01_STATION_MISSION.objective,
      steps: ST01_STATION_MISSION.steps.map((s) => ({ id: s.id, type: s.trigger.type as MissionEventType, targetRef: s.trigger.targetRef, count: 1 })),
      reward: { code: ST01_STATION_MISSION.reward.code, type: ST01_STATION_MISSION.reward.type, source: 'QUEST' },
      rewardPreviewFa: ST01_STATION_MISSION.rewardPreviewFa,
      requires: 'NONE',
      status: 'ACTIVE',
    };
  }
  return {
    id: stationMissionId(station.number),
    code: `G1-M-${station.id}`,
    version: 1,
    category: 'STATION',
    dailySlot: null,
    stationCode: `G1-${station.id}`,
    questType: 'PATH_PROGRESS',
    titleFa: `ماموریت ایستگاه ${persianDigits(station.number)}`,
    objectiveFa: 'این ایستگاه را کامل کن تا راه تازه باز شود.',
    steps: [{ id: 'STATION_PASSED', type: 'STATION_COMPLETED', targetRef: station.id, count: 1 }],
    reward: QUEST_REWARD('G1-R-001'),
    rewardPreviewFa: 'یک ستاره‌ی پیشرفت',
    requires: 'NONE',
    status: 'ACTIVE',
  };
});

/**
 * WORLD and ADVENTURE missions are supported by the engine (category, cap, expiry) but no
 * definitions ship in P06: world identity is PROVISIONAL until P09 (P01-F-01).
 */
export const G1_MISSION_CATALOG: readonly MissionDefinitionV1[] = [...G1_DAILY_MISSION_POOL, ...G1_STATION_MISSIONS];

// ---------------------------------------------------------------------------
// Deterministic daily selection (FNV-1a 32-bit; mirrored by SQL mission_fnv1a32)
// ---------------------------------------------------------------------------

export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) hash = Math.imul(hash ^ input.charCodeAt(i), 0x01000193) >>> 0;
  return hash >>> 0;
}

export function dailySelectionSeed(learningIdentityId: string, dayKey: string, slot: DailyQuestSlot): string {
  return `${learningIdentityId}:${dayKey}:${slot}`;
}

export interface DailySelectionContext { challengeAvailable: boolean }

function eligible(def: MissionDefinitionV1, ctx: DailySelectionContext): boolean {
  if (def.status !== 'ACTIVE') return false;
  return def.requires === 'NONE' || (def.requires === 'CHALLENGE_AVAILABLE' && ctx.challengeAvailable);
}

/** Exactly ≤ 1 definition per slot, ordered EASY_START → SKILL_BUILDER → MEANINGFUL_PROGRESS. */
export function selectDailyMissions(
  learningIdentityId: string,
  dayKey: string,
  ctx: DailySelectionContext,
  pool: readonly MissionDefinitionV1[] = G1_DAILY_MISSION_POOL,
): MissionDefinitionV1[] {
  const picked: MissionDefinitionV1[] = [];
  for (const slot of DAILY_QUEST_SLOTS) {
    const candidates = pool.filter((d) => d.category === 'DAILY' && d.dailySlot === slot && eligible(d, ctx)).sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
    if (!candidates.length) continue;
    picked.push(candidates[fnv1a32(dailySelectionSeed(learningIdentityId, dayKey, slot)) % candidates.length]!);
  }
  return picked.slice(0, MISSION_POLICY.maxActive.DAILY);
}

// ---------------------------------------------------------------------------
// Accepted events (server facts) and progress
// ---------------------------------------------------------------------------

export interface MissionAcceptedEvent {
  /** `${type}:${sourceRef}` — stable across replays. */
  eventKey: string;
  type: MissionEventType;
  targetRef: string | null;
  /** The underlying fact (`encounter:<id>`, `challenge-run:<id>`, `station:G1-ST01`). One source counts once per instance. */
  sourceRef: string;
  occurredAt: string;
}

export function missionEventKey(type: MissionEventType, sourceRef: string): string {
  return `${type}:${sourceRef}`;
}

export interface MissionReceipt { stepId: string; eventKey: string; sourceRef: string; occurredAt: string }

export interface MissionInstanceRecord {
  id: string;
  definitionCode: string;
  category: MissionCategory;
  periodKey: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  startsAt: string;
  completedAt: string | null;
  maxProgress: number;
  receipts: MissionReceipt[];
  rewardGrantKey: string | null;
}

export interface MissionGrantRecord {
  id: string;
  idempotencyKey: string;
  rewardCode: string;
  rewardType: RewardType;
  sourceType: 'QUEST';
  instanceId: string;
  grantedAt: string;
  presented: boolean;
}

export interface MissionEngineState { instances: MissionInstanceRecord[]; grants: MissionGrantRecord[] }

export const EMPTY_MISSION_STATE: MissionEngineState = { instances: [], grants: [] };

/** Deterministic reward key. STATION: identical to the P05 `st01MissionRewardGrantKey` shape. DAILY: per local day. */
export function missionRewardGrantKey(learningIdentityId: string, def: Pick<MissionDefinitionV1, 'code' | 'category' | 'reward'>, periodKey: string): string {
  const sourceRef = def.category === 'DAILY' ? `${def.code}@${periodKey}` : def.code;
  return rewardGrantKeyString({ learningIdentityId, sourceType: 'QUEST', sourceRef, rewardDefinitionId: def.reward.code });
}

function matchesStep(step: MissionStepDefinition, event: MissionAcceptedEvent): boolean {
  return event.type === step.type && (step.targetRef === null || event.targetRef === step.targetRef);
}

function compareEvents(a: MissionAcceptedEvent, b: MissionAcceptedEvent): number {
  if (a.occurredAt !== b.occurredAt) return a.occurredAt < b.occurredAt ? -1 : 1;
  return a.eventKey < b.eventKey ? -1 : a.eventKey > b.eventKey ? 1 : 0;
}

/**
 * Adds receipts for matching events (step order, oldest event first), at most `count`
 * per step and at most one per source per instance. Pure; returns the new receipt list.
 */
export function applyMissionEvents(
  def: MissionDefinitionV1,
  instance: Pick<MissionInstanceRecord, 'category' | 'periodKey' | 'receipts'>,
  events: readonly MissionAcceptedEvent[],
  timeZone: string,
): MissionReceipt[] {
  const receipts = [...instance.receipts];
  const usedSources = new Set(receipts.map((r) => r.sourceRef));
  const inWindow = (e: MissionAcceptedEvent) => instance.category !== 'DAILY' || localDayKey(new Date(e.occurredAt), timeZone) === instance.periodKey;
  const ordered = [...events].filter(inWindow).sort(compareEvents);
  for (const step of def.steps) {
    let have = receipts.filter((r) => r.stepId === step.id).length;
    for (const event of ordered) {
      if (have >= step.count) break;
      if (usedSources.has(event.sourceRef) || !matchesStep(step, event)) continue;
      receipts.push({ stepId: step.id, eventKey: event.eventKey, sourceRef: event.sourceRef, occurredAt: event.occurredAt });
      usedSources.add(event.sourceRef);
      have += 1;
    }
  }
  return receipts;
}

export interface MissionStepProgress { id: string; type: MissionEventType; have: number; required: number; done: boolean }

export function missionStepProgress(def: MissionDefinitionV1, receipts: readonly MissionReceipt[]): MissionStepProgress[] {
  return def.steps.map((step) => {
    const have = Math.min(step.count, receipts.filter((r) => r.stepId === step.id).length);
    return { id: step.id, type: step.type, have, required: step.count, done: have >= step.count };
  });
}

export function missionProgressValue(def: MissionDefinitionV1, receipts: readonly MissionReceipt[]): number {
  return missionStepProgress(def, receipts).reduce((sum, s) => sum + s.have, 0);
}

// ---------------------------------------------------------------------------
// Station mission ordering
// ---------------------------------------------------------------------------

/**
 * The single active station mission: the lowest-sequence station mission that is not
 * completed and whose station is either passed (remaining steps, e.g. the ST01 challenge)
 * or is the first not-yet-passed station. Never more than MISSION_POLICY.maxActive.STATION.
 */
export function nextStationMission(
  passedStationIds: readonly string[],
  completedMissionCodes: readonly string[],
  catalog: readonly MissionDefinitionV1[] = G1_STATION_MISSIONS,
): MissionDefinitionV1 | null {
  const passed = new Set(passedStationIds);
  const done = new Set(completedMissionCodes);
  const ordered = G1_STATIONS.map((s) => ({ s, def: catalog.find((d) => d.category === 'STATION' && d.status === 'ACTIVE' && d.stationCode === `G1-${s.id}`) ?? null }));
  for (const { s, def } of ordered) {
    if (!def) { if (!passed.has(s.id)) return null; continue; }
    if (done.has(def.code)) { if (!passed.has(s.id)) return null; continue; }
    return def;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Engine mirror (pure). SQL mission_sync must keep the same semantics.
// ---------------------------------------------------------------------------

export interface MissionSyncInput {
  learningIdentityId: string;
  timeZone: string;
  now: Date;
  /** Every server-accepted event for the learner (the engine filters by window itself). */
  events: readonly MissionAcceptedEvent[];
  passedStationIds: readonly string[];
  challengeAvailable: boolean;
}

export interface MissionSyncResult { state: MissionEngineState; newGrants: MissionGrantRecord[]; dayKey: string }

function definitionByCode(code: string, catalog: readonly MissionDefinitionV1[]): MissionDefinitionV1 {
  const def = catalog.find((d) => d.code === code);
  if (!def) throw new Error(`MISSION_DEFINITION_NOT_FOUND:${code}`);
  return def;
}

export function missionInstanceId(code: string, periodKey: string): string {
  return `${code}@${periodKey}`;
}

/**
 * One idempotent sync pass: silent expiry → today's daily set → evaluate active
 * instances → complete + grant once → advance the station mission. Running it again with
 * the same input returns an identical state and no new grants.
 */
export function syncMissions(prev: MissionEngineState, input: MissionSyncInput, catalog: readonly MissionDefinitionV1[] = G1_MISSION_CATALOG): MissionSyncResult {
  const nowIso = input.now.toISOString();
  const dayKey = localDayKey(input.now, input.timeZone);
  const instances = prev.instances.map((i) => ({ ...i, receipts: [...i.receipts] }));
  const grants = prev.grants.map((g) => ({ ...g }));
  const grantKeys = new Set(grants.map((g) => g.idempotencyKey));
  const newGrants: MissionGrantRecord[] = [];

  // 1. Silent expiry: status flip only. Receipts and grants stay.
  for (const inst of instances) if (inst.category === 'DAILY' && inst.status === 'ACTIVE' && inst.periodKey !== dayKey) inst.status = 'EXPIRED';

  // 2. Today's daily set (created once per slot per day).
  const pool = catalog.filter((d) => d.category === 'DAILY');
  for (const def of selectDailyMissions(input.learningIdentityId, dayKey, { challengeAvailable: input.challengeAvailable }, pool)) {
    const slotTaken = instances.some((i) => i.category === 'DAILY' && i.periodKey === dayKey && definitionByCode(i.definitionCode, catalog).dailySlot === def.dailySlot);
    if (slotTaken) continue;
    instances.push({ id: missionInstanceId(def.code, dayKey), definitionCode: def.code, category: 'DAILY', periodKey: dayKey, status: 'ACTIVE', startsAt: nowIso, completedAt: null, maxProgress: missionMaxProgress(def), receipts: [], rewardGrantKey: null });
  }

  const evaluate = () => {
    for (const inst of instances) {
      if (inst.status !== 'ACTIVE') continue;
      if (inst.category === 'DAILY' && inst.periodKey !== dayKey) continue;
      const def = definitionByCode(inst.definitionCode, catalog);
      inst.receipts = applyMissionEvents(def, inst, input.events, input.timeZone);
      if (missionProgressValue(def, inst.receipts) < inst.maxProgress) continue;
      inst.status = 'COMPLETED';
      inst.completedAt = nowIso;
      const key = missionRewardGrantKey(input.learningIdentityId, def, inst.periodKey);
      inst.rewardGrantKey = key;
      if (!grantKeys.has(key)) {
        const grant: MissionGrantRecord = { id: `grant:${key}`, idempotencyKey: key, rewardCode: def.reward.code, rewardType: def.reward.type, sourceType: 'QUEST', instanceId: inst.id, grantedAt: nowIso, presented: false };
        grants.push(grant);
        newGrants.push(grant);
        grantKeys.add(key);
      }
    }
  };

  // 3–5. Evaluate, then advance the station mission until one stays active (bounded).
  const stationCatalog = catalog.filter((d) => d.category === 'STATION');
  for (let guard = 0; guard <= G1_STATIONS.length; guard += 1) {
    evaluate();
    if (instances.some((i) => i.category === 'STATION' && i.status === 'ACTIVE')) break;
    const completed = instances.filter((i) => i.category === 'STATION' && i.status === 'COMPLETED').map((i) => i.definitionCode);
    const next = nextStationMission(input.passedStationIds, completed, stationCatalog);
    if (!next || instances.some((i) => i.definitionCode === next.code && i.periodKey === MISSION_NO_PERIOD)) break;
    instances.push({ id: missionInstanceId(next.code, MISSION_NO_PERIOD), definitionCode: next.code, category: 'STATION', periodKey: MISSION_NO_PERIOD, status: 'ACTIVE', startsAt: nowIso, completedAt: null, maxProgress: missionMaxProgress(next), receipts: [], rewardGrantKey: null });
  }

  return { state: { instances, grants }, newGrants, dayKey };
}

/** Marks a grant as presented (idempotent). Presentation never changes the grant itself. */
export function acknowledgeReveal(state: MissionEngineState, grantId: string): MissionEngineState {
  return { instances: state.instances, grants: state.grants.map((g) => (g.id === grantId ? { ...g, presented: true } : g)) };
}

// ---------------------------------------------------------------------------
// Child projection (what GET /api/v1/missions/hub returns)
// ---------------------------------------------------------------------------

export interface MissionCardView {
  instanceId: string;
  code: string;
  category: MissionCategory;
  dailySlot: DailyQuestSlot | null;
  titleFa: string;
  objectiveFa: string;
  progress: number;
  maxProgress: number;
  status: 'ACTIVE' | 'COMPLETED';
  rewardPreviewFa: string;
  rewardType: RewardType;
  rewardGranted: boolean;
  steps: { id: string; have: number; required: number; done: boolean }[];
}

export interface MissionRevealView { grantId: string; rewardCode: string; rewardType: RewardType; titleFa: string; descriptionFa: string; missionCode: string }

export interface MissionHubProjection {
  engineVersion: typeof MISSION_ENGINE_VERSION;
  dayKey: string;
  timeZone: string;
  daily: MissionCardView[];
  station: MissionCardView | null;
  /** World missions arrive with P09. Always null in P06. */
  world: null;
  /** Granted, not yet presented, oldest first, ≤ REWARD_ECONOMY_V1.maxRewardRevealsPerSession. */
  pendingReveals: MissionRevealView[];
  summary: { dailyCompleted: number; dailyTotal: number };
  setsMastery: false;
  setsStationCompletion: false;
}

export function missionRevealDescriptionFa(titleFa: string): string {
  return `ماموریت «${titleFa}» را انجام دادی.`;
}

export function buildMissionHubProjection(state: MissionEngineState, dayKey: string, timeZone: string, catalog: readonly MissionDefinitionV1[] = G1_MISSION_CATALOG): MissionHubProjection {
  const card = (inst: MissionInstanceRecord): MissionCardView => {
    const def = definitionByCode(inst.definitionCode, catalog);
    return {
      instanceId: inst.id,
      code: def.code,
      category: def.category,
      dailySlot: def.dailySlot,
      titleFa: def.titleFa,
      objectiveFa: def.objectiveFa,
      progress: Math.min(missionProgressValue(def, inst.receipts), inst.maxProgress),
      maxProgress: inst.maxProgress,
      status: inst.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
      rewardPreviewFa: def.rewardPreviewFa,
      rewardType: def.reward.type,
      rewardGranted: inst.rewardGrantKey !== null && state.grants.some((g) => g.idempotencyKey === inst.rewardGrantKey),
      steps: missionStepProgress(def, inst.receipts).map(({ id, have, required, done }) => ({ id, have, required, done })),
    };
  };
  const slotOrder = (s: DailyQuestSlot | null) => (s ? DAILY_QUEST_SLOTS.indexOf(s) : 99);
  const daily = state.instances
    .filter((i) => i.category === 'DAILY' && i.periodKey === dayKey && i.status !== 'EXPIRED')
    .map(card)
    .sort((a, b) => slotOrder(a.dailySlot) - slotOrder(b.dailySlot));
  const activeStation = state.instances.find((i) => i.category === 'STATION' && i.status === 'ACTIVE');
  const pendingReveals = state.grants
    .filter((g) => !g.presented)
    .sort((a, b) => (a.grantedAt < b.grantedAt ? -1 : a.grantedAt > b.grantedAt ? 1 : 0))
    .slice(0, REWARD_ECONOMY_V1.maxRewardRevealsPerSession)
    .map((g): MissionRevealView => {
      const inst = state.instances.find((i) => i.id === g.instanceId);
      const def = inst ? definitionByCode(inst.definitionCode, catalog) : null;
      const reward = MISSION_REWARD_CATALOG.find((r) => r.code === g.rewardCode);
      return { grantId: g.id, rewardCode: g.rewardCode, rewardType: g.rewardType, titleFa: reward?.titleFa ?? '', descriptionFa: def ? missionRevealDescriptionFa(def.titleFa) : '', missionCode: def?.code ?? '' };
    });
  return {
    engineVersion: MISSION_ENGINE_VERSION,
    dayKey,
    timeZone,
    daily,
    station: activeStation ? card(activeStation) : null,
    world: null,
    pendingReveals,
    summary: { dailyCompleted: daily.filter((c) => c.status === 'COMPLETED').length, dailyTotal: daily.length },
    setsMastery: false,
    setsStationCompletion: false,
  };
}

/** Reveal queue for the client, honouring the per-session cap (P01-D-06, PROVISIONAL until child test). */
export function missionRevealsForSession(projection: Pick<MissionHubProjection, 'pendingReveals'>, alreadyRevealedThisSession: number): MissionRevealView[] {
  const budget = Math.max(0, REWARD_ECONOMY_V1.maxRewardRevealsPerSession - alreadyRevealedThisSession);
  return projection.pendingReveals.slice(0, budget);
}

/** Path entry card copy (P01-E-01: one Path entry card, no fourth tab). */
export function missionEntryCardCopy(projection: Pick<MissionHubProjection, 'summary' | 'station'> | null): { titleFa: string; subtitleFa: string; allDailyDone: boolean } {
  if (!projection || projection.summary.dailyTotal === 0) return { titleFa: 'ماموریت‌ها', subtitleFa: 'ماموریت‌های امروز را ببین', allDailyDone: false };
  const { dailyCompleted, dailyTotal } = projection.summary;
  if (dailyCompleted >= dailyTotal) return { titleFa: 'ماموریت‌های امروز', subtitleFa: 'همه‌ی ماموریت‌های امروز انجام شد', allDailyDone: true };
  return { titleFa: 'ماموریت‌های امروز', subtitleFa: `${persianDigits(dailyCompleted)} از ${persianDigits(dailyTotal)} انجام شد`, allDailyDone: false };
}

// ---------------------------------------------------------------------------
// Validation (P06 verifier + tests)
// ---------------------------------------------------------------------------

/** Shame / pressure / loss language that child-facing mission copy must never use (Roadmap P06 UI, §4.3). */
export const MISSION_FORBIDDEN_COPY_FA = ['شکست', 'باختی', 'از دست', 'عجله', 'زود باش', 'فقط تا', 'تنبیه', 'جریمه', 'دیر شد', 'تمام می‌شود', 'وقت نداری'] as const;

export function missionDefinitionViolations(def: MissionDefinitionV1): string[] {
  const v: string[] = [];
  const tag = def.code;
  if (!(MISSION_POLICY.categories as readonly string[]).includes(def.category)) v.push(`${tag}:UNKNOWN_CATEGORY`);
  if (!def.steps.length) v.push(`${tag}:NO_STEPS`);
  const stepIds = new Set<string>();
  for (const step of def.steps) {
    if (stepIds.has(step.id)) v.push(`${tag}:DUPLICATE_STEP_ID:${step.id}`);
    stepIds.add(step.id);
    if ((FORBIDDEN_MISSION_TRIGGERS as readonly string[]).includes(step.type)) v.push(`${tag}:FORBIDDEN_TRIGGER:${step.type}`);
    if (!isMissionTriggerAllowed(def.category, step.type)) v.push(`${tag}:TRIGGER_NOT_ALLOWED:${step.type}`);
    if (!Number.isInteger(step.count) || step.count < 1) v.push(`${tag}:STEP_COUNT_INVALID:${step.id}`);
  }
  if (def.category === 'DAILY' && !def.dailySlot) v.push(`${tag}:DAILY_WITHOUT_SLOT`);
  if (def.category !== 'DAILY' && def.dailySlot) v.push(`${tag}:SLOT_ON_NON_DAILY`);
  if (def.category === 'STATION' && !def.stationCode) v.push(`${tag}:STATION_WITHOUT_STATION_CODE`);
  if (def.reward.source !== 'QUEST') v.push(`${tag}:REWARD_SOURCE_NOT_QUEST`);
  if (!isRewardAllowedForSource(def.reward.source, def.reward.type)) v.push(`${tag}:REWARD_CLASS_NOT_ALLOWED:${def.reward.type}`);
  if (!MISSION_REWARD_CATALOG.some((r) => r.code === def.reward.code && r.type === def.reward.type)) v.push(`${tag}:REWARD_NOT_IN_CATALOG:${def.reward.code}`);
  if (/[0-9۰-۹]/.test(def.rewardPreviewFa)) v.push(`${tag}:REWARD_PREVIEW_HAS_NUMBER`);
  for (const text of [def.titleFa, def.objectiveFa, def.rewardPreviewFa]) {
    for (const bad of MISSION_FORBIDDEN_COPY_FA) if (text.includes(bad)) v.push(`${tag}:FORBIDDEN_COPY:${bad}`);
  }
  if (def.titleFa.length > 28) v.push(`${tag}:TITLE_TOO_LONG`);
  if (def.objectiveFa.length > 80) v.push(`${tag}:OBJECTIVE_TOO_LONG`);
  return v;
}

export function missionCatalogViolations(catalog: readonly MissionDefinitionV1[] = G1_MISSION_CATALOG): string[] {
  const v = catalog.flatMap(missionDefinitionViolations);
  const ids = new Set<string>();
  const codes = new Set<string>();
  for (const def of catalog) {
    if (ids.has(def.id)) v.push(`DUPLICATE_ID:${def.id}`);
    if (codes.has(def.code)) v.push(`DUPLICATE_CODE:${def.code}`);
    ids.add(def.id); codes.add(def.code);
  }
  for (const slot of DAILY_QUEST_SLOTS) {
    if (!catalog.some((d) => d.category === 'DAILY' && d.dailySlot === slot && d.status === 'ACTIVE' && d.requires === 'NONE')) v.push(`DAILY_SLOT_WITHOUT_UNCONDITIONAL_DEFINITION:${slot}`);
  }
  const stationMissions = catalog.filter((d) => d.category === 'STATION');
  for (const station of G1_STATIONS) {
    if (stationMissions.filter((d) => d.stationCode === `G1-${station.id}` && d.status === 'ACTIVE').length !== 1) v.push(`STATION_MISSION_COUNT:${station.id}`);
  }
  if (MISSION_POLICY.uiLocalProgressCanGrant !== false) v.push('POLICY_ALLOWS_UI_LOCAL_GRANT');
  if (MISSION_POLICY.expiryIsFailure !== false || MISSION_POLICY.expiryRemovesLearningProgress !== false) v.push('POLICY_EXPIRY_PUNITIVE');
  return v;
}
