import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

type Props = {
  size: number;
  /** `radial-gradient(circle at 50% 22%, hi, base 70%)` or a flat colour. */
  hi?: string | undefined;
  base: string;
  /** Inset top highlight: a crescent `thickness` thick (CSS `inset 0 3px 0 rgba(255,255,255,.3)`). */
  highlight: string;
  thickness: number;
};

/** Painted face of a path node. */
export function NodeFace({ size, hi, base, highlight, thickness }: Props) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const r = size / 2;
  const cy = size * 0.22;
  // CSS "farthest-corner" radius from (50%, 22%).
  const reach = Math.hypot(r, size - cy);
  const dx = Math.sqrt(r * r - (thickness / 2) ** 2);
  const y = r + thickness / 2;
  const crescent = `M ${r - dx} ${y} A ${r} ${r} 0 1 1 ${r + dx} ${y} A ${r} ${r} 0 0 0 ${r - dx} ${y} Z`;
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      {hi ? (
        <Defs>
          <RadialGradient id={id} gradientUnits="userSpaceOnUse" cx={r} cy={cy} fx={r} fy={cy} r={reach}>
            <Stop offset="0" stopColor={hi} />
            <Stop offset="0.7" stopColor={base} />
            <Stop offset="1" stopColor={base} />
          </RadialGradient>
        </Defs>
      ) : null}
      <Circle cx={r} cy={r} r={r} fill={hi ? `url(#${id})` : base} stroke="none" />
      <Path d={crescent} fill={highlight} stroke="none" />
    </Svg>
  );
}
