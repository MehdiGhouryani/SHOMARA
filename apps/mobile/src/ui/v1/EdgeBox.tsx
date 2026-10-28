import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  /** Height of the solid bottom edge (the pages draw it with `box-shadow: 0 Npx 0 color`). */
  edge: number;
  edgeColor: string;
  radius: number;
  /** Face moved down by this many px (pressed state); the edge layer stays put and is covered. */
  lift?: number;
  gradient?: readonly [string, string] | undefined;
  /** Inset top highlight (`inset 0 2px 0 ...`). */
  highlight?: { height: number; color: string };
  /** Styles of the face (background, border, padding, minHeight ...). */
  faceStyle?: StyleProp<ViewStyle>;
  /** Styles of the layout wrapper (width, margins ...). */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * CSS `box-shadow: 0 Npx 0 color` does not take layout space, so the edge is an absolutely
 * positioned layer that extends below the wrapper while the face defines the layout box.
 */
export function EdgeBox({ edge, edgeColor, radius, lift = 0, gradient, highlight, faceStyle, style, children }: Props) {
  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: edge, start: 0, end: 0, bottom: -edge, borderRadius: radius, backgroundColor: edgeColor }}
      />
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, faceStyle, lift ? { transform: [{ translateY: lift }] } : null]}>
        {gradient ? <LinearGradient pointerEvents="none" colors={[gradient[0], gradient[1]]} style={StyleSheet.absoluteFill} /> : null}
        {highlight ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, start: 0, end: 0, height: highlight.height, backgroundColor: highlight.color }}
          />
        ) : null}
        {children}
      </View>
    </View>
  );
}
