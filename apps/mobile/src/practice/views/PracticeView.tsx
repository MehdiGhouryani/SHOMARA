import { StyleSheet, View } from 'react-native';
import { Body, Button, C, Chip, GuideBubble, ListRow, Screen, UI } from '../../ui/v1';
import { Text } from '../../ui/AppText';

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

/** Page 13: the practice tab. Pure view; the container owns the practice contract data and navigation. */
export function PracticeView(p: Props) {
  return (
    <Screen>
      <Body gap={20} paddingTop={UI.practice.bodyTop} align="stretch">
        <Text accessibilityRole="header" style={styles.title}>{p.title}</Text>
        <GuideBubble pose="fandogh-portrait" cover portraitLabel={p.guideLabel} text={p.guideText} />
        <View style={styles.list} accessibilityLabel={p.listLabel}>
          {p.rows.map((row) => (
            <ListRow key={row.id} icon={row.icon} title={row.title} kicker={row.kicker} tone={row.locked ? 'off' : 'plain'} trailingIcon={row.locked ? 'lock' : undefined}>
              {!row.locked ? <Chip tone="violet" label={p.chipLabel} /> : null}
            </ListRow>
          ))}
        </View>
        <View style={styles.start}>
          <Button label={p.startLabel} onPress={p.onStart} />
        </View>
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, lineHeight: 40, fontWeight: '600', color: C.ink, textAlign: 'right' },
  list: { gap: UI.practice.listGap, marginTop: UI.practice.listTop },
  start: { marginTop: 'auto', marginBottom: 16 },
});
