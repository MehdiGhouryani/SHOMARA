import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { toFa } from '../ui/digits';
import { Icon } from '../ui/v1/Icon';
import { C, UI } from '../ui/v1/tokens';
import { useReduceMotion } from '../ui/v1/useReduceMotion';
import { chapterTheme } from './chapterTheme';

type Props = {
  /** Index of the chapter whose theme the band shows. */
  chapter: number;
  kicker: string;
  title: string;
  done: number;
  total?: number;
  onGuidePress?: (() => void) | undefined;
};

const B = UI.path.band;

/** `.band`: chapter header with kicker, title, five progress pips and the guide button; recolours with the chapter. */
export function ChapterBand({ chapter, kicker, title, done, total = 5, onGuidePress }: Props) {
  const reduced = useReduceMotion();
  const t = useRef(new Animated.Value(1)).current;
  const colors = useRef({ from: chapter, to: chapter });
  if (colors.current.to !== chapter) colors.current = { from: colors.current.to, to: chapter };
  const { from, to } = colors.current;

  useEffect(() => {
    if (from === to) return;
    if (reduced) {
      t.setValue(1);
      return;
    }
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [from, to, reduced, t]);

  const range = { inputRange: [0, 1] };
  const bg = t.interpolate({ ...range, outputRange: [chapterTheme(from).p, chapterTheme(to).p] });
  const edge = t.interpolate({ ...range, outputRange: [chapterTheme(from).pe, chapterTheme(to).pe] });

  return (
    <Animated.View style={[styles.band, { backgroundColor: bg }]}>
      <Animated.View pointerEvents="none" style={[styles.bandEdge, { backgroundColor: edge }]} />
      <View style={styles.text}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pips}>
          <Text style={styles.count}>{`${toFa(done)} از ${toFa(total)} مرحله`}</Text>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.pip, { opacity: i < done ? 1 : 0.35 }]} />
          ))}
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="راهنمای فصل" onPress={onGuidePress} style={styles.guideHit}>
        {({ pressed }) => (
          <View>
            {/* The CSS shadow is never drawn under the translucent face, so an opaque layer of the band colour hides the edge there. */}
            <View pointerEvents="none" style={[styles.guideEdge]} />
            <Animated.View
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, borderRadius: B.guideRadius, backgroundColor: bg, transform: [{ translateY: pressed ? 3 : 0 }] }}
            />
            <View style={[styles.guideFace, pressed ? { transform: [{ translateY: 3 }] } : null]}>
              <Icon name="guide" size={B.guideIcon} color={C.white} />
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: B.paddingTop,
    paddingBottom: B.paddingBottom,
    paddingHorizontal: UI.screen.margin,
    zIndex: 3,
  },
  bandEdge: { position: 'absolute', start: 0, end: 0, bottom: -B.edge, height: B.edge },
  text: { flex: 1, gap: 2, minWidth: 0 },
  kicker: { fontSize: 14, lineHeight: 20, color: C.white, opacity: 0.92 },
  title: { fontSize: 22, lineHeight: 32, fontWeight: '600', color: C.white },
  pips: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  count: { fontSize: 14, lineHeight: 20, color: C.white, marginEnd: 6 },
  pip: { width: B.pipWidth, height: B.pipHeight, borderRadius: 99, backgroundColor: C.white },
  guideHit: { width: UI.path.band.guideSize, height: UI.path.band.guideSize, minHeight: UI.path.band.guideSize },
  guideEdge: { position: 'absolute', top: B.edge, start: 0, end: 0, bottom: -B.edge, borderRadius: B.guideRadius, backgroundColor: B.guideEdge },
  guideFace: {
    width: B.guideSize,
    height: B.guideSize,
    borderRadius: B.guideRadius,
    borderWidth: 2,
    borderColor: B.guideBorder,
    backgroundColor: B.guideFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
