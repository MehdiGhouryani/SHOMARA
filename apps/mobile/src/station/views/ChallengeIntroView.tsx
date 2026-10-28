import { StyleSheet, View } from 'react-native';
import { Body, Button, C, Character, Chip, Foot, H1, Screen, Sub, UI } from '../../ui/v1';
import { LessonCaption, LessonTopBar } from './LessonChrome';
import type { IconName } from '../../ui/v1/icons';

type Props = {
  caption: { label: string; position: string };
  progress: number;
  progressLabel: string;
  closeLabel: string;
  title: string;
  subtitle: string;
  /** First chip (with the icon) names the challenge; the second counts its questions. */
  kindChip: string;
  kindChipIcon?: IconName;
  questionsChip: string;
  heroLabel: string;
  startLabel: string;
  onStart: () => void;
  onClose: () => void;
};

/** Page 12: the challenge invitation. Pure view; the player itself has no approved page yet. */
export function ChallengeIntroView(p: Props) {
  const CH = UI.challenge;
  return (
    <Screen>
      <LessonTopBar progress={p.progress} progressLabel={p.progressLabel} closeLabel={p.closeLabel} onClose={p.onClose} />
      <Body gap={16} paddingBottom={24} justify="center">
        <View style={styles.disc}>
          <View style={styles.discFill} />
          <Character pose="roka-trophy" height={CH.hero} label={p.heroLabel} />
        </View>
        <H1 style={styles.title}>{p.title}</H1>
        <Sub>{p.subtitle}</Sub>
        <View style={styles.chips}>
          <Chip icon={p.kindChipIcon} label={p.kindChip} />
          <Chip label={p.questionsChip} />
        </View>
      </Body>
      <Foot>
        <Button label={p.startLabel} onPress={p.onStart} />
      </Foot>
    </Screen>
  );
}

const CH = UI.challenge;
const styles = StyleSheet.create({
  disc: { width: CH.disc, height: CH.disc, alignItems: 'center', justifyContent: 'flex-end' },
  discFill: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, borderRadius: CH.disc / 2, backgroundColor: C.errorC },
  title: { marginTop: 8 },
  chips: { flexDirection: 'row', gap: CH.chipGap },
});
