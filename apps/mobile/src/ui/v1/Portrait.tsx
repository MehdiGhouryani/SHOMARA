import { Image, StyleSheet, View } from 'react-native';
import { CHARACTER_ART, CHARACTER_SIZE, type CharacterPose } from './characters';
import { C, UI } from './tokens';

export type PortraitTone = 'neutral' | 'main' | 'number' | 'roka';

const TONE_BG: Record<PortraitTone, string> = {
  neutral: C.surfaceV,
  main: C.violetC,
  number: C.primaryC,
  roka: C.errorC,
};

type Props = {
  pose: CharacterPose;
  label: string;
  tone?: PortraitTone | undefined;
  size?: number | undefined;
  /** The white 3px border can be tinted (the phone page tints it with the character's violet). */
  borderColor?: string | undefined;
  /** Use `cover` for the pre-cropped Dana and Fandogh portraits; characters use `contain`. */
  cover?: boolean | undefined;
  /** Adds the path page's solid 5px bottom edge under the ring. */
  edge?: boolean | undefined;
};

/**
 * `.por`: circular portrait, 3px white border and a 2px outer line ring that takes no layout space.
 *
 * The approved pages size the image to the circle's inner WIDTH and let its height follow the aspect
 * (their `height:100%` does not resolve inside the grid). A tall character therefore overflows the
 * bottom of the circle and is clipped, which shows head and shoulders. A short image sits on the
 * bottom edge. `cover` is for the already-square Dana and Fandogh crops.
 */
export function Portrait({ pose, label, tone = 'neutral', size = UI.portrait.size, cover = false, borderColor = C.surface, edge = false }: Props) {
  const inner = size - UI.portrait.ring * 2;
  const art = CHARACTER_SIZE[pose];
  const scaledHeight = cover ? inner : (inner * art.height) / art.width;
  return (
    <View style={{ width: size, height: size }}>
      {edge ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: UI.path.mate.edge, start: 0, end: 0, bottom: -UI.path.mate.edge, borderRadius: size / 2, backgroundColor: C.line2 }}
        />
      ) : null}
      <View pointerEvents="none" style={[styles.ring, { borderRadius: (size + UI.portrait.outerRing * 2) / 2 }]} />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          borderWidth: UI.portrait.ring,
          borderColor,
          backgroundColor: TONE_BG[tone],
          justifyContent: scaledHeight >= inner ? 'flex-start' : 'flex-end',
          alignItems: 'center',
        }}
      >
        <Image
          source={CHARACTER_ART[pose]}
          style={{ width: inner, height: scaledHeight }}
          resizeMode={cover ? 'cover' : 'contain'}
          accessible
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: -UI.portrait.outerRing,
    start: -UI.portrait.outerRing,
    end: -UI.portrait.outerRing,
    bottom: -UI.portrait.outerRing,
    backgroundColor: C.line,
  },
});
