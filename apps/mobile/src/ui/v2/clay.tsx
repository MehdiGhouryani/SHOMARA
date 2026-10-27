import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CL2, C2, R2, type ClayLevel } from './tokens';

/**
 * Native soft-clay depth (DESIGN MASTER §4): React Native is not CSS, so the depth is a layered
 * View — a warm border, one constrained outer lift (iOS shadow / Android elevation) and a thin
 * top highlight rim. Colors resolve through v2.color: `surface` = white card, `amberSoft` =
 * featured hero/current node. Nothing here blurs, and the highlight never catches touches.
 */

type Tone = 'surface' | 'alt' | 'amberSoft' | 'skySoft' | 'primarySoft';

const FILL: Record<Tone, string> = {
  surface: C2.surface,
  alt: C2.surfaceAlt,
  amberSoft: C2.amberSoft,
  skySoft: C2.skySoft,
  primarySoft: C2.primarySoft,
};

const BORDER: Record<Tone, string> = {
  surface: C2.line,
  alt: C2.line,
  amberSoft: C2.amber,
  skySoft: C2.sky,
  primarySoft: C2.primary,
};

type Props = {
  level?: ClayLevel;
  tone?: Tone;
  radius?: number;
  style?: StyleProp<ViewStyle> | undefined;
  children?: React.ReactNode;
};

export function ClaySurface({ level = 'soft', tone = 'surface', radius = R2.lg, style, children }: Props) {
  const clay = level === 'featured' ? CL2.featured : CL2.soft;
  const fill = FILL[tone];
  const border = level === 'featured' ? BORDER[tone] : tone === 'surface' || tone === 'alt' ? C2.line : BORDER[tone];
  const highlight = `rgba(255,255,255,${clay.highlightOpacity})`;
  const inner = Math.max(0, radius - clay.borderWidth);
  return (
    <View
      style={[
        styles.base,
        style,
        {
          backgroundColor: fill,
          borderColor: border,
          borderWidth: clay.borderWidth,
          borderRadius: radius,
          shadowColor: C2.ink,
          shadowOpacity: clay.shadowOpacity,
          shadowRadius: clay.shadowRadius,
          shadowOffset: { width: 0, height: clay.shadowOffsetY },
          elevation: clay.elevation,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            height: clay.highlightThickness,
            backgroundColor: highlight,
            borderTopStartRadius: inner,
            borderTopEndRadius: inner,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  highlight: { position: 'absolute', top: 0, start: 0, end: 0 },
});
