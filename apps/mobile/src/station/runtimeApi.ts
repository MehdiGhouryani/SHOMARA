import type { AnswerPayload, StationContent, SubmitOutcome } from './types';
import { createMobileSyncManager, stableActionKey } from '../sync/MobileSyncManager';
import { getAuthHeaders } from '../auth/AuthSession';
import { ensureClientInstallationId } from '../auth/ClientInstallation';
import { API_BASE_URL, isProductionApiSafe } from '../config/runtime';
const LEARNING_ID = process.env.EXPO_PUBLIC_DEV_LEARNING_ID ?? 'dev-child-001';
const DEV_LEARNING_ID = __DEV__ ? LEARNING_ID : undefined;
let activeLearningIdentityId: string | null = DEV_LEARNING_ID ?? null;
const CONTEXT_ID = process.env.EXPO_PUBLIC_RELATIONSHIP_CONTEXT_ID ?? 'platform';
const CURRICULUM_VERSION = process.env.EXPO_PUBLIC_CURRICULUM_VERSION ?? 'g1-build-001';
const SKILL_GRAPH_VERSION = process.env.EXPO_PUBLIC_SKILL_GRAPH_VERSION ?? 'g1-canonical-v1.0';
let syncManager: ReturnType<typeof createMobileSyncManager> | null = null;

async function getSyncManager() {
  if (!syncManager) {
    const installationId = await ensureClientInstallationId();
    syncManager = createMobileSyncManager(API_BASE_URL, installationId, DEV_LEARNING_ID);
  }
  return syncManager;
}

export function flushPendingSync(): Promise<{ processed: number; acked: number; retried: number; rejected: number }> {
  return getSyncManager().then((manager) => manager.flush());
}

export async function registerClientInstallation(): Promise<string> {
  const installationId = await ensureClientInstallationId();
  if (__DEV__ && !getAuthHeaders().Authorization) return installationId;
  const response = await fetch(`${API_BASE_URL}/api/v1/client/installations`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ installationId, platform: 'ANDROID', appVersion: '0.1.0' }),
  });
  if (!response.ok) throw new Error(`CLIENT_INSTALLATION_${response.status}`);
  return installationId;
}
const CONTENT_01 = '26000000-0000-4000-8000-000000000001';
const CONTENT_02 = '26000000-0000-4000-8000-000000000002';
const CONTENT_03 = '26000000-0000-4000-8000-000000000003';
const CONTENT_04 = '26000000-0000-4000-8000-000000000004';
const CONTENT_05 = '26000000-0000-4000-8000-000000000005';
const CONTENT_06 = '26000000-0000-4000-8000-000000000006';
const CONTENT_07 = '26000000-0000-4000-8000-000000000007';
const CONTENT_08 = '26000000-0000-4000-8000-000000000008';
const CONTENT_09 = '26000000-0000-4000-8000-000000000009';
const CONTENT_10 = '26000000-0000-4000-8000-000000000010';
const CONTENT_11 = '26000000-0000-4000-8000-000000000011';
const CONTENT_12 = '26000000-0000-4000-8000-000000000012';
const RECOVERY_001 = '26000000-0000-4000-8000-000000000013';
const RECOVERY_003 = '26000000-0000-4000-8000-000000000014';
const RECOVERY_009 = '26000000-0000-4000-8000-000000000015';
const RECOVERY_011 = '26000000-0000-4000-8000-000000000016';
const RECHECK_001 = '26000000-0000-4000-8000-000000000017';
const RECHECK_003 = '26000000-0000-4000-8000-000000000018';
const RECHECK_009 = '26000000-0000-4000-8000-000000000019';
const RECHECK_011 = '26000000-0000-4000-8000-000000000020';

class ApiRequestError extends Error {
  readonly status: number;
  constructor(status: number) { super(`API_${status}`); this.name = 'ApiRequestError'; this.status = status; }
}

/** Failures where the learner's attempt must be kept and retried later instead of being lost. */
function isRetryableSubmitFailure(error: unknown): boolean {
  if (error instanceof NetworkRequestError) return true;
  if (error instanceof ApiRequestError) {
    const s = error.status;
    return s >= 500 || s === 401 || s === 403 || s === 408 || s === 425 || s === 429;
  }
  return false;
}

