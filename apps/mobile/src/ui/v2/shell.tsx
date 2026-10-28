import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../AppText';
import { Character, type CharacterEmotion, type ShomaraCharacterId } from './Character';
import { ProgressBar } from './core';
import { C2, K2, R2, S2, type2 } from './tokens';

/**
 * V2 screen shell (playbook pages 01/02/16/17): calm canvas, one scrollable body, one bottom
 * action area, a step bar that pairs the back action with the honest progress bar, and the
 * character speech bubble. Only tokens — no raw colors (verifier locks).
 */

/** Full-screen column on the V2 canvas. */
export function Screen2({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

type Body2Props = {
  children?: React.ReactNode;
  gap?: number;
  paddingTop?: number;
  paddingBottom?: number;
  justify?: ViewStyle['justifyContent'];
  align?: 'center' | 'stretch';
};

/** Scrollable body; scrolls only when content is taller than the screen (small phones, keyboard). */
export function Body2({ children, gap = S2.lg, paddingTop = S2.lg, paddingBottom = 0, justify, align = 'center' }: Body2Props) {
  return (
    <ScrollView
      style={styles.bodyScroll}
      contentContainerStyle={[styles.body, { gap, paddingTop, paddingBottom, alignItems: align }, justify ? { justifyContent: justify } : null]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** Bottom action area: the one primary decision belongs here. */
export function Foot2({ children }: { children?: React.ReactNode }) {
  return <View style={styles.foot}>{children}</View>;
}

type StepBar2Props = { percent: number; label: string; onBack: (() => void) | undefined };

/** Back chevron (48dp) beside the honest progress bar with its Persian step label. */
export function StepBar2({ percent, label, onBack }: StepBar2Props) {
  return (
    <View style={styles.stepBar}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="برگشت" onPress={onBack} style={styles.backHit}>
          <Ionicons name="chevron-back" size={24} color={C2.ink} />
        </Pressable>
      ) : null}
      <View style={styles.barSpace}>
        <ProgressBar ratio={percent / 100} accessibilityLabel={label} />
      </View>
    </View>
  );
}

type GuideBubble2Props = {
  characterId: ShomaraCharacterId;
  emotion?: CharacterEmotion;
  characterLabel: string;
  text: string;
  /** Portrait art (Dana/Fandogh) renders `cover` inside the circular frame; full-body art `contain`. */
  fit?: 'contain' | 'cover' | undefined;
};

/** Character at the reading start and a speech bubble whose tail points at it. */
export function GuideBubble2({ characterId, emotion = 'idle', characterLabel, text, fit = 'contain' }: GuideBubble2Props) {
  return (
    <View style={styles.bubbleRow}>
      <Character characterId={characterId} emotion={emotion} size={64} fit={fit} accessibilityLabel={characterLabel} />
      <View style={styles.bubble}>
        <View pointerEvents="none" style={styles.tail} />
        <Text style={[type2('body'), { color: C2.ink }]}>{text}</Text>
      </View>
    </View>
  );
}

type ListRow2Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  kicker?: string | undefined;
  /** Trailing element (chip, lock glyph); reserved from the title by the row gap. */
  trailing?: React.ReactNode | undefined;
  /** Unavailable row: flat muted surface, still readable (never alarming). */
  off?: boolean | undefined;
  onPress?: (() => void) | undefined;
};

/** V2 list row (playbook 12/14): 72dp+ measured row, optional press, trailing slot. */
export function ListRow2({ icon, title, kicker, trailing, off = false, onPress }: ListRow2Props) {
  const body = (
    <>
      <View style={[styles.rowIcon, off ? styles.rowIconOff : null]}>
        <Ionicons name={icon} size={22} color={off ? C2.muted : C2.primaryDark} />
      </View>
      <View style={styles.rowText}>
        <Text style={[type2('body'), { color: off ? C2.muted : C2.ink, fontWeight: '700' }]}>{title}</Text>
        {kicker ? <Text style={[type2('caption'), { color: C2.muted }]}>{kicker}</Text> : null}
      </View>
      {trailing}
    </>
  );
  if (!onPress) {
    return (
      <View style={[styles.row, off ? styles.rowOff : null]}>
        {body}
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.row, off ? styles.rowOff : null, pressed ? styles.rowPressed : null]}>
      {body}
    </Pressable>
  );
}

/** Inline information strip with an icon (e.g. the privacy note under the phone field). */
export function Note2({ icon, children }: { icon: React.ComponentProps<typeof Ionicons>['name']; children: string }) {
  return (
    <View style={styles.note}>
      <Ionicons name={icon} size={22} color={C2.primary} />
      <Text style={[type2('caption'), { color: C2.ink2, flex: 1, fontWeight: '600' }]}>{children}</Text>
    </View>
  );
}

/** Circle badge with a centered icon (the code page's message badge). */
export function IconBadge2({ icon }: { icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={26} color={C2.primaryDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C2.canvas },
  bodyScroll: { flex: 1, minHeight: 0 },
  body: { flexGrow: 1, paddingHorizontal: S2.xl },
  foot: { paddingTop: S2.lg, paddingBottom: S2.xxxl, paddingHorizontal: S2.xl, gap: S2.sm },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.sm,
    minHeight: K2.topBarH,
    paddingHorizontal: S2.lg,
    paddingTop: S2.sm,
  },
  backHit: { width: K2.touchMin, height: K2.touchMin, alignItems: 'center', justifyContent: 'center', borderRadius: R2.pill },
  barSpace: { flex: 1, justifyContent: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: S2.md, width: '100%' },
  bubble: {
    flex: 1,
    backgroundColor: C2.surface,
    borderWidth: 1.5,
    borderColor: C2.line,
    borderRadius: R2.lg,
    paddingHorizontal: S2.lg,
    paddingVertical: S2.md,
  },
  tail: {
    position: 'absolute',
    start: -8,
    top: '50%',
    width: 14,
    height: 14,
    marginTop: -7,
    backgroundColor: C2.surface,
    borderTopWidth: 1.5,
    borderStartWidth: 1.5,
    borderColor: C2.line,
    transform: [{ rotate: '45deg' }],
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.md,
    width: '100%',
    paddingHorizontal: S2.lg,
    paddingVertical: S2.md,
    borderRadius: R2.md,
    backgroundColor: C2.surfaceAlt,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: R2.pill,
    backgroundColor: C2.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.md,
    minHeight: K2.rowH,
    borderRadius: R2.md,
    borderWidth: 1.5,
    borderColor: C2.line,
    backgroundColor: C2.surface,
    paddingHorizontal: S2.lg,
    paddingVertical: S2.sm,
  },
  rowOff: { backgroundColor: C2.surfaceAlt, borderColor: C2.line },
  rowPressed: { backgroundColor: C2.surfaceAlt },
  rowIcon: { width: 44, height: 44, borderRadius: R2.pill, backgroundColor: C2.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowIconOff: { backgroundColor: C2.surface },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
});
