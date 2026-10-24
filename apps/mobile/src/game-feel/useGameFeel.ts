import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnimationEventPayload, CharacterVisualState } from '@math/contracts';
import { GameFeelController } from './GameFeelController';
import { useFeedbackEffects } from './feedbackEffects';

export function useGameFeel() {
  const controller = useMemo(() => new GameFeelController(), []);
  const [snapshot, setSnapshot] = useState(controller.getSnapshot());
  const { play, channels } = useFeedbackEffects();
  // Keep `dispatch` referentially stable (consumers dispatch from effects) while
  // still using the latest motion/sound/haptic preferences.
  const playRef = useRef(play);
  playRef.current = play;

  const dispatch = useCallback((event: AnimationEventPayload) => {
    const previous = controller.getSnapshot();
    const next = controller.dispatch(event);
    setSnapshot(next);
    // Play haptic/announcement only when a *new* visible reaction starts, so a
    // preserved reaction (silent transition) is not replayed.
    if (next.feedback && (next.feedback !== previous.feedback || next.feedbackUntil !== previous.feedbackUntil)) playRef.current(next.feedback);
  }, [controller]);

  const clearFeedback = useCallback(() => {
    setSnapshot(controller.clearFeedback());
  }, [controller]);

  useEffect(() => {
    if (!snapshot.feedback || snapshot.feedbackUntil <= Date.now()) return;
    const delay = Math.max(0, snapshot.feedbackUntil - Date.now());
    const timer = setTimeout(() => clearFeedback(), delay);
    return () => clearTimeout(timer);
  }, [snapshot.feedback, snapshot.feedbackUntil, clearFeedback]);

  return {
    characterState: snapshot.characterState as CharacterVisualState,
    lastEvent: snapshot.lastEvent,
    feedback: snapshot.feedback,
    reducedMotion: channels.reducedMotion,
    inputBlocked: Boolean(snapshot.feedback?.blocksInput && snapshot.feedbackUntil > Date.now()),
    dispatch,
    clearFeedback,
  };
}
