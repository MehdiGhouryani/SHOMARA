import { StyleSheet, View } from 'react-native';
import { Body, BeadTray, Button, Foot, GuideBubble, Screen, UI } from '../../ui/v1';
import { LessonCaption, LessonTopBar } from './LessonChrome';

type Props = {
  caption: { label: string; position: string };
  progress: number;
  progressLabel: string;
  closeLabel: string;
  /** Bubble text spoken by the guide (also what "hear again" reads). */
  prompt: string;
  beadCount: number;
  beadsLabel: string;
  guideLabel: string;
  replayLabel: string;
  continueLabel: string;
  /** Continue is disabled while the next step is being prepared. */
  busy?: boolean;
  onReplay: () => void;
  onContinue: () => void;
  onClose: () => void;
};

/** Page 07: first lesson section. Pure view; the flow owns audio and the stage change. */
export function TeachView(p: Props) {
  return (
    <Screen>
      <LessonTopBar progress={p.progress} progressLabel={p.progressLabel} closeLabel={p.closeLabel} onClose={p.onClose} />
      <Body gap={UI.lesson.bodyGap} paddingTop={UI.lesson.bodyTop}>
        <LessonCaption label={p.caption.label} position={p.caption.position} />
        <View style={styles.guide}>
          <GuideBubble pose="number-front" tone="number" portraitLabel={p.guideLabel} text={p.prompt} />
        </View>
        <BeadTray count={p.beadCount} label={p.beadsLabel} />
        <Button variant="secondary" compact icon="speaker" label={p.replayLabel} onPress={p.onReplay} />
      </Body>
      <Foot>
        <Button label={p.continueLabel} onPress={p.onContinue} disabled={p.busy ?? false} />
      </Foot>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guide: { width: '100%', marginTop: UI.lesson.guideTop },
});
