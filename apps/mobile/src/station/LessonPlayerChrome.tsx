import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { ProgressFill } from '../game-feel';
import { Button } from '../ui/v2/core';
import { ClaySurface } from '../ui/v2/clay';
import { C2, K2, R2, S2, type2 } from '../ui/v2/tokens';
import { LESSON_STAGE_META, type LessonFeedbackState, type LessonStage } from '@math/contracts';
import { S } from '../ui/strings.fa';

function CloseIcon() {
  return <Text style={styles.icon} accessibilityElementsHidden>×</Text>;
}

/**
 * Legacy-stage player chrome on the V2 identity (playbook 08–13): the header/progress/feedback
 * shell around the not-yet-migrated stage bodies. SIGNATURE_CHALLENGE stays outside the lesson
 * stage contract — the fallback below is a pinned regression guard (challenge-first stations).
 */
export function LessonPlayerChrome({ stage, progress, onExit, children, feedback }: {
  stage: LessonStage;
  progress: number;
  onExit: () => void;
  children: ReactNode;
  feedback?: ReactNode;
}) {
  // SIGNATURE_CHALLENGE is not a lesson stage in the shared contract; without a fallback the header
  // crashed on every challenge-first station (caught by the station flow test in U6).
  const meta = LESSON_STAGE_META[stage] ?? { label: S.challengeIntro.playerLabel, kind: 'ASSESSMENT' as const, showCharacter: false, primaryAction: 'CHECK' as const };
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="خروج از درس" onPress={onExit} style={styles.close}>
          <CloseIcon />
        </Pressable>
        <View style={styles.progressBlock}>
          <Text style={styles.stageLabel}>{meta.label}</Text>
          <ProgressFill value={progress} label={`پیشرفت ${Math.round(progress)} درصد`} />
        </View>
        <View style={styles.safeBadge}><Text style={styles.safeBadgeText}>محیط امن</Text></View>
      </View>
      <View style={styles.content}>{children}</View>
      {feedback ? <View style={styles.footer}>{feedback}</View> : null}
    </View>
  );
}

export function LessonFeedbackCard({ state, title, text, actionLabel, onAction, disabled = false }: {
  state: LessonFeedbackState;
  title: string;
  text?: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  const positive = state === 'CORRECT';
  const danger = state === 'ERROR';
  return (
    <View style={[styles.feedback, positive ? styles.feedbackSuccess : null, danger ? styles.feedbackError : !positive ? styles.feedbackRetry : null]}>
      <View style={styles.feedbackRow}>
        <View style={[styles.feedbackIcon, positive ? styles.feedbackIconSuccess : danger ? styles.feedbackIconError : styles.feedbackIconRetry]}><Text style={styles.feedbackIconText}>{positive ? '✓' : danger ? '!' : '↺'}</Text></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.feedbackTitle}>{title}</Text>
          {text ? <Text style={styles.feedbackText}>{text}</Text> : null}
        </View>
      </View>
      <Button label={actionLabel} onPress={onAction} disabled={disabled} variant={positive ? 'primary' : 'amber'} style={styles.feedbackButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C2.canvas },
  header: {
    minHeight: 72,
    paddingHorizontal: S2.lg,
    paddingVertical: S2.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.md,
    backgroundColor: C2.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: C2.line,
  },
  close: { width: K2.touchMin, height: K2.touchMin, borderRadius: R2.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C2.line2, backgroundColor: C2.surface },
  icon: { fontSize: 28, lineHeight: 30, color: C2.ink2, fontWeight: '700' },
  progressBlock: { flex: 1, gap: 4, minWidth: 0 },
  stageLabel: { ...type2('caption'), color: C2.ink2, textAlign: 'right' },
  safeBadge: { minHeight: 32, paddingHorizontal: S2.md, borderRadius: R2.pill, justifyContent: 'center', backgroundColor: C2.primarySoft },
  safeBadgeText: { ...type2('caption'), color: C2.primaryDark },
  content: { flex: 1, paddingHorizontal: S2.lg },
  footer: { paddingHorizontal: S2.lg, paddingTop: S2.sm, paddingBottom: S2.lg, backgroundColor: C2.canvas },
  feedback: { borderRadius: R2.lg, borderWidth: 2, borderColor: C2.amber, backgroundColor: C2.amberSoft, padding: S2.md, gap: S2.md },
  feedbackSuccess: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  feedbackError: { borderColor: C2.danger, backgroundColor: C2.dangerSoft },
  feedbackRetry: { borderColor: C2.amber, backgroundColor: C2.amberSoft },
  feedbackRow: { flexDirection: 'row', gap: S2.md, alignItems: 'flex-start' },
  feedbackIcon: { width: 40, height: 40, borderRadius: R2.md, backgroundColor: C2.surface, alignItems: 'center', justifyContent: 'center' },
  feedbackIconSuccess: { borderColor: C2.primary, borderWidth: 1.5 },
  feedbackIconError: { borderColor: C2.danger, borderWidth: 1.5 },
  feedbackIconRetry: { borderColor: C2.amber, borderWidth: 1.5 },
  feedbackIconText: { fontSize: 20, fontWeight: '900', color: C2.ink },
  feedbackTitle: { ...type2('body'), fontWeight: '800', color: C2.ink },
  feedbackText: { marginTop: 2, ...type2('caption'), color: C2.ink2 },
  feedbackButton: { marginTop: S2.xs },
});
