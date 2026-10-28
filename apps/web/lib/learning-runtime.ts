import {
  InMemoryLearningRuntimeRepository,
  LearningRuntime,
  type RuntimeContentVersion,
  type SessionRecord,
} from '@math/learning-runtime';

const globalStore = globalThis as typeof globalThis & {
  __mathLearningRuntime?: { repo: InMemoryLearningRuntimeRepository; engine: LearningRuntime };
};

function createStore() {
  const repo = new InMemoryLearningRuntimeRepository();
  const content: RuntimeContentVersion[] = [
    { id: 'G1-ST01-E01', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'INSTRUCTION', experienceForm: 'CONVERSATION_EXPLANATION', interactionType: 'TAP', prompt: 'Count the stars one by one.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'instruction-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000001', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'INSTRUCTION', experienceForm: 'CONVERSATION_EXPLANATION', interactionType: 'TAP', prompt: 'Count the stars one by one.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'instruction-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E02', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'GUIDED_PRACTICE', experienceForm: 'PUZZLE', interactionType: 'TAP', prompt: 'Choose the group with three stars.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'tap-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000002', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'GUIDED_PRACTICE', experienceForm: 'PUZZLE', interactionType: 'TAP', prompt: 'Choose the group with three stars.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'tap-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E03', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Continue the pattern.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'pattern-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000003', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Continue the pattern.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'pattern-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E04', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Count the stars.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'count-game-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000004', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK003', learningRole: 'GUIDED_PRACTICE', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Count the stars.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'count-game-v1', expectedAnswers: [1], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E05', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'INDEPENDENT_PRACTICE', experienceForm: 'PUZZLE', interactionType: 'MULTIPLE_CHOICE', prompt: 'Choose the matching number.', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'independent-count-v1', expectedAnswers: [2], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000005', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'INDEPENDENT_PRACTICE', experienceForm: 'PUZZLE', interactionType: 'MULTIPLE_CHOICE', prompt: 'Choose the matching number.', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'independent-count-v1', expectedAnswers: [2], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E06', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'REVIEW', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Review the pattern.', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'review-pattern-v1', expectedAnswers: [0], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000006', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'REVIEW', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'Review the pattern.', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'review-pattern-v1', expectedAnswers: [0], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E07', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE', interactionType: 'COUNT', prompt: 'How many shapes are there?', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'check-a-v2', expectedAnswers: [1, 2, 2, 1, 2], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000007', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE', interactionType: 'COUNT', prompt: 'How many shapes are there?', answerSchema: { type: 'integer' }, evaluatorConfig: { version: 'check-a-v2', expectedAnswers: [1, 2, 2, 1, 2], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E08', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE', interactionType: 'MINI_GAME', prompt: 'Complete the pattern.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'check-b-v2', expectedAnswers: [1, 2, 1, 0, 2], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000008', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK009', learningRole: 'MASTERY_CHECK', experienceForm: 'CHALLENGE', interactionType: 'MINI_GAME', prompt: 'Complete the pattern.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'check-b-v2', expectedAnswers: [1, 2, 1, 0, 2], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E09', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'GUIDED_PRACTICE', experienceForm: 'BUILD_EXPLORE', interactionType: 'COUNT', prompt: 'Build a group of three.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'recovery-v1', expectedAnswers: [2], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000009', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'GUIDED_PRACTICE', experienceForm: 'BUILD_EXPLORE', interactionType: 'COUNT', prompt: 'Build a group of three.', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'recovery-v1', expectedAnswers: [2], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} },
    { id: 'G1-ST01-E10', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'How many stars are there now?', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'recheck-v2', expectedAnswers: [1, 0, 1, 2, 1], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
    { id: '26000000-0000-4000-8000-000000000010', gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME', prompt: 'How many stars are there now?', answerSchema: { type: 'number' }, evaluatorConfig: { version: 'recheck-v2', expectedAnswers: [1, 0, 1, 2, 1], maxScore: 5 }, feedbackConfig: {}, hintConfig: {} },
  ];
  for (const item of content) repo.registerContent(item);
  return { repo, engine: new LearningRuntime(repo) };
}

const store = globalStore.__mathLearningRuntime ?? createStore();
globalStore.__mathLearningRuntime = store;
export const runtimeStore = store;

export function createSessionId(): string {
  return `dev-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEncounterId(): string {
  return `dev-encounter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSessionOrThrow(id: string): Promise<SessionRecord> {
  return runtimeStore.repo.getSession(id).then((session: SessionRecord | null | undefined) => {
    if (!session) throw new Error('SESSION_NOT_FOUND');
    return session;
  });
}
