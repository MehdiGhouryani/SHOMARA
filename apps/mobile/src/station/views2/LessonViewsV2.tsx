import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../../ui/AppText';
import { Button, Card, Chip, ProgressBar } from '../../ui/v2/core';
import { CountTray, FeedbackSheet, OptionTile } from '../../ui/v2/lesson';
import { CharacterSpot } from '../../ui/v2/path';
import { C2, K2, R2, S2, type2 } from '../../ui/v2/tokens';
import { S } from '../../ui/strings.fa';
import { toFa } from '../../ui/digits';
import { CHARACTER_ART } from '../../ui/v1/characters';

/**
 * UI V2 lesson views (D-021) — pure presentation mirroring the V1 prop contracts, so StationFlow
 * can swap them per stage without touching orchestration, audio, or server decisions.
 * The counting tray makes the question genuinely interactive (tap-to-count) while the submitted
 * answer remains the same server-authoritative answerIndex contract.
 */

type Caption = { label: string; position: string };

function LessonChrome2({ caption, progress, progressLabel, closeLabel, onClose, children }: {
  caption: Caption;
  progress: number;
  progressLabel: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={24} color={C2.ink} />
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={[type2('caption'), { color: C2.muted }]}>{caption.label}</Text>
          <ProgressBar ratio={progress} accessibilityLabel={progressLabel} />
        </View>
        <Chip label={caption.position} tone="sky" />
      </View>
      {children}
    </View>
  );
}

type TeachProps = {
  caption: { label: string; position: string };
  progress: number;
  progressLabel: string;
  closeLabel: string;
  prompt: string;
  beadCount: number;
  beadsLabel: string;
  guideLabel: string;
  replayLabel: string;
  continueLabel: string;
  busy?: boolean | undefined;
  onReplay: () => void;
  onContinue: () => void;
  onClose: () => void;
};

/** V2 teaching screen: warm card, beads to tap-count, replay and one continue. */
export function TeachView2(p: TeachProps) {
  return (
    <LessonChrome2 caption={p.caption} progress={p.progress} progressLabel={p.progressLabel} closeLabel={p.closeLabel} onClose={p.onClose}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.promptCard}>
          <CharacterSpot source={CHARACTER_ART["main-front"]} size={104} label={p.guideLabel} idleBob />
          <Text style={[type2('title'), { color: C2.ink, textAlign: 'center' }]}>{p.prompt}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={p.replayLabel} onPress={p.onReplay} style={styles.replay}>
            <Ionicons name="volume-high" size={18} color={C2.sky} />
            <Text style={[type2('caption'), { color: C2.sky }]}>{p.replayLabel}</Text>
          </Pressable>
        </Card>
        <View accessibilityLabel={p.beadsLabel}>
          <Text style={[type2('caption'), { color: C2.muted, textAlign: 'center', marginBottom: S2.sm }]}>{S.v2.countHint}</Text>
          <CountTray beads={p.beadCount} />
        </View>
        <Button label={p.continueLabel} onPress={p.onContinue} disabled={p.busy} loading={p.busy} accessibilityLabel={p.continueLabel} />
      </ScrollView>
    </LessonChrome2>
  );
}

type QuestionProps = {
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
  phase: 'choose' | 'correct' | 'retry';
  checkLabel: string;
  feedbackText: string;
  feedbackActionLabel: string;
  busy?: boolean | undefined;
  onReplay: () => void;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onFeedbackAction: () => void;
  onClose: () => void;
};

const NUMERIC = /^[۰-۹0-9]+$/;

