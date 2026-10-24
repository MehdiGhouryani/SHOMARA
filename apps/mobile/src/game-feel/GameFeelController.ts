import {
  CHARACTER_STATE_BY_EVENT,
  type AnimationEventPayload,
  type CharacterVisualState,
} from '@math/contracts';
import { AnimationController } from '../animation/AnimationController';
import { feedbackForEvent, type FeedbackSpec } from './feedback';

export interface GameFeelSnapshot {
  characterState: CharacterVisualState;
  lastEvent: AnimationEventPayload | null;
  feedback: FeedbackSpec | null;
  feedbackUntil: number;
}

export class GameFeelController {
  private readonly animation = new AnimationController();
  private snapshot: GameFeelSnapshot = {
    characterState: this.animation.getSnapshot().state,
    lastEvent: null,
    feedback: null,
    feedbackUntil: 0,
  };

  dispatch(event: AnimationEventPayload, now = Date.now()): GameFeelSnapshot {
    const animation = this.animation.dispatch(event);
    const nextSpec = feedbackForEvent(event.type);
    const activeFeedback = this.snapshot.feedback && this.snapshot.feedbackUntil > now ? this.snapshot.feedback : null;
    const activeFeedbackUntil = activeFeedback ? this.snapshot.feedbackUntil : 0;

    // A silent transition such as EXPLAIN/HINT_OPENED may happen immediately after
    // a meaningful answer event. Do not erase a visible reaction before its short
    // feedback window ends; the semantic event still updates `lastEvent`.
    const shouldPreserveVisibleReaction = Boolean(activeFeedback && !nextSpec.message);
    const feedback = shouldPreserveVisibleReaction
      ? activeFeedback
      : nextSpec.durationMs > 0
        ? nextSpec
        : null;
    const feedbackUntil = shouldPreserveVisibleReaction
      ? activeFeedbackUntil
      : feedback
        ? now + nextSpec.durationMs
        : 0;
    const characterState = shouldPreserveVisibleReaction && activeFeedback?.characterState
      ? activeFeedback.characterState
      : animation.state;

    this.snapshot = {
      characterState,
      lastEvent: event,
      feedback,
      feedbackUntil,
    };
    return this.snapshot;
  }

  clearFeedback(): GameFeelSnapshot {
    const latestEventState = this.snapshot.lastEvent
      ? CHARACTER_STATE_BY_EVENT[this.snapshot.lastEvent.type]
      : this.animation.getSnapshot().state;
    this.snapshot = {
      ...this.snapshot,
      characterState: latestEventState,
      feedback: null,
      feedbackUntil: 0,
    };
    return this.snapshot;
  }

  getSnapshot(): GameFeelSnapshot {
    return this.snapshot;
  }
}
