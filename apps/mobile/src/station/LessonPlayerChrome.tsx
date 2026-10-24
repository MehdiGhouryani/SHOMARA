import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { DS, RN_SHADOW } from '../ui/design-system/theme';
import { ProgressFill } from '../game-feel';
import { DSButton, DSSurface } from '../ui/design-system/components';
import { LESSON_STAGE_META, type LessonFeedbackState, type LessonStage } from '@math/contracts';
import { S } from '../ui/strings.fa';

function CloseIcon() {
  return <Text style={styles.icon} accessibilityElementsHidden>×</Text>;
}

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
    <DSSurface elevated style={[styles.feedback, positive ? styles.feedbackSuccess : null, danger ? styles.feedbackError : null]}>
      <View style={styles.feedbackRow}>
        <View style={styles.feedbackIcon}><Text style={styles.feedbackIconText}>{positive ? '✓' : danger ? '!' : '↺'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.feedbackTitle}>{title}</Text>
          {text ? <Text style={styles.feedbackText}>{text}</Text> : null}
        </View>
      </View>
      <DSButton variant={positive ? 'success' : 'primary'} onPress={onAction} disabled={disabled} style={styles.feedbackButton}>{actionLabel}</DSButton>
    </DSSurface>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.color.bg.canvas },
  header: { minHeight: 72, paddingHorizontal: DS.space[4], paddingVertical: DS.space[2], flexDirection: 'row', alignItems: 'center', gap: DS.space[3], backgroundColor: DS.color.bg.surface, borderBottomWidth: 1, borderBottomColor: DS.color.border.subtle },
  close: { width: DS.size.touchMin, height: DS.size.touchMin, borderRadius: DS.radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: DS.color.border.default, backgroundColor: DS.color.bg.surface },
  icon: { fontSize: 28, lineHeight: 30, color: DS.color.text.secondary, fontWeight: '700' },
  progressBlock: { flex: 1, gap: 4 },
  stageLabel: { textAlign: 'right', fontSize: DS.type.xs.fontSize, lineHeight: DS.type.xs.lineHeight, color: DS.color.text.secondary, fontWeight: '700' },
  safeBadge: { minHeight: 32, paddingHorizontal: DS.space[3], borderRadius: DS.radius.full, justifyContent: 'center', backgroundColor: DS.color.brand.emeraldSoft },
  safeBadgeText: { color: DS.color.brand.emeraldDark, fontSize: DS.type.xs.fontSize, fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: DS.space[4] },
  footer: { paddingHorizontal: DS.space[4], paddingTop: DS.space[2], paddingBottom: DS.space[4], backgroundColor: DS.color.bg.canvas },
  feedback: { padding: DS.space[3] },
  feedbackSuccess: { borderColor: DS.color.brand.emerald, backgroundColor: DS.color.brand.emeraldSoft },
  feedbackError: { borderColor: DS.color.state.error, backgroundColor: DS.color.state.errorSoft },
  feedbackRow: { flexDirection: 'row', gap: DS.space[3], alignItems: 'flex-start' },
  feedbackIcon: { width: 40, height: 40, borderRadius: DS.radius.lg, backgroundColor: DS.color.bg.surface, alignItems: 'center', justifyContent: 'center' },
  feedbackIconText: { fontSize: 20, fontWeight: '900', color: DS.color.text.primary },
  feedbackTitle: { fontSize: DS.type.bodyStrong.fontSize, lineHeight: DS.type.bodyStrong.lineHeight, fontWeight: '800', color: DS.color.text.primary },
  feedbackText: { marginTop: 2, fontSize: DS.type.sm.fontSize, lineHeight: DS.type.sm.lineHeight, color: DS.color.text.secondary },
  feedbackButton: { marginTop: DS.space[3], ...RN_SHADOW.tactile },
});
