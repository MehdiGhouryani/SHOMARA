export type AnimationSemanticEvent =
  | 'SESSION_START'
  | 'EXPLAIN'
  | 'ANSWER_CORRECT'
  | 'ANSWER_WRONG'
  | 'NEAR_MISS'
  | 'HINT_OPENED'
  | 'RECOVERY'
  | 'STATION_PASS'
  | 'MILESTONE'
  | 'REWARD_GRANTED';

export type CharacterVisualState =
  | 'IDLE'
  | 'THINK'
  | 'ENCOURAGE'
  | 'CORRECT'
  | 'CELEBRATE'
  | 'RECOVERY';

export interface AnimationEventPayload {
  type: AnimationSemanticEvent;
  timestamp: string;
  sessionId?: string;
  stationId?: string;
}

export const DEFAULT_CHARACTER_STATE: CharacterVisualState = 'IDLE';

export const CHARACTER_STATE_BY_EVENT: Readonly<Record<AnimationSemanticEvent, CharacterVisualState>> = {
  SESSION_START: 'IDLE',
  EXPLAIN: 'THINK',
  ANSWER_CORRECT: 'CORRECT',
  ANSWER_WRONG: 'ENCOURAGE',
  NEAR_MISS: 'ENCOURAGE',
  HINT_OPENED: 'THINK',
  RECOVERY: 'RECOVERY',
  STATION_PASS: 'CELEBRATE',
  MILESTONE: 'CELEBRATE',
  REWARD_GRANTED: 'CELEBRATE',
};
