import { describe, expect, it } from 'vitest';
import {
  AUDIO_LIFECYCLE_STAGES,
  AUDIO_POLICY,
  AuthoringStation,
  ChildLessonProjection,
  CONTENT_LIFECYCLE_STAGES,
  MACRO_STAGES,
  REVIEW_ROLES,
  SERVER_LEARNING_CONFIG,
  behaviorIdFor,
  canonicalStageFromLegacy,
  hintViolations,
  prerequisiteViolations,
  projectForChild,
  projectionViolations,
  publishForDelivery,
  reviewRoleViolations,
  telemetryViolations,
} from '../content-projection';

const authoring: AuthoringStation = {
  stationId: 'ST07',
  lifecycle: 'APPROVED',
  evaluatorConfig: { version: 'check-a-v2', expectedAnswers: [1, 2, 2, 1, 2], pass_threshold: 0.75 },
  passThreshold: '3/4',
  reviewEvidence: [
    { role: 'curriculum', reviewerId: 'rev-1', decidedAt: '2026-10-28' },
    { role: 'persian_pronunciation', reviewerId: 'rev-2', decidedAt: '2026-10-28' },
    { role: 'accessibility', reviewerId: 'rev-3', decidedAt: '2026-10-28' },
    { role: 'rights_moderation', reviewerId: 'rev-4', decidedAt: '2026-10-28' },
  ],
  prerequisites: [{ fromStationId: 'ST06', toStationId: 'ST07' }],
  provenance: { approvalStatus: 'CANONICAL_APPROVED', reviewerId: 'owner-1' },
  advanceProse: 'بعد از تمرین، ادامه بده.',
  interactionProse: 'کودک عدد را می‌کشد.',
  behaviorId: 'P2_GUIDED_DRAG',
};

const macroStages = ['P1_DISCOVER', 'P2_GUIDED', 'P3_GAME', 'P4_ASSESSMENT', 'P5_TRANSFER'] as const;