class NetworkRequestError extends Error {
  constructor() { super('NETWORK_UNAVAILABLE'); this.name = 'NetworkRequestError'; }
}

const localContent: Record<string, StationContent> = {
  learn: {
    id: 'G1-ST01-E01', contentVersionId: CONTENT_01, title: 'اول بشماریم', prompt: 'هر مهره را یکی‌یکی ببین. آخرین عددی که می‌گویی، تعداد همه‌ی مهره‌هاست.', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'INSTRUCTION', experienceForm: 'CONVERSATION_EXPLANATION',
  },
  guided: {
    id: 'G1-ST01-E02', contentVersionId: CONTENT_02, title: 'یه انتخاب کوچولو', prompt: 'گروهی را انتخاب کن که ۳ مهره دارد.', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'GUIDED_PRACTICE', experienceForm: 'PUZZLE', options: ['۲', '۳', '۴'], visualCount: 3,
  },
  pattern: {
    id: 'G1-ST01-E03', contentVersionId: CONTENT_03, title: 'مسیر الگو', prompt: 'کدام مهره باید جای علامت سؤال بیاید؟', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', options: ['زرد', 'آبی', 'سبز'],
  },
  count: {
    id: 'G1-ST01-E04', contentVersionId: CONTENT_04, title: 'شکار شمارش', prompt: 'چند مهره می‌بینی؟', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', options: ['۲', '۳', '۴'], visualCount: 3,
  },
  independent: {
    id: 'G1-ST01-E05', contentVersionId: '26000000-0000-4000-8000-000000000005', title: 'تمرین مستقل', prompt: 'بدون کمک، تعداد شکل‌ها را پیدا کن.', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'INDEPENDENT_PRACTICE', experienceForm: 'PUZZLE', options: ['۲','۳','۴'], visualCount: 3,
  },
  review: {
    id: 'G1-ST01-E06', contentVersionId: '26000000-0000-4000-8000-000000000006', title: 'مرور الگو', prompt: 'الگو را سریع کامل کن.', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'REVIEW', experienceForm: 'MINI_GAME', options: ['زرد','آبی','سبز'],
  },
  checkA: {
    id: 'G1-ST01-E07', contentVersionId: CONTENT_07, title: 'چالش اول', prompt: 'در ۵ مأموریت کوتاه، شمارش و تعداد را بررسی کن.', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE',
    questions: [
      { prompt: 'چند مهره؟', options: ['۲','۳','۴','۵'], visualCount: 3 },
      { prompt: 'چند مهره؟', options: ['۱','۲','۳','۴'], visualCount: 3 },
      { prompt: 'چند مهره؟', options: ['۳','۴','۵','۶'], visualCount: 4 },
      { prompt: 'چند مهره؟', options: ['۱','۲','۳','۴'], visualCount: 2 },
      { prompt: 'چند مهره؟', options: ['۳','۴','۵','۶'], visualCount: 5 },
    ],
  },
  checkB: {
    id: 'G1-ST01-E08', contentVersionId: CONTENT_08, title: 'چالش دوم', prompt: 'حالا یک بررسی تازه و مستقل انجام بده.', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE',
    questions: [
      { prompt: 'چه رنگی جای علامت سؤال می‌آید؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'الگو را کامل کن.', options: ['زرد','آبی','سبز'] },
      { prompt: 'کدام مهره ادامه الگوست؟', options: ['قرمز','سبز','آبی'] },
      { prompt: 'کدام رنگ باید بیاید؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'پایان الگو چیست؟', options: ['زرد','آبی','سبز'] },
    ],
  },
  recovery: {
    id: 'G1-ST01-E09', contentVersionId: RECOVERY_001, title: 'با هم دوباره', prompt: 'این بار آهسته‌تر: هر مهره را یکی‌یکی لمس کن و تا ۳ بشمار.', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'RECOVERY', experienceForm: 'BUILD_EXPLORE', options: ['۱', '۲', '۳'], visualCount: 3,
  },
  recheck: {
    id: 'G1-ST01-E10', contentVersionId: RECHECK_001, title: 'بررسی دوباره', prompt: 'بعد از تمرین بازیابی، یک بررسی تازه انجام بده.', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', questions: [
      { prompt: 'چند مهره داریم؟', options: ['۲','۳','۴'], visualCount: 3 },
      { prompt: 'چند مهره داریم؟', options: ['۱','۲','۳'], visualCount: 1 },
      { prompt: 'چند مهره داریم؟', options: ['۱','۲','۳'], visualCount: 2 },
      { prompt: 'چند مهره داریم؟', options: ['۱','۲','۳'], visualCount: 3 },
      { prompt: 'چند مهره داریم؟', options: ['۱','۲','۳'], visualCount: 2 },
    ],
  },
  recoveryPattern: {
    id: 'G1-ST01-E09', contentVersionId: RECOVERY_009, title: 'با هم الگو می‌سازیم', prompt: 'رنگی را انتخاب کن که الگو را کامل می‌کند.', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'RECOVERY', experienceForm: 'BUILD_EXPLORE', options: ['زرد','آبی','سبز'],
  },
  recheckPattern: {
    id: 'G1-ST01-E10', contentVersionId: RECHECK_009, title: 'بررسی دوباره الگو', prompt: 'الگو را در پنج موقعیت تازه بررسی کن.', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', questions: [
      { prompt: 'چه رنگی می‌آید؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'ادامه چیست؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'کدام مورد درست است؟', options: ['قرمز','سبز','آبی'] },
      { prompt: 'رنگ بعدی چیست؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'پایان الگو چیست؟', options: ['زرد','آبی','سبز'] },
    ],
  },
  recoveryRule: {
    id: 'G1-ST01-E09', contentVersionId: RECOVERY_011, title: 'قانون الگو را دوباره پیدا کن', prompt: 'کدام گزینه قانون الگو را کامل می‌کند؟', stationId: 'G1-ST01', skillId: 'G1-SK011', learningRole: 'RECOVERY', experienceForm: 'BUILD_EXPLORE', options: ['الگو A','الگو B','الگو C'],
  },
  recheckRule: {
    id: 'G1-ST01-E10', contentVersionId: RECHECK_011, title: 'بررسی دوباره قانون الگو', prompt: 'قانون الگو را در پنج موقعیت تازه بررسی کن.', stationId: 'G1-ST01', skillId: 'G1-SK011', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', questions: [
      { prompt: 'قانون درست چیست؟', options: ['A','B','C'] },
      { prompt: 'کدام ادامه درست است؟', options: ['A','B','C'] },
      { prompt: 'چه چیزی باید بیاید؟', options: ['A','B','C'] },
      { prompt: 'کدام قانون درست است؟', options: ['A','B','C'] },
      { prompt: 'پایان الگو چیست؟', options: ['A','B','C'] },
    ],
  },
  recoveryCardinality: {
    id: 'G1-ST01-E09', contentVersionId: RECOVERY_003, title: 'دوباره و آهسته‌تر', prompt: 'گروه را بشمار و عدد آخر را انتخاب کن.', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'RECOVERY', experienceForm: 'BUILD_EXPLORE', options: ['۲','۳','۴'], visualCount: 3,
  },
  recheckCardinality: {
    id: 'G1-ST01-E10', contentVersionId: RECHECK_003, title: 'بررسی دوباره تعداد', prompt: 'در پنج سؤال تازه، تعداد را بررسی کن.', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', questions: [
      { prompt: 'چند شیء است؟', options: ['۲','۳','۴'], visualCount: 3 },
      { prompt: 'چند شیء است؟', options: ['۱','۲','۳'], visualCount: 1 },
      { prompt: 'چند شیء است؟', options: ['۱','۲','۳'], visualCount: 2 },
      { prompt: 'چند شیء است؟', options: ['۱','۲','۳'], visualCount: 3 },
      { prompt: 'چند شیء است؟', options: ['۱','۲','۳'], visualCount: 2 },
    ],
  },
  transfer: {
    id: 'G1-ST01-E11', contentVersionId: '26000000-0000-4000-8000-000000000011', title: 'در دنیای واقعی', prompt: 'قانون الگو را در یک موقعیت تازه پیدا کن.', stationId: 'G1-ST01', skillId: 'G1-SK011', learningRole: 'TRANSFER', experienceForm: 'MINI_GAME', options: ['الگو A','الگو B','الگو C'],
  },
  mastery: {
    id: 'G1-ST01-E12', contentVersionId: '26000000-0000-4000-8000-000000000012', title: 'چالش نهایی مهارت', prompt: 'قانون الگو را در ۵ موقعیت تازه بررسی کن.', stationId: 'G1-ST01', skillId: 'G1-SK011', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', questions: [
      { prompt: 'گزینه درست چیست؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'الگو را کامل کن.', options: ['قرمز','سبز','آبی'] },
      { prompt: 'کدام مورد ادامه الگوست؟', options: ['سبز','زرد','آبی'] },
      { prompt: 'چه رنگی می‌آید؟', options: ['زرد','آبی','سبز'] },
      { prompt: 'پایان الگو چیست؟', options: ['آبی','سبز','زرد'] },
    ],
  },
};

