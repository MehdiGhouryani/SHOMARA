import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { FeedbackChannels } from '@math/contracts';
import { useAppState } from '../state/AppStateContext';

/** Shared P03 motion gate: OS setting OR in-app preference disables decorative motion. */
export function useReducedMotionPreference(): boolean {
  const { preferences } = useAppState();
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled: boolean) => mounted && setSystemReducedMotion(enabled));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => setSystemReducedMotion(enabled));
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return systemReducedMotion || !preferences.motion;
}

/** All child feedback channels in one place (motion, sound, haptics). */
export function useFeedbackChannels(): FeedbackChannels {
  const { preferences } = useAppState();
  const reducedMotion = useReducedMotionPreference();
  return useMemo(() => ({ reducedMotion, sound: preferences.sound, haptics: preferences.haptics }), [reducedMotion, preferences.sound, preferences.haptics]);
}
