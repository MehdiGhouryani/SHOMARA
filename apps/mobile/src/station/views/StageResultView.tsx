import { StyleSheet, View } from 'react-native';
import { AchievementRow, Body, Button, C, Character, Confetti, Foot, H1, Screen, Sub, UI, typeStyle } from '../../ui/v1';
import { Text } from '../../ui/AppText';

type Props = {
  heroLabel: string;
  title: string;
  subtitle: string;
  /** Sections of the chapter the child has finished (the bar row draws `done` filled bars of `total`). */
  done: number;
  total: number;
  progressLabel: string;
  /** The newly earned path achievement; omit when the station passed without one. */
  achievement?: { kicker: string; title: string } | undefined;
  continueLabel: string;
  onContinue: () => void;
};

/** Page 11: the calm celebration after a station is finished. Pure view; the flow owns pass state. */
export function StageResultView(p: Props) {
  const R = UI.result;
  return (
    <Screen>
      <Confetti />
      <Body gap={16} paddingTop={R.bodyTop} justify="center">
        <View style={styles.disc}>
          <View style={styles.discFill} />
          <View style={{ marginBottom: R.heroBottom }}>
            <Character pose="main-celebrate" height={R.hero} label={p.heroLabel} />
          </View>
        </View>
        <H1 style={styles.title}>{p.title}</H1>
        <Sub>{p.subtitle}</Sub>
        <View style={styles.barsWrap}>
          <View style={styles.bars} accessibilityRole="image" accessibilityLabel={p.progressLabel}>
            {Array.from({ length: p.total }, (_, index) => (
              <View key={index} style={[styles.bar, index < p.done ? styles.barOn : null]} />
            ))}
          </View>
          <Text style={[typeStyle('caption'), styles.cap]}>{p.progressLabel}</Text>
        </View>
        {p.achievement ? <AchievementRow tone="highlight" kicker={p.achievement.kicker} title={p.achievement.title} style={{ marginTop: R.rowTop }} /> : null}
      </Body>
      <Foot>
        <Button label={p.continueLabel} onPress={p.onContinue} />
      </Foot>
    </Screen>
  );
}

const R = UI.result;
const styles = StyleSheet.create({
  disc: { width: R.disc, height: R.disc, alignItems: 'center', justifyContent: 'flex-end' },
  discFill: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, borderRadius: R.disc / 2, backgroundColor: C.violetC },
  title: { fontSize: R.titleSize, lineHeight: R.titleLine, marginTop: R.titleTop },
  barsWrap: { width: '100%', alignItems: 'center', gap: R.capTop },
  bars: { flexDirection: 'row', gap: R.barGap, width: '100%' },
  bar: { flex: 1, height: R.barHeight, borderRadius: 99, backgroundColor: C.surfaceV },
  barOn: { backgroundColor: C.primary },
  cap: { textAlign: 'center' },
});
