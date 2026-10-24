import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Text } from '../AppText';
import { toFa } from '../digits';
import { EdgeBox } from './EdgeBox';
import { C, UI, typeStyle } from './tokens';

const G = UI.gradient.bead;

/**
 * `.bead`: 56px sphere. `radial-gradient(circle at 35% 28%, centre 0, edge 55%)`, a 5px solid bottom edge
 * (`box-shadow: 0 5px 0`) and the inset 2px top highlight drawn as a crescent (same method as the path nodes).
 */
export function Bead() {
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const size = UI.bead.size;
  const r = size / 2;
  const cx = size * G.cx;
  const cy = size * G.cy;
  // CSS "farthest-corner" radius from the gradient centre.
  const reach = Math.hypot(Math.max(cx, size - cx), Math.max(cy, size - cy));
  const t = UI.bead.highlightHeight;
  const dx = Math.sqrt(r * r - (t / 2) ** 2);
  const y = r + t / 2;
  const crescent = `M ${r - dx} ${y} A ${r} ${r} 0 1 1 ${r + dx} ${y} A ${r} ${r} 0 0 0 ${r - dx} ${y} Z`;
  return (
    <EdgeBox edge={UI.bead.edge} edgeColor={C.primaryEdge} radius={r} faceStyle={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={id} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} fx={cx} fy={cy} r={reach}>
            <Stop offset="0" stopColor={G.center} />
            <Stop offset={G.stop} stopColor={G.edge} />
            <Stop offset="1" stopColor={G.edge} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} stroke="none" />
        <Path d={crescent} fill={UI.bead.highlight} stroke="none" />
      </Svg>
    </EdgeBox>
  );
}

type TrayProps = { count: number; label: string; /** Page 07 numbers the beads; the question pages (08 to 10) show them bare. */ numbered?: boolean };

/** `.tray`: white card (24px radius, 2px line, 4px edge) holding `count` numbered beads, first bead at the reading start. */
export function BeadTray({ count, label, numbered = true }: TrayProps) {
  return (
    <EdgeBox
      edge={UI.surface.cardEdge}
      edgeColor={C.line}
      radius={UI.surface.trayRadius}
      style={styles.tray}
      faceStyle={numbered ? styles.trayFace : styles.trayFaceBare}
    >
      <View accessible accessibilityLabel={label} style={numbered ? styles.row : styles.rowBare}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} style={styles.bn}>
            <Bead />
            {numbered ? <Text style={[typeStyle('beadNumber'), { color: C.ink }]}>{toFa(i + 1)}</Text> : null}
          </View>
        ))}
      </View>
    </EdgeBox>
  );
}

const styles = StyleSheet.create({
  tray: { width: '100%' },
  trayFace: {
    backgroundColor: C.surface,
    borderWidth: UI.surface.cardBorder,
    borderColor: C.line,
    paddingTop: UI.lesson.trayPadTop,
    paddingBottom: UI.lesson.trayPadBottom,
    paddingHorizontal: UI.lesson.trayPadX,
  },
  trayFaceBare: { backgroundColor: C.surface, borderWidth: UI.surface.cardBorder, borderColor: C.line, padding: UI.question.trayPad },
  rowBare: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: UI.bead.gap },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: UI.lesson.trayGap },
  bn: { alignItems: 'center', gap: UI.bead.labelGap },
});
