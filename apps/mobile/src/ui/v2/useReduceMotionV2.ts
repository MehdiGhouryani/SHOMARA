import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** V2 reduce-motion: true when the OS asked for less motion; decorative loops must then stand still. */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => { if (alive) setReduced(value); })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
