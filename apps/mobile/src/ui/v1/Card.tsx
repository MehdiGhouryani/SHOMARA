import type { StyleProp, ViewStyle } from 'react-native';
import { EdgeBox } from './EdgeBox';
import { C, UI } from './tokens';

type Props = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };

/** `.card`: white face, 2px line border, 20px radius, 4px solid bottom edge. */
export function Card({ children, style }: Props) {
  return (
    <EdgeBox
      edge={UI.surface.cardEdge}
      edgeColor={C.line}
      radius={UI.surface.cardRadius}
      style={style}
      faceStyle={{ backgroundColor: C.surface, borderWidth: UI.surface.cardBorder, borderColor: C.line, padding: 16 }}
    >
      {children}
    </EdgeBox>
  );
}