/** V2 question screen: interactive counting tray for numeric options, answer tiles below, one check. */
export function QuestionView2(p: QuestionProps) {
  const numeric = p.options.length > 0 && p.options.every((o) => NUMERIC.test(o.replace(/\s/g, '')));
  const sheetOpen = p.phase !== 'choose';
  return (
    <LessonChrome2 caption={p.caption} progress={p.progress} progressLabel={p.progressLabel} closeLabel={p.closeLabel} onClose={p.onClose}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.promptCard}>
          <Text style={[type2('title'), { color: C2.ink, textAlign: 'center' }]}>{p.prompt}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={p.replayLabel} onPress={p.onReplay} style={styles.replay}>
            <Ionicons name="volume-high" size={18} color={C2.sky} />
            <Text style={[type2('caption'), { color: C2.sky }]}>{p.replayLabel}</Text>
          </Pressable>
        </Card>
        {numeric && !sheetOpen ? (
          <View accessibilityLabel={p.beadsLabel}>
            <Text style={[type2('caption'), { color: C2.muted, textAlign: 'center', marginBottom: S2.sm }]}>{S.v2.countHint}</Text>
            <CountTray beads={p.beadCount} />
          </View>
        ) : null}
        <View style={styles.options}>
          {p.options.map((option, index) => (
            <OptionTile
              key={`${option}-${index}`}
              label={option}
              selected={p.selectedIndex === index}
              disabled={sheetOpen || p.busy}
              onPress={() => p.onSelect(index)}
            />
          ))}
        </View>
        {sheetOpen ? (
          <FeedbackSheet tone={p.phase === 'correct' ? 'correct' : 'retry'} text={p.feedbackText} actionLabel={p.feedbackActionLabel} onAction={p.onFeedbackAction} />
        ) : (
          <Button label={p.checkLabel} onPress={p.onCheck} disabled={p.selectedIndex === null} loading={p.busy} />
        )}
      </ScrollView>
    </LessonChrome2>
  );
}

type ResultProps = {
  heroLabel: string;
  title: string;
  subtitle: string;
  done: number;
  total: number;
  progressLabel: string;
  achievement?: { kicker: string; title: string } | undefined;
  continueLabel: string;
  onContinue: () => void;
};

/** V2 result: celebration card with the character, honest chapter progress, optional achievement row. */
export function StageResultView2(p: ResultProps) {
  return (
    <LessonChrome2 caption={{ label: S.v2.doneLabel, position: `${toFa(p.done)} از ${toFa(p.total)}` }} progress={p.total > 0 ? p.done / p.total : 0} progressLabel={p.progressLabel} closeLabel={S.lesson.close} onClose={p.onContinue}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.resultCard}>
          <CharacterSpot source={CHARACTER_ART["main-celebrate"]} size={132} label={p.heroLabel} idleBob />
          <Text style={[type2('display'), { color: C2.primaryDark, textAlign: 'center' }]}>{p.title}</Text>
          <Text style={[type2('body'), { color: C2.ink2, textAlign: 'center' }]}>{p.subtitle}</Text>
          <Text style={[type2('bignum'), { color: C2.ink, textAlign: 'center' }]}>{toFa(p.done)} / {toFa(p.total)}</Text>
          {p.achievement ? (
            <View style={styles.achievement}>
              <Ionicons name="ribbon" size={26} color={C2.berryDark} />
              <View>
                <Text style={[type2('caption'), { color: C2.berryDark }]}>{p.achievement.kicker}</Text>
                <Text style={[type2('body'), { color: C2.ink }]}>{p.achievement.title}</Text>
              </View>
            </View>
          ) : null}
          <Button label={p.continueLabel} onPress={p.onContinue} />
        </Card>
      </ScrollView>
    </LessonChrome2>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C2.canvas },
  topBar: {
    minHeight: K2.topBarH,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: S2.md,
    paddingHorizontal: S2.lg,
    paddingTop: S2.sm,
  },
  close: { width: K2.touchMin, height: K2.touchMin, borderRadius: R2.md, backgroundColor: C2.surface, borderWidth: 1.5, borderColor: C2.line, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, gap: 4 },
  body: { padding: S2.lg, gap: S2.lg, paddingBottom: S2.huge },
  promptCard: { alignItems: 'center', gap: S2.md },
  replay: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, minHeight: K2.touchMin, paddingHorizontal: S2.md, borderRadius: R2.pill, backgroundColor: C2.skySoft, alignSelf: 'center', justifyContent: 'center' },
  options: { gap: S2.md },
  resultCard: { alignItems: 'center', gap: S2.md },
  achievement: { flexDirection: 'row-reverse', alignItems: 'center', gap: S2.md, backgroundColor: C2.berrySoft, borderRadius: R2.md, padding: S2.md, alignSelf: 'stretch' },
});
