import {
  CHARACTER_STATE_BY_EVENT,
  DEFAULT_CHARACTER_STATE,
  type AnimationEventPayload,
  type CharacterVisualState,
} from '@math/contracts';

export interface AnimationControllerSnapshot {
  state: CharacterVisualState;
  lastEvent: AnimationEventPayload | null;
}

export class AnimationController {
  private snapshot: AnimationControllerSnapshot = {
    state: DEFAULT_CHARACTER_STATE,
    lastEvent: null,
  };

  dispatch(event: AnimationEventPayload): AnimationControllerSnapshot {
    this.snapshot = {
      state: CHARACTER_STATE_BY_EVENT[event.type],
      lastEvent: event,
    };
    return this.snapshot;
  }

  reset(): AnimationControllerSnapshot {
    this.snapshot = { state: DEFAULT_CHARACTER_STATE, lastEvent: null };
    return this.snapshot;
  }

  getSnapshot(): AnimationControllerSnapshot {
    return this.snapshot;
  }
}
