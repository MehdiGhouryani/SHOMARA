import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text } from '../AppText';
import { useReduceMotion } from './useReduceMotionV2';
import { C2, K2, M2, R2, S2, type2 } from './tokens';

export type PathNodeState = 'done' | 'current' | 'available' | 'locked';

type Props = {
  state: PathNodeState;
  ordinal: number;
  title: string;
  minutes: number;
  onPress: (() => void) | undefined;
  a11yLabel: string;
};

const ORDINALS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n: number) => String(n).split('').map((d) => ORDINALS[Number(d)] ?? d).join('');

/** V2 path node: friendly circle with a solid toy edge; states read through fill + glyph, never color alone. */
export function PathNode({ state, ordinal, title, minutes, onPress, a11yLabel }: Props) {
  const current = state === 'current';
  const size = current ? K2.nodeCurrent : K2.nodeSize;
  const bg = state === 'done' ? C2.primary : state === 'locked' ? C2.surfaceAlt : C2.amberSoft;
  const ring = state === 'done' ? C2.primaryDark : state === 'locked' ? C2.line2 : C2.amber;
  const glyph: Record<PathNodeState, 'checkmark' | 'lock-closed' | 'book' | 'play'> = { done: 'checkmark', locked: 'lock-closed', current: 'book', available: 'play' };
  const ink = state === 'locked' ? C2.muted : state === 'done' ? C2.white : C2.amberInk;

  const body = (
    <View style={[styles.nodeWrap, { width: size + 8 }]}>
      <View style={[styles.node, { width: size, height: size, backgroundColor: bg, borderColor: ring, borderRadius: size / 2 }, current ? styles.nodeCurrentRing : null]}>
        <Ionicons name={glyph[state]} size={size * 0.38} color={ink} />
      </View>
      <Text style={[type2('caption'), { color: C2.ink, textAlign: 'center', marginTop: S2.xs }]}>{title}</Text>
      <Text style={[type2('caption'), { color: C2.muted, textAlign: 'center' }]}>ایستگاه {toFa(ordinal)} · {toFa(minutes)} دقیقه</Text>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11yLabel} accessibilityState={{ disabled: state === 'locked', selected: current }} onPress={onPress} style={styles.nodePress}>
      {body}
    </Pressable>
  );
}

type SpotProps = {
  source: number;
  size?: number | undefined;
  label: string;
  /** Gentle idle bob; never runs under reduce-motion, never during tests' static renders. */
  idleBob?: boolean | undefined;
};

/** V2 character spot: existing approved artwork in a rounded V2 container with an optional idle bob. */
export function CharacterSpot({ source, size = 120, label, idleBob = false }: SpotProps) {
  const reduced = useReduceMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (idleBob && !reduced) y.value = withRepeat(withTiming(-6, { duration: M2.slow }), -1, true);
    else y.value = 0;
    return undefined;
  }, [idleBob, reduced, y]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.spot, { width: size, height: size }, animated]} accessibilityLabel={label} accessibilityRole="image">
      <Image source={source} style={{ width: size, height: size, resizeMode: 'contain' }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  nodePress: { minHeight: K2.nodeSize },
  nodeWrap: { alignItems: 'center', gap: 2 },
  node: { alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  nodeCurrentRing: { borderWidth: 4, borderColor: C2.primary, shadowColor: C2.ink, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  spot: { alignItems: 'center', justifyContent: 'center' },
});
