import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { EdgeBox } from '../ui/v1/EdgeBox';
import { C, UI, typeStyle } from '../ui/v1/tokens';
import { useReduceMotion } from '../ui/v1/useReduceMotion';

type Props = {
  text: string;
  /** Text colour (the chapter's primary). */
  color: string;
  /** The "continue" bubble floats; the locked-station notice does not. */
  floating?: boolean;
  /** Wider bubble for a full sentence (the locked-station notice). The "continue" bubble keeps the page's 96px. */
  wide?: boolean;
};

const G = UI.path.go;

/** `.go`: speech bubble above a node with a tail pointing at it; floats unless motion is reduced. */
export function GoBubble({ text, color, floating = true, wide = false }: Props) {
  const width = wide ? G.noticeWidth : G.width;
  const inset = -(width - UI.path.node.size) / 2;
  const reduced = useReduceMotion();
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!floating || reduced) {
      y.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -G.bob, duration: G.bobMs / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: G.bobMs / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floating, reduced, y]);

  return (
    <Animated.View pointerEvents="none" style={[styles.box, { start: inset, end: inset, transform: [{ translateY: y }] }]}>
      <EdgeBox
        edge={3}
        edgeColor={C.line2}
        radius={G.radius}
        faceStyle={{ backgroundColor: C.surface, borderWidth: 2, borderColor: C.line2, paddingVertical: 4, alignItems: 'center' }}
      >
        <Text numberOfLines={wide ? 2 : 1} style={[typeStyle('label'), { color, textAlign: 'center' }]}>
          {text}
        </Text>
      </EdgeBox>
      <View style={[styles.tail, { start: (width - G.tail) / 2 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 76px node wrapper: the insets (set per render) widen it equally on both sides, so the bubble stays centered.
  box: { position: 'absolute', top: G.top },
  tail: {
    position: 'absolute',
    bottom: -8,
    width: G.tail,
    height: G.tail,
    backgroundColor: C.surface,
    borderBottomWidth: 2,
    borderStartWidth: 2,
    borderColor: C.line2,
    transform: [{ rotate: '45deg' }],
  },
});
