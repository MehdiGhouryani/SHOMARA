import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../AppText';
import { EdgeBox } from './EdgeBox';
import { C, GRADIENT, UI, typeStyle } from './tokens';

/** `idle`, `selected` (primary), `soft` (the retry look: warm, never red), and `dim` (the other options after checking). */
export type OptionState = 'idle' | 'selected' | 'soft' | 'dim';

type Props = { label: string; state: OptionState; disabled?: boolean; onPress?: (() => void) | undefined };

/** `.opt`: 88px answer button with a big number; selected = primary border, container fill and primary edge. */
export function OptionButton({ label, state, disabled = false, onPress }: Props) {
  const Q = UI.question;
  const look =
    state === 'selected'
      ? { border: C.primary, edge: C.primary, edgeSize: Q.optionEdge, text: C.primaryEdge, bg: C.primaryC, highlight: Q.optionHighlightSelected }
      : state === 'soft'
        ? { border: C.amberEdge, edge: C.amberEdge, edgeSize: Q.optionEdgeSoft, text: C.onNeutralC, bg: C.neutralC, highlight: undefined }
        : { border: C.line2, edge: C.line2, edgeSize: Q.optionEdge, text: C.ink, bg: undefined, highlight: Q.optionHighlight };
  const gradient = state === 'idle' || state === 'dim' ? GRADIENT.secondary : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: state === 'selected' || state === 'soft', disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.hit, state === 'dim' ? { opacity: Q.optionDimOpacity } : null]}
    >
      <EdgeBox
        edge={look.edgeSize}
        edgeColor={look.edge}
        radius={UI.control.optionRadius}
        gradient={gradient}
        {...(look.highlight ? { highlight: { height: Q.optionHighlightHeight, color: look.highlight } } : {})}
        faceStyle={[styles.face, { borderColor: look.border }, look.bg ? { backgroundColor: look.bg } : null]}
      >
        <Text style={[typeStyle('option'), { color: look.text }]}>{label}</Text>
      </EdgeBox>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1, height: UI.control.optionHeight },
  face: { height: UI.control.optionHeight, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
