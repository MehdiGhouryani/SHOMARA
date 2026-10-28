import { useCallback, useMemo, useState } from 'react';
import {
  type AnimationEventPayload,
  type CharacterVisualState,
} from '@math/contracts';
import { AnimationController } from './AnimationController';

export function useAnimationController() {
  const controller = useMemo(() => new AnimationController(), []);
  const [state, setState] = useState<CharacterVisualState>(controller.getSnapshot().state);
  const [lastEvent, setLastEvent] = useState<AnimationEventPayload | null>(null);

  const dispatch = useCallback((event: AnimationEventPayload) => {
    const next = controller.dispatch(event);
    setState(next.state);
    setLastEvent(next.lastEvent);
  }, [controller]);

  return { state, lastEvent, dispatch };
}
