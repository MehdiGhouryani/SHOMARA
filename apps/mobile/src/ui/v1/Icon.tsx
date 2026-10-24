import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';
import { ICONS, type IconName } from './icons';
import { C } from './tokens';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Page icons use a 2.5 stroke in a 24 viewBox. */
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/** Decorative by default: the control that contains the icon carries the accessible label. */
export function Icon({ name, size = 24, color = C.ink, strokeWidth = 2.5, style }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ICONS[name].map((n, i) =>
        n.t === 'path' ? (
          <Path key={i} d={n.d} />
        ) : n.t === 'circle' ? (
          <Circle key={i} cx={n.cx} cy={n.cy} r={n.r} />
        ) : (
          <Rect key={i} x={n.x} y={n.y} width={n.width} height={n.height} rx={n.rx} />
        ),
      )}
    </Svg>
  );
}
