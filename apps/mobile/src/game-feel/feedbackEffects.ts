import { useCallback } from 'react';
import { AccessibilityInfo, Vibration } from 'react-native';
import { feedbackForInteraction, resolveFeedbackPresentation, type FeedbackPresentation, type FeedbackSpec, type InteractionFeedbackEvent } from '@math/contracts';
import { hapticPatternFor } from './haptics';
import { useFeedbackChannels } from './motionPreferences';

/**
 * Side effects of a feedback spec: haptic + screen-reader announcement.
 * Audio cues are resolved (so P12 can plug in assets) but intentionally not played
 * here; every cue is optional and the visual/announcement path carries the meaning.
 */
export function useFeedbackEffects() {
  const channels = useFeedbackChannels();

  const play = useCallback((spec: FeedbackSpec, options: { announce?: boolean } = {}): FeedbackPresentation => {
    const presentation = resolveFeedbackPresentation(spec, channels);
    const pattern = hapticPatternFor(presentation.haptic);
    if (pattern !== null) Vibration.vibrate(pattern);
    if (options.announce !== false && presentation.announcement) AccessibilityInfo.announceForAccessibility(presentation.announcement);
    return presentation;
  }, [channels]);

  const playInteraction = useCallback((event: InteractionFeedbackEvent, options: { announce?: boolean } = {}) => play(feedbackForInteraction(event), options), [play]);

  /** Explicit screen-reader announcement (used when a primitive has richer copy than the shared spec). */
  const announce = useCallback((text: string) => {
    if (text) AccessibilityInfo.announceForAccessibility(text);
  }, []);

  return { channels, play, playInteraction, announce };
}
