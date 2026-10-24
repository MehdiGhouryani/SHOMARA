import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  PRACTICE_GAMES,
  canOpenPracticeStation,
  pickRecommendedPractice,
  practiceListLimit,
  practiceStartLabelFa,
  softDailyHabitForGrade,
} from '@math/contracts';
import { Text } from './AppText';
import { useAppState } from '../state/AppStateContext';
import { DS } from './design-system';
import { RN_SHADOW } from './design-system/theme';
import { toFa } from './digits';

function canonicalCompletedStationIds(ids: readonly string[]): string[] {
  const mapping: Record<string, string> = {
    'step-1': 'ST01', 'step-2': 'ST01', 'step-3': 'ST01', 'step-4': 'ST01', 'step-5': 'ST01',
    'step-6': 'ST01', 'step-7': 'ST01', 'step-8': 'ST01', 'step-9': 'ST01', 'step-10': 'ST01',
    'station-ST01': 'ST01', 'station-ST02': 'ST02', 'station-ST03': 'ST03', 'station-ST04': 'ST04', 'station-ST05': 'ST05',
  };
  return Array.from(new Set(ids.map((id) => mapping[id] ?? id).filter((id) => /^ST\d\d$/.test(id))));
}

export function PracticeHubScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const completedIds = useMemo(
    () => Object.entries(state?.progress ?? {}).filter(([, progress]) => progress.passed).map(([stationId]) => stationId),
    [state?.progress],
  );
  const completedStationIds = useMemo(() => canonicalCompletedStationIds(completedIds), [completedIds]);
  const gradeId = state?.profile?.gradeId;
  const recommended = useMemo(
    () => pickRecommendedPractice({ completedStationIds }),
    [completedStationIds],
  );
  const habit = softDailyHabitForGrade(gradeId);
  const listCap = practiceListLimit(gradeId);
  const startLabel = practiceStartLabelFa(gradeId);
  const visibleGames = PRACTICE_GAMES.filter((g) => g.id !== recommended.id).slice(0, Math.max(listCap - 1, 0));

  function openStation(stationId: string) {
    if (!canOpenPracticeStation(stationId, completedStationIds)) {
      router.push('/');
      return;
    }
    router.push(`/station/${stationId}/start?entry=practice`);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="بخش تمرین"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>تمرین</Text>
        <Text style={styles.title}>یک تمرین کوتاه</Text>
        <Text style={styles.habitLine}>{habit.goalFa}</Text>
        <Text style={styles.habitSoft}>{habit.reassuranceFa}</Text>
      </View>

      {/* Phase D — entire card is one tap */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${startLabel}. ${recommended.title}`}
        onPress={() => openStation(recommended.stationId)}
        style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
      >
        <Text style={styles.eyebrow}>پیشنهاد امروز · حدود {toFa(Math.min(recommended.durationMinutes, habit.minutesHint))} دقیقه</Text>
        <Text style={styles.featureTitle}>{recommended.title}</Text>
        <Text style={styles.cardSubtitle}>{recommended.subtitle}</Text>
        <View style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>{startLabel}</Text>
        </View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>بازی‌های دیگر</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="دیدن مسیر" onPress={() => router.push('/')} style={styles.linkButton}>
          <Text style={styles.linkText}>مسیر</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {visibleGames.map((game) => {
          const available = canOpenPracticeStation(game.stationId, completedStationIds);
          return (
            <Pressable
              key={game.id}
              accessibilityRole="button"
              disabled={!available}
              onPress={() => openStation(game.stationId)}
              style={({ pressed }) => [
                styles.card,
                !available && styles.disabledCard,
                pressed && available && styles.pressed,
              ]}
            >
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardSubtitle}>{game.subtitle}</Text>
                <Text style={styles.cardMeta}>{toFa(game.durationMinutes)} دقیقه · {available ? 'آماده' : 'اول در مسیر'}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: DS.space[4],
    paddingBottom: DS.space[12],
    gap: DS.space[4],
    backgroundColor: DS.color.bg.canvas,
  },
  header: { paddingVertical: DS.space[2], alignItems: 'flex-end' },
  kicker: {
    color: DS.color.text.muted,
    fontSize: DS.type.xs.fontSize,
    fontWeight: '700',
    textAlign: 'right',
  },
  title: {
    color: DS.color.text.primary,
    fontSize: DS.type.displaySm.fontSize,
    lineHeight: DS.type.displaySm.lineHeight,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'right',
  },
  habitLine: {
    color: DS.color.brand.primaryDark,
    fontSize: DS.type.sm.fontSize,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'right',
  },
  habitSoft: {
    color: DS.color.text.muted,
    fontSize: DS.type.xs.fontSize,
    marginTop: 4,
    textAlign: 'right',
  },
  featureCard: {
    minHeight: DS.size.touchPrimary,
    gap: DS.space[2],
    padding: DS.space[4],
    backgroundColor: DS.color.brand.primarySoft,
    borderRadius: DS.radius['2xl'],
    borderWidth: 2,
    borderColor: DS.color.brand.primary,
    alignItems: 'flex-end',
    ...RN_SHADOW.card,
  },
  eyebrow: {
    color: DS.color.brand.primaryDark,
    fontSize: DS.type.xs.fontSize,
    fontWeight: '800',
    textAlign: 'right',
  },
  featureTitle: {
    color: DS.color.text.primary,
    fontSize: DS.type.title.fontSize,
    lineHeight: DS.type.title.lineHeight,
    fontWeight: '900',
    textAlign: 'right',
  },
  card: {
    minHeight: DS.size.touchPrimary,
    gap: DS.space[2],
    padding: DS.space[4],
    backgroundColor: DS.color.bg.surface,
    borderRadius: DS.radius['2xl'],
    borderWidth: 1,
    borderColor: DS.color.border.subtle,
  },
  disabledCard: { opacity: 0.55 },
  cardCopy: { flex: 1, alignItems: 'flex-end' },
  cardTitle: {
    color: DS.color.text.primary,
    fontSize: DS.type.lg.fontSize,
    fontWeight: '800',
    textAlign: 'right',
  },
  cardSubtitle: {
    color: DS.color.text.secondary,
    fontSize: DS.type.sm.fontSize,
    lineHeight: DS.type.sm.lineHeight,
    marginTop: 3,
    textAlign: 'right',
  },
  cardMeta: {
    color: DS.color.text.muted,
    fontSize: DS.type.xs.fontSize,
    marginTop: 6,
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionHeading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DS.space[3],
    marginTop: DS.space[2],
  },
  sectionTitle: {
    color: DS.color.text.primary,
    fontSize: DS.type.title.fontSize,
    fontWeight: '800',
    textAlign: 'right',
  },
  linkButton: { minHeight: DS.size.touchMin, justifyContent: 'center', paddingHorizontal: DS.space[2] },
  linkText: { color: DS.color.brand.primary, fontSize: DS.type.sm.fontSize, fontWeight: '800' },
  list: { gap: DS.space[3] },
  primaryAction: {
    marginTop: DS.space[3],
    alignSelf: 'stretch',
    minHeight: DS.size.touchPrimary,
    borderRadius: DS.radius.xl,
    backgroundColor: DS.color.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DS.space[5],
  },
  primaryActionText: { color: DS.color.text.inverse, fontSize: DS.type.body.fontSize, fontWeight: '800' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