describe('content 3-tier projection boundary (N06-01/09/11)', () => {
  it('canonical lifecycles have exactly 7 stages each and 4 review roles', () => {
    expect([...CONTENT_LIFECYCLE_STAGES]).toEqual([
      'SOURCE_ONLY', 'MAPPED_TO_REPO', 'STAGED', 'VALIDATED', 'HUMAN_REVIEWED', 'APPROVED', 'ENABLED',
    ]);
    expect([...AUDIO_LIFECYCLE_STAGES]).toEqual([
      'DRAFT', 'GENERATED_OR_UPLOADED', 'TECHNICALLY_VALIDATED', 'LISTENED', 'RIGHTS_CLEARED', 'APPROVED', 'PUBLISHED',
    ]);
    expect([...REVIEW_ROLES]).toEqual(['curriculum', 'persian_pronunciation', 'accessibility', 'rights_moderation']);
    expect([...MACRO_STAGES]).toEqual(['P1_DISCOVER', 'P2_GUIDED', 'P3_GAME', 'P4_ASSESSMENT', 'P5_TRANSFER']);
  });

  it('legacy Stage-6 prose states map onto the canonical lifecycle', () => {
    expect(canonicalStageFromLegacy('draft')).toBe('STAGED');
    expect(canonicalStageFromLegacy('validated')).toBe('VALIDATED');
    expect(canonicalStageFromLegacy('reviewed')).toBe('HUMAN_REVIEWED');
    expect(canonicalStageFromLegacy('approved')).toBe('APPROVED');
  });

  it('behavior IDs are typed, prose stays author-facing', () => {
    expect(behaviorIdFor('P4_ASSESSMENT', 'select')).toBe('P4_ASSESSMENT_SELECT');
    expect(behaviorIdFor('P1_DISCOVER', 'tap')).toBe('P1_DISCOVER_TAP');
  });

  it('server learning config owns jump counts, mastery threshold and trace tolerance (CONTENT-002/014/001)', () => {
    expect(SERVER_LEARNING_CONFIG.stationJumpQuestionCount).toBe(1);
    expect(SERVER_LEARNING_CONFIG.chapterJumpQuestionCount).toBe(5);
    expect(SERVER_LEARNING_CONFIG.masteryPassThreshold).toBe('3/4');
    expect(SERVER_LEARNING_CONFIG.traceToleranceDp).toBe(28);
    expect(SERVER_LEARNING_CONFIG.audioPolicy).toBe('EXPECTED_NEVER_BLOCKING');
  });

  it('review-role validator demands all four distinct roles', () => {
    expect(reviewRoleViolations(authoring.reviewEvidence)).toEqual([]);
    const missing = reviewRoleViolations(authoring.reviewEvidence.filter((e) => e.role !== 'accessibility'));
    expect(missing).toEqual(['missing review role: accessibility']);
  });

  it('prerequisite validator detects unknown refs, self-edges and cycles', () => {
    expect(prerequisiteViolations(authoring.prerequisites, ['ST06', 'ST07'])).toEqual([]);
    expect(prerequisiteViolations([{ fromStationId: 'ST99', toStationId: 'ST07' }], ['ST07'])).toEqual([
      'unknown prerequisite source: ST99',
    ]);
    // A self-edge is BOTH a self-edge and (trivially) a cycle.
    const selfEdge = prerequisiteViolations([{ fromStationId: 'ST07', toStationId: 'ST07' }], ['ST07']);
    expect(selfEdge).toContain('self-edge: ST07');
    expect(selfEdge.join(' ')).toContain('cycle');
    const cycle = [
      { fromStationId: 'ST01', toStationId: 'ST02' },
      { fromStationId: 'ST02', toStationId: 'ST03' },
      { fromStationId: 'ST03', toStationId: 'ST01' },
    ];
    expect(prerequisiteViolations(cycle, ['ST01', 'ST02', 'ST03']).join(' ')).toContain('cycle');
  });

  it('publishing rejects non-approved lifecycle and incomplete review roles', () => {
    expect(() => publishForDelivery({ ...authoring, lifecycle: 'STAGED' }, 1, 'abc', macroStages, [])).toThrow(
      'PUBLISH_REJECTED',
    );
    expect(() =>
      publishForDelivery(
        { ...authoring, reviewEvidence: authoring.reviewEvidence.slice(0, 2) },
        1,
        'abc',
        macroStages,
        [],
      ),
    ).toThrow('REVIEW_ROLES_INCOMPLETE');
  });

  it('publish keeps the evaluator as a server reference only', () => {
    const published = publishForDelivery(authoring, 3, 'sha:abc', macroStages, ['audio-1']);
    expect(published.evaluatorServerRef).toBe('server-evaluator://ST07');
    expect(JSON.stringify(published)).not.toContain('expectedAnswers');
    expect(JSON.stringify(published)).not.toContain('pass_threshold');
    expect(JSON.stringify(published)).not.toContain('provenance');
  });

  it('child projection contains zero answer-key/evaluator/threshold/reviewer/hint keys (CONTENT-008/003)', () => {
    const published = publishForDelivery(authoring, 3, 'sha:abc', macroStages, ['audio-1']);
    const child = projectForChild(published, {
      prompt: 'عدد ۱ را پیدا کن.',
      visibleOptions: ['۱', '۲'],
      interactionConfig: { behaviorId: 'P4_ASSESSMENT_SELECT', options: ['۱', '۲'] },
      accessibilityCopy: 'با TalkBack عدد ۱ را انتخاب کن.',
    });
    expect(projectionViolations(child)).toEqual([]);
    const serialized = JSON.stringify(child);
    for (const banned of ['expectedAnswers', 'pass_threshold', 'reviewerId', 'provenance', 'nextStep', 'evaluatorConfig']) {
      expect(serialized).not.toContain(banned);
    }
    // Deep contamination attempt is caught.
    const contaminated = JSON.parse(JSON.stringify(child)) as ChildLessonProjection;
    (contaminated.interactionConfig as Record<string, unknown>)['correctAnswer'] = '۱';
    (contaminated.interactionConfig as Record<string, unknown>)['h1'] = 'اولین گزینه';
    expect(projectionViolations(contaminated).length).toBeGreaterThan(0);
  });

  it('projection refuse contamination at construction time', () => {
    const published = publishForDelivery(authoring, 3, 'sha:abc', macroStages, []);
    expect(() =>
      projectForChild(published, {
        prompt: 'p',
        visibleOptions: [],
        interactionConfig: { hint: 'پاسخ دوم است' },
        accessibilityCopy: 'a',
      }),
    ).toThrow('PROJECTION_CONTAMINATED');
  });

  it('P4/P5 hint ban is strict while P1..P3 scaffolding stays allowed (CONTENT-003)', () => {
    const payload = { scaffold: { h1: 'نگاه کن' } };
    expect(hintViolations(['P2_GUIDED'], payload)).toEqual([]);
    expect(hintViolations(['P4_ASSESSMENT'], payload).join(' ')).toContain('h1');
    expect(hintViolations(['P5_TRANSFER'], { hints: ['x'] }).length).toBeGreaterThan(0);
  });

  it('telemetry carries minimal IDs and rejects forbidden/unknown fields (CONTENT-018)', () => {
    expect(
      telemetryViolations({
        sessionId: 's1',
        encounterId: 'e1',
        interactionId: 'P4_ASSESSMENT_SELECT',
        choiceId: 'opt-1',
        macroStage: 'P4_ASSESSMENT',
      }),
    ).toEqual([]);
    expect(
      telemetryViolations({
        sessionId: 's1',
        encounterId: 'e1',
        interactionId: 'i',
        choiceId: null,
        macroStage: 'P4_ASSESSMENT',
        answer: '۲',
        isCorrect: true,
      } as unknown as Parameters<typeof telemetryViolations>[0]).join(' '),
    ).toContain('answer');
  });

  it('audio policy is EXPECTED_NEVER_BLOCKING everywhere (CONTENT-017)', () => {
    const published = publishForDelivery(authoring, 3, 'sha:abc', macroStages, ['audio-1']);
    const child = projectForChild(published, { prompt: 'p', visibleOptions: [], interactionConfig: {}, accessibilityCopy: 'a' });
    expect(child.audioPolicy).toBe(AUDIO_POLICY);
    expect(child.audioPolicy).toBe('EXPECTED_NEVER_BLOCKING');
  });
});
