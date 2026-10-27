import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '../AppText';
import { Button } from './core';
import { useReduceMotion } from './useReduceMotionV2';
import { CL2, C2, K2, R2, S2, type2 } from './tokens';
import { toFa } from '../digits';

/**
 * V2 interactive counting tray: the child taps beads one by one to count them — each tap pops
 * the bead and speaks the running count through accessibility. Pure presentation: the tray only
 * reports the final selected count; correctness stays server-side. Reduce-motion: taps apply
 * instantly without the spring pop.
 */
export function CountTray({ beads, onCountChange }: { beads: number; onCountChange?: ((count: number) => void) | undefined }) {
  const [counted, setCounted] = useState<number[]>([]);
  const reduced = useReduceMotion();

  function toggle(index: number) {
    setCounted((current) => {
      const next = current.includes(index) ? current.filter((x) => x !== index) : [...current, index].sort((a, b) => a - b);
      onCountChange?.(next.length);
      return next;
    });
  }

  return (
    <View accessibilityRole="adjustable" accessibilityLabel="سینی شمارش مهره‌ها" style={styles.tray}>
      {Array.from({ length: beads }, (_, index) => (
        <Bead
          key={index}
          counted={counted.includes(index)}
          reduced={reduced}
          onPress={() => toggle(index)}
          a11yLabel={`مهره ${toFa(index + 1)}${counted.includes(index) ? '، شمرده شد' : ''}`}
        />
      ))}
    </View>
  );
}

function Bead({ counted, reduced, onPress, a11yLabel }: { counted: boolean; reduced: boolean; onPress: () => void; a11yLabel: string }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected: counted }}
      onPress={() => {
        if (!reduced) scale.value = withSpring(1, { damping: 10, stiffness: 260 });
        onPress();
      }}
      onPressIn={() => { if (!reduced) scale.value = withSpring(0.82, { damping: 12, stiffness: 300 }); }}
      style={styles.beadHit}
    >
      <Animated.View style={[styles.bead, counted ? styles.beadCounted : styles.beadIdle, animated]}>
        {counted ? <View style={styles.beadShine} /> : null}
      </Animated.View>
    </Pressable>
  );
}

/** V2 answer tile: big rounded choice (64dp), selected = strong stroke + check glyph, never color alone. */
export function OptionTile({ label, selected, disabled = false, onPress }: { label: string; selected: boolean; disabled?: boolean | undefined; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected ? styles.optionSelected : null, pressed && !disabled ? styles.optionPressed : null]}
    >
      <Text style={[type2('body'), { color: C2.ink, fontWeight: '800' }]}>{label}</Text>
      {selected ? (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={18} color={C2.primaryDark} />
        </View>
      ) : null}
    </Pressable>
  );
}

/** V2 feedback sheet: warm correct (primary) / warm retry (amber); one clear next action with a real lip. */
export function FeedbackSheet({ tone, text, actionLabel, onAction }: { tone: 'correct' | 'retry'; text: string; actionLabel: string; onAction: () => void }) {
  const correct = tone === 'correct';
  return (
    <View style={[styles.sheet, { backgroundColor: correct ? C2.primarySoft : C2.amberSoft, borderColor: correct ? C2.primary : C2.amber }]}>
      <Text style={[type2('body'), { color: correct ? C2.primaryDark : C2.amberInk, fontWeight: '800' }]}>{text}</Text>
      <Button label={actionLabel} onPress={onAction} variant={correct ? 'primary' : 'amber'} accessibilityLabel={actionLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S2.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C2.surfaceAlt,
    borderRadius: R2.lg,
    borderWidth: 1.5,
    borderColor: C2.line,
    padding: S2.lg,
    minHeight: K2.trayBead * 2 + S2.lg * 2,
  },
  beadHit: { width: K2.trayBead + S2.sm, height: K2.trayBead + S2.sm, alignItems: 'center', justifyContent: 'center' },
  bead: {
    width: K2.trayBead,
    height: K2.trayBead,
    borderRadius: K2.trayBead / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadIdle: { backgroundColor: C2.amberSoft, borderWidth: 2, borderColor: C2.amber },
  beadCounted: { backgroundColor: C2.primary, borderWidth: 2, borderColor: C2.primaryDark },
  beadShine: { width: K2.trayBead / 3, height: K2.trayBead / 3, borderRadius: R2.pill, backgroundColor: 'rgba(255,255,255,0.45)', marginTop: -K2.trayBead / 4 },
  option: {
    minHeight: CL2.answerTile.minHeight,
    borderRadius: R2.md,
    borderWidth: CL2.answerTile.borderWidth,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S2.lg,
    gap: S2.sm,
    flexDirection: 'row',
  },
  optionSelected: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  optionPressed: { backgroundColor: C2.surfaceAlt },
  check: { width: K2.touchMin - 12, height: K2.touchMin - 12, borderRadius: R2.pill, backgroundColor: C2.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C2.primary },
  sheet: {
    borderRadius: R2.lg,
    borderWidth: 2,
    padding: S2.lg,
    gap: S2.md,
  },
});
