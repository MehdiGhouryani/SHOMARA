import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../ui/AppText';
import { EdgeBox } from '../ui/v1/EdgeBox';
import { Icon } from '../ui/v1/Icon';
import type { IconName } from '../ui/v1/icons';
import { C, UI, typeStyle } from '../ui/v1/tokens';
import type { ChapterTheme } from './chapterTheme';
import { GoBubble } from './GoBubble';
import { NodeFace } from './NodeFace';
import type { NodeState } from './layout';

const N = UI.path.node;
const RING = UI.path.ring;
const CIRCUMFERENCE = 2 * Math.PI * RING.radius;

type Look = { hi?: string | undefined; base: string; edge: string; highlight: string; icon: IconName; iconColor: string };

function lookOf(state: NodeState, theme: ChapterTheme): Look {
  switch (state) {
    case 'cur':
      return { hi: UI.path.currentGradient[0], base: UI.path.currentGradient[1] ?? C.amber, edge: C.amberEdge, highlight: UI.path.currentHighlight, icon: 'book', iconColor: C.onAmber };
    case 'lock':
      return { base: theme.lk, edge: theme.lke, highlight: UI.path.lockedHighlight, icon: 'lock', iconColor: theme.lki };
    case 'chest':
      return { hi: UI.path.chest.gradient[0], base: UI.path.chest.gradient[1] ?? C.neutralC, edge: UI.path.chest.edge, highlight: UI.path.lockedHighlight, icon: 'chest', iconColor: UI.path.chest.icon };
    case 'done':
      return { hi: theme.hi, base: theme.p, edge: theme.pe, highlight: UI.path.nodeHighlight, icon: 'check', iconColor: C.white };
    case 'download':
      return { hi: theme.hi, base: theme.p, edge: theme.pe, highlight: UI.path.nodeHighlight, icon: 'download', iconColor: C.white };
    default:
      return { hi: theme.hi, base: theme.p, edge: theme.pe, highlight: UI.path.nodeHighlight, icon: 'book', iconColor: C.white };
  }
}

type Props = {
  state: NodeState;
  theme: ChapterTheme;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
  onPress?: (() => void) | undefined;
  /** Title under the current node. */
  label?: string | undefined;
  /** Text of the floating bubble above the current node. */
  goText?: string | undefined;
  /** Share of the ring that is filled (the page draws 92 of 276). */
  ringFraction?: number | undefined;
  /** Short notice bubble (tap on a locked node). */
  notice?: string | null | undefined;
};

/** One node of the path: 76px 3D circle with its extras (ring, bubble, label) for the current one. */
export function PathNode({ state, theme, accessibilityLabel, accessibilityHint, onPress, label, goText, ringFraction = RING.dash / CIRCUMFERENCE, notice }: Props) {
  const look = lookOf(state, theme);
  const inert = state === 'lock' || state === 'chest';
  return (
    <View style={styles.wrap}>
      {state === 'cur' ? (
        <Svg width={RING.box} height={RING.box} viewBox={`0 0 ${RING.box} ${RING.box}`} style={styles.ring} pointerEvents="none">
          <Circle cx={RING.box / 2} cy={RING.box / 2} r={RING.radius} fill="none" stroke={theme.pm} strokeWidth={RING.stroke} />
          <Circle
            cx={RING.box / 2}
            cy={RING.box / 2}
            r={RING.radius}
            fill="none"
            stroke={C.amber}
            strokeWidth={RING.stroke}
            strokeLinecap="round"
            strokeDasharray={`${ringFraction * CIRCUMFERENCE} ${RING.gap}`}
            transform={`rotate(-90 ${RING.box / 2} ${RING.box / 2})`}
          />
        </Svg>
      ) : null}
      {state === 'cur' && goText ? <GoBubble text={goText} color={theme.p} /> : null}
      {notice ? <GoBubble text={notice} color={theme.p} floating={false} wide /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inert }}
        disabled={state === 'chest'}
        onPress={onPress}
        style={styles.hit}
      >
        {({ pressed }) => (
          <EdgeBox
            edge={N.edge}
            edgeColor={look.edge}
            radius={N.size / 2}
            lift={pressed && !inert ? N.press : 0}
            faceStyle={{ width: N.size, height: N.size, alignItems: 'center', justifyContent: 'center' }}
          >
            <NodeFace size={N.size} hi={look.hi} base={look.base} highlight={look.highlight} thickness={N.highlight} />
            {/* A View (positioned) keeps the icon above the absolute face on the web, where a bare <svg> is static. */}
            <View pointerEvents="none">
              <Icon name={look.icon} size={N.icon} color={look.iconColor} strokeWidth={N.iconStroke} />
            </View>
          </EdgeBox>
        )}
      </Pressable>
      {state === 'cur' && label ? (
        <View style={styles.label}>
          <Text numberOfLines={1} style={[typeStyle('label'), { color: C.ink, textAlign: 'center' }]}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: N.size, height: N.size },
  hit: { width: UI.path.node.size, height: UI.path.node.size },
  ring: { position: 'absolute', top: -RING.offset, start: -RING.offset },
  // 76px node + 24px gap below it; 120px wide, centered under the node.
  label: { position: 'absolute', top: N.size + UI.path.label.top, start: -(UI.path.label.width - N.size) / 2, end: -(UI.path.label.width - N.size) / 2 },
});
