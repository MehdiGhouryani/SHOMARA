import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../AppText';
import { C2, CL2, K2, S2, type2 } from './tokens';

export type PathNodeState = 'done' | 'current' | 'available' | 'locked';

type Glyph = 'checkmark' | 'lock-closed' | 'book' | 'play' | 'gift';

type Props = {
  state: PathNodeState;
  ordinal?: number | undefined;
  /** Caption line 1 (the station title); omitted for compact trail nodes that caption elsewhere. */
  title?: string | undefined;
  /** Caption line 2 («ایستگاه n · m دقیقه»); omitted for chests and label-free decorations. */
  minutes?: number | undefined;
  /** Glyph override (e.g. the decorative treasure chest renders `gift` with the locked look). */
  glyph?: Glyph | undefined;
  onPress: (() => void) | undefined;
  a11yLabel: string;
  a11yHint?: string | undefined;
};

const ORDINALS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n: number) => String(n).split('').map((d) => ORDINALS[Number(d)] ?? d).join('');

const DEFAULT_GLYPH: Record<PathNodeState, Glyph> = { done: 'checkmark', locked: 'lock-closed', current: 'book', available: 'play' };

/** Clay recipe per state (DESIGN pages/PATH_STATION.md): featured only on the one current node. */
function look(state: PathNodeState, glyph: Glyph) {
  if (state === 'done') return { bg: C2.primary, ring: C2.primaryDark, ink: C2.white, featured: false };
  if (state === 'current') return { bg: C2.amberSoft, ring: C2.amber, ink: C2.amberInk, featured: true };
  if (state === 'available') return { bg: C2.amberSoft, ring: C2.amber, ink: C2.amberInk, featured: false };
  return { bg: C2.surfaceAlt, ring: C2.line2, ink: glyph === 'gift' ? C2.amberInk : C2.muted, featured: false };
}

/** V2 path node: friendly circle with a solid toy edge; states read through fill + glyph, never color alone. */
export function PathNode({ state, ordinal, title, minutes, glyph, onPress, a11yLabel, a11yHint }: Props) {
  const current = state === 'current';
  const size = current ? K2.nodeCurrent : K2.nodeSize;
  const g = glyph ?? DEFAULT_GLYPH[state];
  const l = look(state, g);
  const clay = l.featured ? CL2.featured : CL2.soft;
  const flat = state === 'locked'; // hint level 1: pastel tint, no lift

  const body = (
    <View style={styles.nodeWrap}>
      <View
        style={[
          styles.node,
          {
            width: size,
            height: size,
            backgroundColor: l.bg,
            borderColor: l.ring,
            borderRadius: size / 2,
            shadowOpacity: flat ? 0 : clay.shadowOpacity,
            shadowRadius: clay.shadowRadius,
            shadowOffset: { width: 0, height: clay.shadowOffsetY },
            elevation: flat ? 0 : clay.elevation,
          },
          current ? styles.nodeCurrentEdge : null,
        ]}
      >
        <Ionicons name={g} size={size * 0.38} color={l.ink} />
      </View>
      {title ? <Text style={[type2('caption'), { color: C2.ink, textAlign: 'center', marginTop: S2.xs }]}>{title}</Text> : null}
      {ordinal !== undefined && minutes !== undefined ? (
        <Text style={[type2('caption'), { color: C2.muted, textAlign: 'center' }]}>ایستگاه {toFa(ordinal)} · {toFa(minutes)} دقیقه</Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    // Decorative nodes (the treasure chest) stay in the tree as disabled buttons so screen
    // readers announce them, exactly like the page the trail replaces.
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityState={{ disabled: true }}
        disabled
        style={styles.nodePress}
      >
        {body}
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={a11yHint}
      accessibilityState={{ selected: current }}
      onPress={onPress}
      style={({ pressed }) => [styles.nodePress, pressed && styles.nodePressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nodePress: { minHeight: K2.nodeSize, justifyContent: 'center' },
  nodePressed: { opacity: 0.9 },
  nodeWrap: { alignItems: 'center', gap: 2 },
  node: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, shadowColor: C2.ink },
  nodeCurrentEdge: { borderWidth: 4 },
  spot: { alignItems: 'center', justifyContent: 'center' },
});
