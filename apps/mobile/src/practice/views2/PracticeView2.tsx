import { StyleSheet, View } from 'react-native';
import { Text } from '../../ui/AppText';
import { Button, Chip } from '../../ui/v2/core';
import { Body2, GuideBubble2, ListRow2, Screen2 } from '../../ui/v2/shell';
import { C2, S2, type2 } from '../../ui/v2/tokens';

export type PracticeRowItem = {
  id: string;
  title: string;
  kicker: string;
  icon: 'bolt' | 'lock';
  locked: boolean;
};

type Props = {
  title: string;
  guideLabel: string;
  guideText: string;
  rows: PracticeRowItem[];
  chipLabel: string;
  startLabel: string;
  /** Soft habit copy for screen readers (the page draws no habit line). */
  listLabel?: string | undefined;
  onStart: () => void;
};

/** Playbook 12 (practice tab content): Fandogh's guide, honest contract rows, one primary action. */
export function PracticeView2(p: Props) {
  return (
    <Screen2>
      <Body2 gap={S2.xl} paddingTop={S2.xxxl} align="stretch">
        <Text accessibilityRole="header" style={[type2('title'), styles.title]}>{p.title}</Text>
        <GuideBubble2 characterId="fandogh" emotion="guide" fit="cover" characterLabel={p.guideLabel} text={p.guideText} />
        <View style={styles.list} accessibilityLabel={p.listLabel}>
          {p.rows.map((row) => (
            <ListRow2
              key={row.id}
              icon={row.locked ? 'lock-closed' : 'flash'}
              title={row.title}
              kicker={row.kicker}
              off={row.locked}
              trailing={!row.locked ? <Chip tone="berry" label={p.chipLabel} /> : null}
            />
          ))}
        </View>
        <View style={styles.start}>
          <Button label={p.startLabel} onPress={p.onStart} />
        </View>
      </Body2>
    </Screen2>
  );
}

const styles = StyleSheet.create({
  title: { color: C2.ink, textAlign: 'right' },
  list: { gap: S2.md, marginTop: S2.sm },
  start: { marginTop: 'auto', marginBottom: S2.lg },
});