export function getRecoveryContent(skillId?: string): StationContent {
  if (skillId === 'G1-SK009' && localContent.recoveryPattern) return localContent.recoveryPattern;
  if (skillId === 'G1-SK011' && localContent.recoveryRule) return localContent.recoveryRule;
  if (skillId === 'G1-SK003' && localContent.recoveryCardinality) return localContent.recoveryCardinality;
  return localContent.recovery ?? localContent.learn!;
}

export function getRecheckContent(skillId?: string): StationContent {
  if (skillId === 'G1-SK009' && localContent.recheckPattern) return localContent.recheckPattern;
  if (skillId === 'G1-SK011' && localContent.recheckRule) return localContent.recheckRule;
  if (skillId === 'G1-SK003' && localContent.recheckCardinality) return localContent.recheckCardinality;
  return localContent.recheck ?? localContent.guided!;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const installationId = await ensureClientInstallationId();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Client-Installation-Id': installationId, ...getAuthHeaders(), ...(__DEV__ && !getAuthHeaders().Authorization ? { 'x-dev-learning-identity-id': LEARNING_ID } : {}), ...(init.headers ?? {}) },
    });
  } catch {
    throw new NetworkRequestError();
  }
  if (!response.ok) throw new ApiRequestError(response.status);
  return (await response.json()) as T;
}

