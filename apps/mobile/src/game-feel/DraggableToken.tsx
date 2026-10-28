import { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { DS } from '../ui/design-system/theme';
import { Text } from '../ui/AppText';
import { useFeedbackEffects } from './feedbackEffects';
import { defaultDropOptions, evaluateDropWith, feedbackEventForDrop, type DropResult, type Point, type Rect } from './DragDropController';

interface GestureDelta { dx: number; dy: number }

export function DraggableToken({
  label,
  target,
  onDrop,
  disabled = false,
  canAccept = true,
  style,
}: {
  label: string;
  target: Rect;
  onDrop: (result: DropResult) => void;
  disabled?: boolean;
  /** Placement capacity only (e.g. slot already full) — not answer correctness. */
  canAccept?: boolean;
  style?: ViewStyle;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const origin = useRef<Point>({ x: 0, y: 0 });
  const { channels, playInteraction } = useFeedbackEffects();
  const reducedMotion = channels.reducedMotion;

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      origin.current = { x: x.value, y: y.value };
      scale.value = reducedMotion ? 1 : withSpring(1.04, { damping: 12, stiffness: 220 });
      playInteraction('DRAG_START', { announce: false });
    },
    onPanResponderMove: (_event: unknown, gesture: GestureDelta) => {
      x.value = origin.current.x + gesture.dx;
      y.value = origin.current.y + gesture.dy;
    },
    onPanResponderRelease: (_event: unknown, gesture: GestureDelta) => {
      const dropPoint = { x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy };
      const result = evaluateDropWith(dropPoint, target, { ...defaultDropOptions(target), canAccept });
      playInteraction(feedbackEventForDrop(result));
      onDrop(result);
      if (result === 'NEAR_MISS' && !reducedMotion) {
        // Gentle "almost" pulse before returning home; no shake, no red flash.
        scale.value = withSequence(withTiming(1.06, { duration: 90 }), withSpring(1, { damping: 12, stiffness: 220 }));
      } else {
        scale.value = reducedMotion ? 1 : withSpring(1, { damping: 12, stiffness: 220 });
      }
      x.value = reducedMotion ? 0 : withSpring(0, { damping: 14, stiffness: 240 });
      y.value = reducedMotion ? 0 : withSpring(0, { damping: 14, stiffness: 240 });
    },
    onPanResponderTerminate: () => {
      x.value = reducedMotion ? 0 : withSpring(0);
      y.value = reducedMotion ? 0 : withSpring(0);
      scale.value = reducedMotion ? 1 : withSpring(1);
    },
  }), [canAccept, disabled, onDrop, playInteraction, reducedMotion, scale, x, y, target]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }] }));

  return (
    <Animated.View {...responder.panHandlers} accessible accessibilityRole="button" accessibilityLabel={`جابجایی ${label}`} accessibilityState={{ disabled }} style={[styles.token, animatedStyle, disabled ? styles.disabled : null, style]}>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

export function DropTarget({ label, active = false, accepted = false, nearMiss = false, style }: { label: string; active?: boolean; accepted?: boolean; nearMiss?: boolean; style?: ViewStyle }) {
  const a11y = accepted ? `${label}، درست قرار گرفت` : nearMiss ? `${label}، خیلی نزدیک بود` : label;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={a11y} style={[styles.target, active ? styles.active : null, nearMiss ? styles.nearMiss : null, accepted ? styles.accepted : null, style]}>
      <Text style={styles.targetText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  token: { minWidth: 72, minHeight: 56, paddingHorizontal: 18, borderRadius: 18, backgroundColor: DS.color.brand.primarySoft, borderWidth: 1, borderColor: DS.color.brand.primary, alignItems: 'center', justifyContent: 'center', shadowColor: DS.color.brand.primaryDark, shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  label: { fontSize: 18, fontWeight: '900', color: DS.color.brand.primaryDark },
  disabled: { opacity: 0.5 },
  target: { minWidth: 120, minHeight: 80, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: DS.color.border.default, backgroundColor: DS.color.bg.subtle, alignItems: 'center', justifyContent: 'center' },
  active: { borderColor: DS.color.brand.teal, backgroundColor: DS.color.brand.tealSoft },
  nearMiss: { borderColor: DS.color.brand.secondary, backgroundColor: DS.color.brand.secondarySoft },
  accepted: { borderStyle: 'solid', borderColor: DS.color.brand.emerald, backgroundColor: DS.color.brand.emeraldSoft },
  targetText: { fontSize: 15, fontWeight: '800', color: DS.color.text.secondary },
});
