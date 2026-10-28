import type { AnimationEventPayload, AnimationSemanticEvent } from '@math/contracts';

export function makeAnimationEvent(
  type: AnimationSemanticEvent,
  context: Partial<Pick<AnimationEventPayload, 'sessionId' | 'stationId'>> = {},
): AnimationEventPayload {
  return {
    type,
    timestamp: new Date().toISOString(),
    ...context,
  };
}