export type SignatureChallengeRunView = {
  idempotent: boolean;
  runId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  challenge: {
    challengeId: string;
    code: string;
    version: number;
    stationId: string;
    gameCode: string;
    objective: string;
    plannedRounds: number;
    timerPolicy: { policy: 'NONE' | 'SOFT'; softPaceSec?: number };
    hintLadder: string[];
    finalMoment: 'SUMMARY_CELEBRATION';
    contractVersion: string;
  };
  currentRoundIndex: number;
  plannedRounds: number;
  next: {
    encounterId: string;
    roundIndex: number;
    attemptNumber: number;
    level: 'SUPPORTED' | 'CORE' | 'STRETCH';
    skillId: string;
    contentVersionId: string;
    interactionType: string;
    prompt: string | null;
    /** Client-safe presentation (from metadata.presentation). */
    title?: string | null;
    options?: readonly string[];
    display?: string | null;
    sequence?: readonly string[] | null;
    content?: AuthoritativeEncounterContent;
  } | null;
  result: {
    result: 'COMPLETED' | 'COMPLETED_WITH_SUPPORT' | 'NOT_YET' | 'ABANDONED';
    semanticEvent: 'MILESTONE' | 'RECOVERY' | null;
    solvedRounds: number;
    plannedRounds: number;
    rewardEligible: boolean;
    rewardGrantKey: string | null;
    setsMastery: false;
    setsStationCompletion: false;
  } | null;
};

export async function getStationChallenge(stationCode: string): Promise<Record<string, unknown>> {
  return request(`/api/v1/challenges/stations/${encodeURIComponent(stationCode)}`, { method: 'GET' });
}

