import { StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { Button } from './Button';
import { Icon } from './Icon';
import { C, UI, typeStyle } from './tokens';

type Props = {
  /** `correct` = primary container; `soft` = warm neutral container (a wrong answer is never red). */
  tone: 'correct' | 'soft';
  text: string;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
};

/** `.fb`: bottom sheet (28px top radius) with a status icon, one sentence and one action. */
export function FeedbackSheet({ tone, text, actionLabel, onAction, busy = false }: Props) {
  const correct = tone === 'correct';
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.sheet, { backgroundColor: correct ? C.primaryC : C.neutralC }]}
    >
      <View style={styles.header}>
        <View style={styles.icon}>
          <Icon name={correct ? 'check' : 'retry'} size={UI.question.sheetGlyph} color={correct ? C.primary : UI.onColor.neutralContainerIcon} />
        </View>
        <Text style={[typeStyle('feedbackHeading'), styles.text, { color: correct ? C.onPrimaryC : C.onNeutralC }]}>{text}</Text>
      </View>
      <Button label={actionLabel} onPress={onAction} variant={correct ? 'primary' : 'amber'} loading={busy} />
    </View>
  );
}

const Q = UI.question;
const styles = StyleSheet.create({
  sheet: {
    gap: Q.sheetGap,
    paddingTop: Q.sheetPadTop,
    paddingHorizontal: Q.sheetPadX,
    paddingBottom: Q.sheetPadBottom,
    borderTopStartRadius: UI.surface.sheetTopRadius,
    borderTopEndRadius: UI.surface.sheetTopRadius,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Q.sheetHeaderGap },
  icon: { width: Q.sheetIcon, height: Q.sheetIcon, borderRadius: Q.sheetIcon / 2, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
