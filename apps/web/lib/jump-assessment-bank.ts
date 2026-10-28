import { JUMP_ASSESSMENTS } from '@math/contracts';

const ANSWER_KEYS: Record<string, number[]> = {
  'JUMP-U02': [1, 2, 1, 0, 1],
  'JUMP-U03': [1, 1, 1, 1, 1],
  'JUMP-U04': [1, 1, 1, 1, 1],
  'JUMP-U05': [1, 1, 1, 1, 0],
};

export function publicJumpAssessment(targetStationId: string) {
  const assessment = JUMP_ASSESSMENTS.find((item) => item.targetStationId === targetStationId);
  if (!assessment) return null;
  return {
    id: assessment.id,
    targetUnitId: assessment.targetUnitId,
    targetStationId: assessment.targetStationId,
    title: assessment.title,
    intro: assessment.intro,
    questions: assessment.questions.map(({ id, targetStationId: questionTargetStationId, prompt, options }) => ({ id, targetStationId: questionTargetStationId, prompt, options })),
  };
}

export function evaluateJumpAssessment(assessmentId: string, answers: Record<string, number>) {
  const assessment = JUMP_ASSESSMENTS.find((item) => item.id === assessmentId);
  const key = ANSWER_KEYS[assessmentId];
  if (!assessment || !key) return { ok: false as const, code: 'JUMP_ASSESSMENT_NOT_FOUND' };
  if (Object.keys(answers).length !== assessment.questions.length) return { ok: false as const, code: 'JUMP_ANSWERS_INCOMPLETE' };

  let correctCount = 0;
  assessment.questions.forEach((question, index) => {
    if (answers[question.id] === key[index]) correctCount += 1;
  });
  const passed = correctCount / assessment.questions.length >= 0.8;
  return {
    ok: true as const,
    assessmentId,
    targetStationId: assessment.targetStationId,
    targetUnitId: assessment.targetUnitId,
    correctCount,
    totalCount: assessment.questions.length,
    passed,
  };
}
