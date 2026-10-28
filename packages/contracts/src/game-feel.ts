/**
 * P03 — shared game-feel semantics for Android and Web.
 *
 * This module is presentation policy only. It never decides correctness,
 * mastery, rewards, or progression; callers pass in already-authoritative
 * learning outcomes (semantic events) or local, non-learning interaction
 * events (tap/drag/reveal). See ADR-0034.
 */
import type { AnimationSemanticEvent, CharacterVisualState } from './animation';

/** Local, renderer-level interaction events. They never change learning truth or the character state. */
export type InteractionFeedbackEvent =
  | 'TAP'
  | 'DRAG_START'
  | 'DROP_ACCEPTED'
  | 'DROP_REJECTED'
  | 'DROP_NEAR_MISS'
  | 'DROP_OUTSIDE'
  | 'PROGRESS_FILL'
  | 'HINT_REVEAL'
  | 'BADGE_REVEAL'
  | 'UNLOCK_REVEAL'
  | 'REWARD_REVEAL';

export const INTERACTION_FEEDBACK_EVENTS: readonly InteractionFeedbackEvent[] = [
  'TAP', 'DRAG_START', 'DROP_ACCEPTED', 'DROP_REJECTED', 'DROP_NEAR_MISS', 'DROP_OUTSIDE',
  'PROGRESS_FILL', 'HINT_REVEAL', 'BADGE_REVEAL', 'UNLOCK_REVEAL', 'REWARD_REVEAL',
];

export type FeedbackTone = 'NEUTRAL' | 'POSITIVE' | 'ENCOURAGE' | 'CELEBRATE';
export type FeedbackMotion = 'NONE' | 'PRESS' | 'PULSE' | 'POP' | 'CELEBRATE';
export type FeedbackHaptic = 'NONE' | 'LIGHT' | 'SUCCESS' | 'SOFT_NUDGE' | 'CELEBRATE';
/** Named cue slots. Asset playback is P12; every cue is optional by contract. */
export type FeedbackAudioCue = 'NONE' | 'TAP' | 'POSITIVE' | 'ENCOURAGE' | 'CELEBRATE' | 'REVEAL';

export interface FeedbackSpec {
  tone: FeedbackTone;
  /** Character reaction; `null` for interaction events that must not change the companion. */
  characterState: CharacterVisualState | null;
  motion: FeedbackMotion;
  /** How long the transient reaction stays visible (also used as the read window when motion is off). */
  durationMs: number;
  blocksInput: boolean;
  haptic: FeedbackHaptic;
  audioCue: FeedbackAudioCue;
  /** Visible short copy. Required for every non-neutral tone so the feedback survives with audio off. */
  message?: string;
  /** Screen-reader announcement; defaults to `message`. */
  announcement?: string;
}

/** Product-wide feedback budgets (Roadmap §4.7). */
export const FEEDBACK_BUDGET_MS = {
  interaction: 300,
  answer: 900,
  celebration: 1600,
} as const;

const spec = (s: FeedbackSpec): FeedbackSpec => s;

export const FEEDBACK_BY_SEMANTIC_EVENT: Readonly<Record<AnimationSemanticEvent, FeedbackSpec>> = {
  SESSION_START: spec({ tone: 'NEUTRAL', characterState: 'IDLE', motion: 'NONE', durationMs: 0, blocksInput: false, haptic: 'NONE', audioCue: 'NONE' }),
  EXPLAIN: spec({ tone: 'NEUTRAL', characterState: 'THINK', motion: 'PULSE', durationMs: 650, blocksInput: false, haptic: 'NONE', audioCue: 'NONE' }),
  ANSWER_CORRECT: spec({ tone: 'POSITIVE', characterState: 'CORRECT', motion: 'POP', durationMs: 650, blocksInput: false, haptic: 'SUCCESS', audioCue: 'POSITIVE', message: 'درست بود!' }),
  ANSWER_WRONG: spec({ tone: 'ENCOURAGE', characterState: 'ENCOURAGE', motion: 'PULSE', durationMs: 700, blocksInput: false, haptic: 'SOFT_NUDGE', audioCue: 'ENCOURAGE', message: 'دوباره امتحان کن.' }),
  NEAR_MISS: spec({ tone: 'ENCOURAGE', characterState: 'ENCOURAGE', motion: 'PULSE', durationMs: 700, blocksInput: false, haptic: 'LIGHT', audioCue: 'ENCOURAGE', message: 'خیلی نزدیک بود! یک بار دیگر.' }),
  HINT_OPENED: spec({ tone: 'NEUTRAL', characterState: 'THINK', motion: 'PULSE', durationMs: 450, blocksInput: false, haptic: 'NONE', audioCue: 'NONE', announcement: 'یک راهنما آماده است.' }),
  RECOVERY: spec({ tone: 'ENCOURAGE', characterState: 'RECOVERY', motion: 'PULSE', durationMs: 900, blocksInput: false, haptic: 'LIGHT', audioCue: 'ENCOURAGE', message: 'این بار با یک راه ساده‌تر جلو می‌رویم.' }),
  STATION_PASS: spec({ tone: 'CELEBRATE', characterState: 'CELEBRATE', motion: 'CELEBRATE', durationMs: 1400, blocksInput: true, haptic: 'CELEBRATE', audioCue: 'CELEBRATE', message: 'ایستگاه را فتح کردی!' }),
  MILESTONE: spec({ tone: 'CELEBRATE', characterState: 'CELEBRATE', motion: 'CELEBRATE', durationMs: 1400, blocksInput: true, haptic: 'CELEBRATE', audioCue: 'CELEBRATE', message: 'یک قدم مهم جلو رفتی!' }),
  REWARD_GRANTED: spec({ tone: 'CELEBRATE', characterState: 'CELEBRATE', motion: 'CELEBRATE', durationMs: 1400, blocksInput: true, haptic: 'CELEBRATE', audioCue: 'CELEBRATE', message: 'یک جایزه جدید گرفتی!' }),
};

