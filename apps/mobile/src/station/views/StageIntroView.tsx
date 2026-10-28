import { StyleSheet, View } from 'react-native';
import { Body, Button, Character, Chip, Foot, H1, Screen, Sub, TextButton, TopBar, C, UI, typeStyle } from '../../ui/v1';
import { Text } from '../../ui/AppText';

export type StageIntroNotice = { tone: 'info' | 'error'; text: string };

type Props = {
  stageLabel: string;
  title: string;
  subtitle: string;
  sectionsLabel: string;
  minutesLabel: string;
  /** 0..1 share of finished sections. */
  progress: number;
  progressLabel: string;
  startLabel: string;
  /** Derived state the page does not draw: the button keeps its amber look and shows a spinner. */
  busy?: boolean;
  startDisabled?: boolean;
  notice?: StageIntroNotice | undefined;
  backLabel: string;
  closeLabel: string;
  heroLabel: string;
  onStart: () => void;
  onBack: () => void;
  onClose: () => void;
};

/** Page 06: stage intro. Pure view; the route owns content preparation and navigation. */
export function StageIntroView(p: Props) {
  const pct = Math.max(0, Math.min(1, p.progress));
  return (
    <Screen>
      <TopBar action={{ icon: 'close', label: p.closeLabel, onPress: p.onClose }}>
        <View style={styles.topCenter}>
          <Chip label={p.stageLabel} />
        </View>
        <View style={styles.topSpacer} />
      </TopBar>
      <Body gap={16} paddingBottom={24} justify="center">
        <View style={styles.disc}>
          <View style={styles.discFill} />
          <Character pose="number-yawning" height={UI.intro.hero} label={p.heroLabel} />
        </View>
        <H1 style={styles.title}>{p.title}</H1>
        <Sub>{p.subtitle}</Sub>
        <View style={styles.chips}>
          <Chip icon="book" label={p.sectionsLabel} />
          <Chip icon="clock" label={p.minutesLabel} />
        </View>
        <View
          style={styles.bar}
          accessibilityRole="progressbar"
          accessibilityLabel={p.progressLabel}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
        >
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
        {p.notice ? (
          <Text
            accessibilityRole={p.notice.tone === 'error' ? 'alert' : undefined}
            style={[typeStyle('caption'), styles.notice, { color: p.notice.tone === 'error' ? C.error : C.ink2 }]}
          >
            {p.notice.text}
          </Text>
        ) : null}
      </Body>
      <Foot>
        <Button label={p.startLabel} onPress={p.onStart} loading={p.busy ?? false} disabled={p.startDisabled ?? false} />
        <TextButton label={p.backLabel} onPress={p.onBack} />
      </Foot>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topCenter: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  topSpacer: { width: UI.intro.topSpacer },
  disc: { width: UI.intro.disc, height: UI.intro.disc, alignItems: 'center', justifyContent: 'flex-end' },
  discFill: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, borderRadius: UI.intro.disc / 2, backgroundColor: C.primaryC },
  title: { marginTop: UI.intro.titleTop },
  chips: { flexDirection: 'row', gap: 8 },
  bar: { width: '100%', maxWidth: UI.intro.barMaxWidth, height: UI.intro.barHeight, marginTop: UI.intro.barTop, borderRadius: 99, backgroundColor: C.surfaceV, overflow: 'hidden', flexDirection: 'row' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: C.primary },
  notice: { textAlign: 'center' },
});
