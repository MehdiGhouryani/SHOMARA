/**
 * Lesson runtime config for the station flow harness. Scenarios whose name starts with `play` run the REMOTE
 * lesson runtime against an in-page mock of the learning API (the network edge): the real runtimeApi, sessions,
 * encounters, submitAttempt, idempotency keys and attemptNumber all stay real. Every other scenario keeps the
 * local-content path (no API base).
 */
const scenario = typeof location !== 'undefined' ? new URLSearchParams(location.hash.slice(1)).get('scenario') ?? '' : '';
const PLAY = scenario.startsWith('play');

export const API_BASE_URL = PLAY ? 'https://mock.test' : '';
export const isApiConfigured = () => PLAY;
export const isProductionApiSafe = () => true;
export const productionConfigError = () => null;

if (PLAY) installMockLearningServer();

/** The authoritative lesson content the mock server hands back, mirroring the local lesson content (beads, U-Q16). */
const C = (n: number) => `26000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const CONTENT: Record<string, { id: string; title: string; prompt: string; options?: string[]; visualCount?: number; questions?: Array<{ prompt: string; options: string[]; visualCount?: number }> }> = {
  [C(1)]: { id: 'G1-ST01-E01', title: 'اول بشماریم', prompt: 'هر مهره را یکی‌یکی ببین. آخرین عددی که می‌گویی، تعداد همه‌ی مهره‌هاست.' },
  [C(2)]: { id: 'G1-ST01-E02', title: 'یه انتخاب کوچولو', prompt: 'گروهی را انتخاب کن که ۳ مهره دارد.', options: ['۲', '۳', '۴'], visualCount: 3 },
  [C(3)]: { id: 'G1-ST01-E03', title: 'مسیر الگو', prompt: 'کدام مهره باید جای علامت سؤال بیاید؟', options: ['زرد', 'آبی', 'سبز'] },
  [C(4)]: { id: 'G1-ST01-E04', title: 'شکار شمارش', prompt: 'چند مهره می‌بینی؟', options: ['۲', '۳', '۴'], visualCount: 3 },
  [C(5)]: { id: 'G1-ST01-E05', title: 'تمرین مستقل', prompt: 'بدون کمک، تعداد شکل‌ها را پیدا کن.', options: ['۲', '۳', '۴'], visualCount: 3 },
  [C(6)]: { id: 'G1-ST01-E06', title: 'مرور الگو', prompt: 'الگو را سریع کامل کن.', options: ['زرد', 'آبی', 'سبز'] },
  [C(7)]: { id: 'G1-ST01-E07', title: 'چالش اول', prompt: 'در ۵ مأموریت کوتاه، شمارش و تعداد را بررسی کن.', questions: [{ prompt: 'چند مهره؟', options: ['۲', '۳', '۴', '۵'], visualCount: 3 }, { prompt: 'چند مهره؟', options: ['۱', '۲', '۳', '۴'], visualCount: 3 }, { prompt: 'چند مهره؟', options: ['۳', '۴', '۵', '۶'], visualCount: 4 }, { prompt: 'چند مهره؟', options: ['۱', '۲', '۳', '۴'], visualCount: 2 }, { prompt: 'چند مهره؟', options: ['۳', '۴', '۵', '۶'], visualCount: 5 }] },
  [C(8)]: { id: 'G1-ST01-E08', title: 'چالش دوم', prompt: 'حالا یک بررسی تازه و مستقل انجام بده.', questions: [{ prompt: 'چه رنگی جای علامت سؤال می‌آید؟', options: ['زرد', 'آبی', 'سبز'] }, { prompt: 'الگو را کامل کن.', options: ['زرد', 'آبی', 'سبز'] }, { prompt: 'کدام مهره ادامه الگوست؟', options: ['قرمز', 'سبز', 'آبی'] }, { prompt: 'کدام رنگ باید بیاید؟', options: ['زرد', 'آبی', 'سبز'] }, { prompt: 'پایان الگو چیست؟', options: ['زرد', 'آبی', 'سبز'] }] },
  [C(9)]: { id: 'G1-ST01-E09', title: 'با هم دوباره', prompt: 'این بار آهسته‌تر: هر مهره را یکی‌یکی لمس کن و تا ۳ بشمار.', options: ['۱', '۲', '۳'], visualCount: 3 },
  [C(10)]: { id: 'G1-ST01-E10', title: 'بررسی دوباره', prompt: 'بعد از تمرین بازیابی، یک بررسی تازه انجام بده.', questions: [{ prompt: 'چند مهره داریم؟', options: ['۲', '۳', '۴'], visualCount: 3 }, { prompt: 'چند مهره داریم؟', options: ['۱', '۲', '۳'], visualCount: 1 }, { prompt: 'چند مهره داریم؟', options: ['۱', '۲', '۳'], visualCount: 2 }, { prompt: 'چند مهره داریم؟', options: ['۱', '۲', '۳'], visualCount: 3 }, { prompt: 'چند مهره داریم؟', options: ['۱', '۲', '۳'], visualCount: 2 }] },
  [C(11)]: { id: 'G1-ST01-E11', title: 'در دنیای واقعی', prompt: 'قانون الگو را در یک موقعیت تازه پیدا کن.', options: ['الگو A', 'الگو B', 'الگو C'] },
  [C(12)]: { id: 'G1-ST01-E12', title: 'چالش نهایی مهارت', prompt: 'قانون الگو را در ۵ موقعیت تازه بررسی کن.', questions: [{ prompt: 'گزینه درست چیست؟', options: ['زرد', 'آبی', 'سبز'] }, { prompt: 'الگو را کامل کن.', options: ['قرمز', 'سبز', 'آبی'] }, { prompt: 'کدام مورد ادامه الگوست؟', options: ['سبز', 'زرد', 'آبی'] }, { prompt: 'چه رنگی می‌آید؟', options: ['زرد', 'آبی', 'سبز'] }, { prompt: 'پایان الگو چیست؟', options: ['آبی', 'سبز', 'زرد'] }] },
  // Recovery / recheck variants the redirected paths can ask for.
  [C(13)]: { id: 'G1-ST01-E09', title: 'با هم دوباره', prompt: 'این بار آهسته‌تر: هر مهره را یکی‌یکی لمس کن و تا ۳ بشمار.', options: ['۱', '۲', '۳'], visualCount: 3 },
  [C(14)]: { id: 'G1-ST01-E09', title: 'دوباره و آهسته‌تر', prompt: 'گروه را بشمار و عدد آخر را انتخاب کن.', options: ['۲', '۳', '۴'], visualCount: 3 },
  [C(15)]: { id: 'G1-ST01-E09', title: 'با هم الگو می‌سازیم', prompt: 'رنگی را انتخاب کن که الگو را کامل می‌کند.', options: ['زرد', 'آبی', 'سبز'] },
  [C(16)]: { id: 'G1-ST01-E09', title: 'قانون الگو را دوباره پیدا کن', prompt: 'کدام گزینه قانون الگو را کامل می‌کند؟', options: ['الگو A', 'الگو B', 'الگو C'] },
  [C(17)]: { id: 'G1-ST01-E10', title: 'بررسی دوباره', prompt: 'بعد از تمرین بازیابی، یک بررسی تازه انجام بده.', questions: [{ prompt: 'چند مهره داریم؟', options: ['۲', '۳', '۴'], visualCount: 3 }] },
  [C(18)]: { id: 'G1-ST01-E10', title: 'بررسی دوباره تعداد', prompt: 'در پنج سؤال تازه، تعداد را بررسی کن.', questions: [{ prompt: 'چند شیء است؟', options: ['۲', '۳', '۴'], visualCount: 3 }] },
  [C(19)]: { id: 'G1-ST01-E10', title: 'بررسی دوباره الگو', prompt: 'الگو را در پنج موقعیت تازه بررسی کن.', questions: [{ prompt: 'چه رنگی می‌آید؟', options: ['زرد', 'آبی', 'سبز'] }] },
  [C(20)]: { id: 'G1-ST01-E10', title: 'بررسی دوباره قانون الگو', prompt: 'قانون الگو را در پنج موقعیت تازه بررسی کن.', questions: [{ prompt: 'قانون درست چیست؟', options: ['A', 'B', 'C'] }] },
};
// The mock server owns the answer key: the correct option index per encounter (or per question for checks).
const ANSWER_KEY: Record<string, number | number[]> = {
  [C(1)]: 0, [C(2)]: 1, [C(3)]: 1, [C(4)]: 1, [C(5)]: 1, [C(6)]: 1, [C(9)]: 2, [C(11)]: 1,
  [C(13)]: 2, [C(14)]: 1, [C(15)]: 1, [C(16)]: 1,
  [C(7)]: [1, 2, 1, 1, 3], // check A: count each group
  [C(8)]: [1, 1, 2, 1, 1], // check B: continue each pattern
  [C(10)]: [1, 1, 1, 1, 1], [C(17)]: [1], [C(18)]: [1], [C(19)]: [1], [C(20)]: [1],
  [C(12)]: [1, 2, 2, 1, 0], // final mastery check
};
// A fully correct answer on one of these checks is what this simplified policy treats as a Station Pass
// (the real two-check 4-of-5 policy lives in the learning runtime; the client only follows the decision).
const PASS_GRANTING_CHECKS = new Set([C(8), C(10), C(12), C(18), C(19), C(20)]);

type FlowRecorder = { submits: Array<{ contentVersionId: string; attemptNumber: number; answerIndex: number; idempotencyKey: string }> };

  const chRound = (roundIndex: number) => ({ encounterId: `ch-enc-${roundIndex}`, roundIndex, attemptNumber: 1, level: 'CORE' as const, skillId: 'G1-SK009', contentVersionId: C(3), interactionType: 'SINGLE_CHOICE', prompt: 'کدام مهره ادامه الگوست؟', title: 'چالش الگو', options: ['زرد', 'آبی', 'سبز'], display: null, sequence: null, content: null });

function installMockLearningServer() {
  const flow = () => (window as unknown as { __flow: FlowRecorder }).__flow;
  const encounters = new Map<string, { contentVersionId: string; wrongCount: number }>();
  const seenKeys = new Set<string>();
  let sessionCounter = 0;
  let challengeRound = 0;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const path = url.pathname;
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};

    if (path.endsWith('/client/installations')) return json({});
    if (path === '/api/v1/learning/sessions' && init?.method === 'POST') {
      sessionCounter += 1;
      return json({ id: `sess-${sessionCounter}`, learningIdentityId: 'dev-child-001' });
    }
    if (/^\/api\/v1\/learning\/sessions\/[^/]+\/encounters$/.test(path) && init?.method === 'POST') {
      const contentVersionId = String(body.contentVersionId ?? '');
      const sequence = Number(body.sequence ?? 1);
      const encounterId = `enc-s${sessionCounter}-${sequence}`;
      encounters.set(encounterId, { contentVersionId, wrongCount: 0 });
      const content = CONTENT[contentVersionId];
      if (!content) return json({ error: 'MOCK_CONTENT_MISSING' }, 404);
      return json({ encounter: { id: encounterId, sequence, content: { ...content, stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: String(body.learningRole ?? 'GUIDED_PRACTICE'), experienceForm: String(body.experienceForm ?? 'PUZZLE') } } });
    }
    if (path === '/api/v1/learning/attempts/submit' && init?.method === 'POST') {
      const encounterId = String(body.encounterId ?? '');
      const record = encounters.get(encounterId);
      const contentVersionId = record?.contentVersionId ?? '';
      const attemptNumber = Number(body.attemptNumber ?? 1);
      const idempotencyKey = String(body.clientIdempotencyKey ?? '');
      const answers = ((body.answers as Array<{ answerIndex: number }> | undefined) ?? []).map((a) => Number(a.answerIndex));
      const key = ANSWER_KEY[contentVersionId];
      const correct = Array.isArray(key) ? answers.length > 0 && answers.every((a, i) => a === key[i]) : key === answers[0];
      if (record && !correct) record.wrongCount += 1;
      flow().submits.push({ contentVersionId, attemptNumber, answerIndex: answers[0] ?? -1, idempotencyKey });
      if (seenKeys.has(idempotencyKey)) throw new Error(`MOCK_IDEMPOTENCY_REPLAY:${idempotencyKey}`);
      seenKeys.add(idempotencyKey);
      // Wrong answers: the first may be retried on the same item; a second wrong answer is redirected to
      // recovery. The decision belongs to the server; the client only follows it (D-002).
      const selectedStep = correct || (record?.wrongCount ?? 0) < 2 ? 'CONTINUE' : 'RECOVERY';
      return json({
        idempotent: false,
        decision: { selectedStep, ...(selectedStep === 'RECOVERY' ? { target_skill_id: 'G1-SK001' } : {}) },
        learningState: { state: 'IN_PROGRESS' },
        stationPass: correct && PASS_GRANTING_CHECKS.has(contentVersionId),
        semanticEvent: correct ? 'ANSWER_CORRECT' : 'ANSWER_WRONG',
        evidence: { id: `ev-${flow().submits.length}` },
        attempt: { evaluation: { correct, score: correct ? 1 : 0, maxScore: 1 } },
      });
    }
    // The Signature Challenge run (page 12 leads into it; the player itself has no approved page).
    if (path === '/api/v1/challenges/runs' && init?.method === 'POST') {
      challengeRound = 0;
      return json({ idempotent: true, runId: 'ch-run-1', status: 'ACTIVE', challenge: { challengeId: 'ch-def-1', code: 'G1-ST01-CH-01', version: 1, stationId: 'ST01', gameCode: 'pattern-path', objective: 'الگو را ادامه بده', plannedRounds: 3, timerPolicy: { policy: 'NONE' }, hintLadder: [], finalMoment: 'SUMMARY_CELEBRATION', contractVersion: 'mock-v1' }, currentRoundIndex: 0, plannedRounds: 3, next: chRound(0), result: null });
    }
    if (/^\/api\/v1\/challenges\/runs\/[^/]+\/rounds$/.test(path) && init?.method === 'POST') {
      const answerIndex = Number((body.answers as Array<{ answerPayload: number }> | undefined)?.[0]?.answerPayload ?? -1);
      const correct = answerIndex === 1; // آبی continues the pattern
      const roundIndex = Number(body.roundIndex ?? 0);
      const done = roundIndex >= 2;
      challengeRound = roundIndex + 1;
      return json({
        idempotent: false, runId: 'ch-run-1', roundIndex, attemptNumber: 1, correct, score: correct ? 1 : 0, maxScore: 1, evaluatorVersion: 'mock',
        semanticEvent: correct ? 'ANSWER_CORRECT' : 'ANSWER_WRONG', roundClosed: true, roundSolved: correct, scaffoldNext: false, offerHint: false, evidenceId: null,
        next: done ? null : chRound(challengeRound),
        runStatus: done ? 'COMPLETED' : 'ACTIVE',
        result: done ? { result: 'COMPLETED' as const, semanticEvent: 'MILESTONE' as const, solvedRounds: 3, plannedRounds: 3, rewardEligible: false, rewardGrantKey: null, setsMastery: false as const, setsStationCompletion: false as const } : null,
      });
    }
    if (/^\/api\/v1\/challenges\/runs\/[^/]+\/hints$/.test(path) && init?.method === 'POST') {
      return json({ idempotent: true, runId: 'ch-run-1', roundIndex: Number(body.roundIndex ?? 0), hintLevel: 'STRATEGY', hintsUsed: 1, reducesReward: false as const, revealsFinalAnswer: false as const });
    }
    return realFetch(input, init);
  };
}
