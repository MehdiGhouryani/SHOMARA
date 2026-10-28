import { StyleSheet, View } from 'react-native';
import { Body, BeadTray, Button, FeedbackSheet, Foot, H1, OptionButton, Screen, UI, type OptionState } from '../../ui/v1';
import { LessonCaption, LessonTopBar } from './LessonChrome';

/** `choose` = page 08, `correct` = page 09, `retry` = page 10. */
export type QuestionPhase = 'choose' | 'correct' | 'retry';

type Props = {
  caption: { label: string; position: string };
  progress: number;
  progressLabel: string;
  closeLabel: string;
  prompt: string;
  beadCount: number;
  beadsLabel: string;
  replayLabel: string;
  options: string[];
  selectedIndex: number | null;
  phase: QuestionPhase;
  checkLabel: string;
  feedbackText: string;
  feedbackActionLabel: string;
  /** Check and the sheet action are disabled or busy while an answer is being sent. */
  busy?: boolean;
  onReplay: () => void;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onFeedbackAction: () => void;
  onClose: () => void;
};

function optionState(index: number, selected: number | null, phase: QuestionPhase): OptionState {
  if (index === selected) return phase === 'retry' ? 'soft' : 'selected';
  return phase === 'choose' ? 'idle' : 'dim';
}

/** Pages 08 to 10: one counting question with its answer buttons and, after checking, the feedback sheet. */
export function QuestionView(p: Props) {
  const choosing = p.phase === 'choose';
  return (
    <Screen>
      <LessonTopBar progress={p.progress} progressLabel={p.progressLabel} closeLabel={p.closeLabel} onClose={p.onClose} />
      <Body gap={UI.lesson.bodyGap} paddingTop={UI.lesson.bodyTop}>
        <LessonCaption label={p.caption.label} position={p.caption.position} />
        <H1 style={styles.prompt}>{p.prompt}</H1>
        <BeadTray count={p.beadCount} label={p.beadsLabel} numbered={false} />
        {choosing ? <Button variant="secondary" compact icon="speaker" label={p.replayLabel} onPress={p.onReplay} /> : null}
        <View style={[styles.options, { marginBottom: choosing ? UI.question.optionsBottomChoose : UI.question.optionsBottomFeedback }]}>
          {p.options.map((label, index) => (
            <OptionButton
              key={`${label}-${index}`}
              label={label}
              state={optionState(index, p.selectedIndex, p.phase)}
              disabled={!choosing || Boolean(p.busy)}
              onPress={() => p.onSelect(index)}
            />
          ))}
        </View>
      </Body>
      {choosing ? (
        <Foot>
          <Button label={p.checkLabel} onPress={p.onCheck} disabled={p.selectedIndex === null} loading={Boolean(p.busy)} />
        </Foot>
      ) : (
        <FeedbackSheet tone={p.phase === 'correct' ? 'correct' : 'soft'} text={p.feedbackText} actionLabel={p.feedbackActionLabel} onAction={p.onFeedbackAction} busy={Boolean(p.busy)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: { marginTop: UI.intro.titleTop },
  options: { flexDirection: 'row', gap: UI.question.optionsGap, width: '100%', marginTop: 'auto' },
});