export const FEEDBACK_BY_INTERACTION_EVENT: Readonly<Record<InteractionFeedbackEvent, FeedbackSpec>> = {
  TAP: spec({ tone: 'NEUTRAL', characterState: null, motion: 'PRESS', durationMs: 90, blocksInput: false, haptic: 'LIGHT', audioCue: 'TAP' }),
  DRAG_START: spec({ tone: 'NEUTRAL', characterState: null, motion: 'PRESS', durationMs: 120, blocksInput: false, haptic: 'LIGHT', audioCue: 'NONE' }),
  DROP_ACCEPTED: spec({ tone: 'NEUTRAL', characterState: null, motion: 'POP', durationMs: 240, blocksInput: false, haptic: 'LIGHT', audioCue: 'TAP', announcement: 'سر جایش گذاشتی.' }),
  // REJECTED/OUTSIDE/NEAR_MISS describe placement only; they are not answer verdicts.
  DROP_REJECTED: spec({ tone: 'NEUTRAL', characterState: null, motion: 'PULSE', durationMs: 220, blocksInput: false, haptic: 'SOFT_NUDGE', audioCue: 'NONE', announcement: 'اینجا جا نمی‌شود؛ جای دیگری را امتحان کن.' }),
  DROP_NEAR_MISS: spec({ tone: 'NEUTRAL', characterState: null, motion: 'PULSE', durationMs: 220, blocksInput: false, haptic: 'LIGHT', audioCue: 'NONE', announcement: 'نزدیک بود؛ کمی جلوتر بکش.' }),
  DROP_OUTSIDE: spec({ tone: 'NEUTRAL', characterState: null, motion: 'NONE', durationMs: 0, blocksInput: false, haptic: 'NONE', audioCue: 'NONE' }),
  PROGRESS_FILL: spec({ tone: 'NEUTRAL', characterState: null, motion: 'PULSE', durationMs: 260, blocksInput: false, haptic: 'NONE', audioCue: 'NONE' }),
  HINT_REVEAL: spec({ tone: 'NEUTRAL', characterState: null, motion: 'POP', durationMs: 280, blocksInput: false, haptic: 'NONE', audioCue: 'REVEAL', announcement: 'یک سرنخ کوچک آماده است.' }),
  BADGE_REVEAL: spec({ tone: 'POSITIVE', characterState: null, motion: 'POP', durationMs: 300, blocksInput: false, haptic: 'SUCCESS', audioCue: 'REVEAL', message: 'نشان تازه!' }),
  UNLOCK_REVEAL: spec({ tone: 'POSITIVE', characterState: null, motion: 'POP', durationMs: 300, blocksInput: false, haptic: 'SUCCESS', audioCue: 'REVEAL', message: 'یک بخش تازه باز شد!' }),
  REWARD_REVEAL: spec({ tone: 'CELEBRATE', characterState: null, motion: 'CELEBRATE', durationMs: 300, blocksInput: false, haptic: 'CELEBRATE', audioCue: 'REVEAL', message: 'جایزه‌ات آماده است!' }),
};

export function feedbackForSemanticEvent(event: AnimationSemanticEvent): FeedbackSpec {
  return FEEDBACK_BY_SEMANTIC_EVENT[event];
}

export function feedbackForInteraction(event: InteractionFeedbackEvent): FeedbackSpec {
  return FEEDBACK_BY_INTERACTION_EVENT[event];
}

/** User/OS feedback channels. All three default to "on"; any can be off without losing information. */
export interface FeedbackChannels {
  reducedMotion: boolean;
  sound: boolean;
  haptics: boolean;
}

export interface FeedbackPresentation {
  tone: FeedbackTone;
  motion: FeedbackMotion;
  /** Visible window (unchanged by reduced motion so static text is still readable). */
  visibleMs: number;
  haptic: FeedbackHaptic;
  audioCue: FeedbackAudioCue;
  message: string | null;
  announcement: string | null;
  blocksInput: boolean;
}

/**
 * Resolve a spec into what a renderer should actually do for this child's settings.
 * - reduced motion: no animation, but the same message/visibility window;
 * - silent (sound off): no audio cue, but visual + announcement remain;
 * - haptics off: no vibration.
 */
export function resolveFeedbackPresentation(s: FeedbackSpec, channels: FeedbackChannels): FeedbackPresentation {
  return {
    tone: s.tone,
    motion: channels.reducedMotion ? 'NONE' : s.motion,
    visibleMs: s.durationMs,
    haptic: channels.haptics ? s.haptic : 'NONE',
    audioCue: channels.sound ? s.audioCue : 'NONE',
    message: s.message ?? null,
    announcement: s.announcement ?? s.message ?? null,
    blocksInput: s.blocksInput,
  };
}

/**
 * Map an authoritative submit outcome to its semantic event. Partial credit (score > 0)
 * is a near miss, never a failure theatric. Used identically by Android and Web.
 */
export function semanticEventForOutcome(outcome: { correct: boolean; score?: number | null }): Extract<AnimationSemanticEvent, 'ANSWER_CORRECT' | 'NEAR_MISS' | 'ANSWER_WRONG'> {
  if (outcome.correct) return 'ANSWER_CORRECT';
  return (outcome.score ?? 0) > 0 ? 'NEAR_MISS' : 'ANSWER_WRONG';
}
