export type StationStage =
  | 'ENTRY'
  | 'LEARN'
  | 'GUIDED'
  | 'GAME_PATTERN'
  | 'GAME_COUNT'
  | 'INDEPENDENT'
  | 'REVIEW'
  | 'TRANSFER'
  | 'CHECK_A'
  | 'CHECK_B'
  | 'MASTERY_CHECK'
  | 'RESULT'
  | 'RECOVERY'
  | 'RECHECK'
  | 'COMPLETE'
  | 'SIGNATURE_CHALLENGE';

export type AnswerPayload = { answerIndex: number; answerPayload: unknown };
export type CheckQuestion = { prompt: string; options: string[]; expected?: unknown; visualCount?: number };

export interface StationContent {
  id: string;
  title: string;
  prompt: string;
  stationId: string;
  skillId: string;
  learningRole: string;
  contentVersionId?: string;
  experienceForm: string;
  options?: string[];
  expected?: unknown;
  visualCount?: number;
  questions?: CheckQuestion[];
}

export interface SubmitOutcome {
  correct: boolean;
  score: number;
  maxScore: number;
  semanticEvent: string;
  stationPass: boolean;
  selectedStep: 'CONTINUE' | 'RECOVERY' | 'RECHECK' | 'STATION_PASS';
  evidenceId?: string;
  learningState: string;
  syncPending?: boolean;
  decisionTargetSkillId?: string;
}
