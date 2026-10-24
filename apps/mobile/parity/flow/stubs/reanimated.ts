import { Image, ScrollView, Text, View } from 'react-native';

/**
 * The legacy game-feel widgets animate with Reanimated worklets (native). The harness only drives the new
 * lesson pages, so animations resolve to their end value and `Animated.*` are the plain react-native views.
 */
const Animated = { View, Text, Image, ScrollView, createAnimatedComponent: <T,>(component: T) => component };
export default Animated;

const ease = () => 0;
export const Easing = { out: ease, in: ease, inOut: ease, quad: 0, cubic: 0, ease: 0, linear: 0, bezier: ease };
export const useSharedValue = <T,>(value: T) => ({ value });
export const useAnimatedStyle = () => ({});
export const cancelAnimation = () => undefined;
export const withTiming = <T,>(value: T) => value;
export const withSpring = <T,>(value: T) => value;
export const withRepeat = <T,>(value: T) => value;
export const withSequence = <T,>(...values: T[]) => values[values.length - 1];