export async function startSignatureChallenge(input: {
  sessionId: string;
  challengeDefinitionId: string;
  clientIdempotencyKey: string;
}): Promise<SignatureChallengeRunView> {
  return request<SignatureChallengeRunView>('/api/v1/challenges/runs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function submitSignatureChallengeRound(input: {
  runId: string;
  roundIndex: number;
  attemptNumber: number;
  clientIdempotencyKey: string;
  answers: AnswerPayload[];
}) {
  return request<{
    idempotent: boolean;
    runId: string;
    roundIndex: number;
    attemptNumber: number;
    correct: boolean;
    score: number;
    maxScore: number;
    evaluatorVersion: string;
    semanticEvent: 'ANSWER_CORRECT' | 'NEAR_MISS' | 'ANSWER_WRONG';
    roundClosed: boolean;
    roundSolved: boolean;
    scaffoldNext: boolean;
    offerHint: boolean;
    evidenceId: string | null;
    next: SignatureChallengeRunView['next'];
    runStatus: SignatureChallengeRunView['status'];
    result: SignatureChallengeRunView['result'];
  }>(`/api/v1/challenges/runs/${encodeURIComponent(input.runId)}/rounds`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function requestSignatureChallengeHint(input: {
  runId: string;
  roundIndex: number;
  hintIndex: number;
  clientIdempotencyKey: string;
}) {
  return request<{ idempotent: boolean; runId: string; roundIndex: number; hintLevel: string; hintsUsed: number; reducesReward: false; revealsFinalAnswer: false }>(`/api/v1/challenges/runs/${encodeURIComponent(input.runId)}/hints`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function finishSignatureChallenge(runId: string) {
  return request<SignatureChallengeRunView['result']>(`/api/v1/challenges/runs/${encodeURIComponent(runId)}`, {
    method: 'POST',
    body: JSON.stringify({ action: 'EXITED' }),
  });
}

export async function getSignatureChallengeRun(runId: string): Promise<SignatureChallengeRunView> {
  return request<SignatureChallengeRunView>(`/api/v1/challenges/runs/${encodeURIComponent(runId)}`, { method: 'GET' });
}

export async function startStationSession() {
  await registerClientInstallation();
  if (!__DEV__) {
    const { prepareGradeContent } = await import('../content/bootstrap');
    await prepareGradeContent('G1');
  }
  const session = await request<{ id: string; learningIdentityId: string }>('/api/v1/learning/sessions', {
    method: 'POST',
    body: JSON.stringify({ ...(DEV_LEARNING_ID ? { learningIdentityId: DEV_LEARNING_ID } : {}), relationshipContextId: CONTEXT_ID, gradeId: 'G1', curriculumVersionId: CURRICULUM_VERSION, skillGraphVersionId: SKILL_GRAPH_VERSION, sessionType: 'LEARNING' }),
  });
  activeLearningIdentityId = session.learningIdentityId;
  return session;
}

export type AuthoritativeEncounterContent = {
  id: string;
  title?: string;
  prompt: string;
  stationId: string;
  skillId: string;
  learningRole: string;
  experienceForm: string;
  interactionType?: string;
  contentVersionId?: string;
  visualCount?: number;
  options?: string[];
  /** P10 generic MC stem */
  display?: string | null;
  /** ST01-style pattern tokens */
  sequence?: readonly string[] | null;
  questions?: Array<{ id?: string; prompt: string; options: string[]; visualCount?: number }>;
};

export async function getAuthoritativeProgression(gradeId = 'G1') {
  return request<{
    gradeId: string;
    curriculumVersion: string;
    generatedAt: string;
    stations: Array<{ stationId: string; stationCode: string; sequence: number; title: string; status: 'ACTIVE'; passed: boolean; qualifyingCheckSessionCount: number }>;
    completedStationIds: string[];
    jumpUnlockedStationIds: string[];
    activeSession: { id: string; sessionType: string; status: string; stationId: string | null; stationCode: string | null; lastActivityAt: string | null; lastResumedByClientInstallationId: string | null } | null;
  }>(`/api/v1/progression?gradeId=${encodeURIComponent(gradeId)}`, { method: 'GET' });
}

export type MissionCardView = {
  instanceId: string;
  code: string;
  category: 'DAILY' | 'STATION' | 'WORLD' | 'ADVENTURE';
  dailySlot: 'EASY_START' | 'SKILL_BUILDER' | 'MEANINGFUL_PROGRESS' | null;
  titleFa: string;
  objectiveFa: string;
  progress: number;
  maxProgress: number;
  status: 'ACTIVE' | 'COMPLETED';
  rewardPreviewFa: string;
  rewardType: string;
  rewardGranted: boolean;
  steps: Array<{ id: string; have: number; required: number; done: boolean }>;
};

export type MissionHubView = {
  engineVersion: string;
  dayKey: string;
  timeZone: string;
  daily: MissionCardView[];
  station: MissionCardView | null;
  world: null;
  pendingReveals: Array<{ grantId: string; rewardCode: string; rewardType: string; titleFa: string; descriptionFa: string; missionCode: string }>;
  summary: { dailyCompleted: number; dailyTotal: number };
  setsMastery: false;
  setsStationCompletion: false;
};

export async function getMissionHub(timeZone = 'Asia/Tehran'): Promise<MissionHubView> {
  return request<MissionHubView>(`/api/v1/missions/hub?timeZone=${encodeURIComponent(timeZone)}`, { method: 'GET' });
}

export async function resumeStationSession(sessionId: string) {
  return request<{
    session: { id: string; learningIdentityId: string; status: string; lastActivityAt?: string | null };
    latestEncounter: {
      id: string;
      sequence: number;
      stationId: string;
      skillId: string;
      contentVersionId?: string;
      learningRole: string;
      experienceForm: string;
      status: string;
      content?: AuthoritativeEncounterContent;
    } | null;
  }>('/api/v1/learning/sessions/' + sessionId, { method: 'GET' });
}

export async function createEncounter(sessionId: string, content: StationContent, sequence: number) {
  return request<{ encounter: { id: string; sequence: number; content?: AuthoritativeEncounterContent } }>('/api/v1/learning/sessions/' + sessionId + '/encounters', {
    method: 'POST',
    body: JSON.stringify({ sessionId, contentVersionId: content.contentVersionId ?? content.id, stationId: content.stationId, skillId: content.skillId, learningRole: content.learningRole, experienceForm: content.experienceForm, sequence }),
  });
}

export async function submitAttempt(input: { sessionId: string; encounterId: string; content: StationContent; answer?: AnswerPayload; answers?: AnswerPayload[]; attemptNumber: number }): Promise<SubmitOutcome> {
  const installationId = await ensureClientInstallationId();
  const clientIdempotencyKey = `station01:v2:${installationId}:${input.sessionId}:${input.encounterId}:${input.content.contentVersionId ?? input.content.id}:${input.attemptNumber}`;
  const payload = {
    learningIdentityId: activeLearningIdentityId ?? DEV_LEARNING_ID ?? (() => { throw new Error('LEARNING_IDENTITY_CONTEXT_REQUIRED'); })(),
    relationshipContextId: CONTEXT_ID,
    sessionId: input.sessionId,
    encounterId: input.encounterId,
    attemptNumber: input.attemptNumber,
    clientIdempotencyKey,
    answers: input.answers ?? (input.answer ? [input.answer] : []),
  };
  try {
    const result = await request<{
      decision: { selectedStep: SubmitOutcome['selectedStep']; target_skill_id?: string; targetSkillId?: string };
      learningState: { state: string };
      stationPass: boolean;
      semanticEvent: string;
      evidence?: { id?: string } | null;
      attempt: { evaluation?: { correct?: boolean; score?: number; maxScore?: number } };
    }>('/api/v1/learning/attempts/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    void flushPendingSync();
    return {
      correct: Boolean(result.attempt.evaluation?.correct),
      score: result.attempt.evaluation?.score ?? 0,
      maxScore: result.attempt.evaluation?.maxScore ?? 1,
      selectedStep: result.decision.selectedStep,
      stationPass: result.stationPass,
      semanticEvent: result.semanticEvent,
      learningState: result.learningState.state,
      ...(result.decision.target_skill_id || result.decision.targetSkillId ? { decisionTargetSkillId: result.decision.target_skill_id ?? result.decision.targetSkillId } : {}),
      ...(result.evidence?.id ? { evidenceId: result.evidence.id } : {}),
    };
  } catch (error) {
    if (!isRetryableSubmitFailure(error)) throw error;
    const idempotencyKey = await stableActionKey('SUBMIT_ATTEMPT', `${input.sessionId}:${input.encounterId}:${input.attemptNumber}`, payload);
    const manager = await getSyncManager();
    await manager.enqueue({
      id: idempotencyKey,
      clientInstallationId: installationId,
      learningIdentityId: activeLearningIdentityId ?? DEV_LEARNING_ID ?? (() => { throw new Error('LEARNING_IDENTITY_CONTEXT_REQUIRED'); })(),
      operationType: 'SUBMIT_ATTEMPT',
      idempotencyKey,
      payload,
    });
    return {
      correct: false,
      score: 0,
      maxScore: input.content.questions?.length ?? 1,
      selectedStep: 'CONTINUE',
      stationPass: false,
      semanticEvent: 'SYNC_QUEUED',
      learningState: 'PENDING_SYNC',
      syncPending: true,
    };
  }
}

export function getLocalContent(key: keyof typeof localContent): StationContent {
  return localContent[key]!;
}

export function shouldUseRemoteRuntime(): boolean {
  return Boolean(API_BASE_URL) && isProductionApiSafe();
}


export type CollectionProjectionView = {
  engineVersion: string;
  achievements: Array<{
    code: string;
    family: string;
    titleFa: string;
    descriptionFa: string;
    visualAssetRef: string;
    unlocked: boolean;
    unlockedAt: string | null;
  }>;
  inventory: Array<{
    grantId: string;
    rewardCode: string;
    rewardType: string;
    titleFa: string;
    descriptionFa: string;
    sourceType: string;
    grantedAt: string;
    presented: boolean;
  }>;
  summary: {
    achievementsUnlocked: number;
    achievementsTotal: number;
    inventoryCount: number;
    pendingReveals: number;
  };
  setsMastery: false;
  setsStationCompletion: false;
  impliesMoneyValue: false;
};

export async function getCollection(): Promise<CollectionProjectionView> {
  return request<CollectionProjectionView>('/api/v1/collection', { method: 'GET' });
}

export async function acknowledgeCollectionGrant(grantId: string): Promise<CollectionProjectionView> {
  return request<CollectionProjectionView>('/api/v1/collection', {
    method: 'POST',
    body: JSON.stringify({ grantId }),
  });
}


export type AvatarWorkshopServerView = {
  engineVersion: string;
  appearance: {
    basePresetId: string;
    outfitId: string | null;
    hatId: string | null;
    accessoryId: string | null;
    backgroundId: string | null;
    updatedAt: string | null;
  };
  ownedRewardCodes: string[];
  companionCastExcluded: true;
  setsMastery: false;
  impliesMoneyValue: false;
};

export async function getAvatarWorkshop(): Promise<AvatarWorkshopServerView> {
  return request<AvatarWorkshopServerView>('/api/v1/avatar', { method: 'GET' });
}

export async function saveAvatarAppearance(body: {
  basePresetId: string;
  outfitId?: string | null;
  hatId?: string | null;
  accessoryId?: string | null;
  backgroundId?: string | null;
}): Promise<AvatarWorkshopServerView> {
  return request<AvatarWorkshopServerView>('/api/v1/avatar', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}


export type WorldsProjectionView = {
  engineVersion: string;
  worlds: Array<{
    worldId: string;
    code: string;
    number: number;
    unitId: string;
    titleFa: string;
    storyArcFa: string;
    accentToken: string;
    status: 'LOCKED' | 'CURRENT' | 'COMPLETED';
    stationsCompleted: number;
    stationsTotal: number;
    completed: boolean;
    completionRewardCode: string;
    worldChallengeCode: string;
    worldChallengeReady: boolean;
    whatChangedFa: string | null;
  }>;
  currentWorldId: string | null;
  completedWorldCount: number;
  pathIsPrimarySurface: true;
  setsMastery: false;
  inventsLocalUnlocks: false;
};

export async function getWorldsProjection(): Promise<WorldsProjectionView> {
  return request<WorldsProjectionView>('/api/v1/worlds', { method: 'GET' });
}
