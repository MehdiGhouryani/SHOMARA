import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  CHILD_ACHIEVEMENTS,
  G1_STATIONS,
  isAchievementUnlocked,
  ONBOARDING_GRADE_OPTIONS,
  profileActionDensity,
  sessionLengthHintFa,
} from '@math/contracts';
import { ChildAvatar } from '../../src/components/ChildAvatar';
import { Text } from '../../src/ui/AppText';
import { DS } from '../../src/ui/design-system';
import { toFa } from '../../src/ui/digits';
import { useAppState } from '../../src/state/AppStateContext';
import { DEFAULT_CHILD_AVATAR_PRESET_ID, isStationPassed } from '../../src/state/appStateCore';

const achievementIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  A01: 'grid-outline',
  A02: 'compass-outline',
  A03: 'calculator-outline',
  A04: 'shapes-outline',
  A05: 'add-circle-outline',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const name = state?.profile.childName ?? 'دوست ریاضی';
  const gradeId = state?.profile.gradeId;
  const grade =
    ONBOARDING_GRADE_OPTIONS.find((g) => g.id === gradeId)?.title ?? 'پایه اول ابتدایی';
  const sessionHint = sessionLengthHintFa(gradeId);
  const density = profileActionDensity(gradeId);
  const presetId = state?.profile.avatarPresetId ?? DEFAULT_CHILD_AVATAR_PRESET_ID;
  const completedStationIds = useMemo(
    () => G1_STATIONS.filter((station) => isStationPassed(state, station.id)).map((station) => station.id),
    [state],
  );
  const unlockedCount = CHILD_ACHIEVEMENTS.filter((item) =>
    isAchievementUnlocked(item, completedStationIds),
  ).length;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CHILD_ACHIEVEMENTS.find((item) => item.id === selectedId) ?? null;
  const selectedUnlocked = selected ? isAchievementUnlocked(selected, completedStationIds) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <ChildAvatar presetId={presetId} name={name} size={density === 'MINIMAL' ? 112 : 104} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.grade}>{grade}</Text>
          <Text style={styles.sessionHint}>پیشنهاد هر بار: {sessionHint}</Text>
        </View>

        <View style={styles.metrics} accessibilityLabel="پیشرفت یادگیری">
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{toFa(completedStationIds.length)}</Text>
            <Text style={styles.metricLabel}>ایستگاه کامل</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{toFa(unlockedCount)}</Text>
            <Text style={styles.metricLabel}>دستاورد واقعی</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>دستاوردها</Text>
            <Text style={styles.sectionMeta}>
              {toFa(unlockedCount)} از {toFa(CHILD_ACHIEVEMENTS.length)} · فقط با تمام کردن ایستگاه
            </Text>
          </View>
        </View>
        <View style={styles.achievementGrid} accessibilityLabel="مجموعه دستاوردها">
          {CHILD_ACHIEVEMENTS.map((achievement) => {
            const unlocked = isAchievementUnlocked(achievement, completedStationIds);
            return (
              <Pressable
                key={achievement.id}
                accessibilityRole="button"
                accessibilityLabel={`${achievement.title}، ${unlocked ? 'گرفته شده' : 'باز نشده'}`}
                onPress={() => setSelectedId(achievement.id)}
                style={[styles.achievement, unlocked ? styles.achievementUnlocked : styles.achievementLocked]}
              >
                <View style={[styles.iconCircle, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
                  <Ionicons
                    name={achievementIcon[achievement.id] ?? 'ribbon-outline'}
                    size={28}
                    color={unlocked ? DS.color.brand.secondaryDark : DS.color.text.muted}
                  />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/avatar')}>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>تغییر ظاهر</Text>
              <Text style={styles.actionSub}>با پیشرفت مسیر باز می‌شود</Text>
            </View>
            <Ionicons name="chevron-back" size={22} color={DS.color.text.muted} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/settings')}>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>تنظیمات</Text>
              <Text style={styles.actionSub}>صدا و یادآور ملایم</Text>
            </View>
            <Ionicons name="chevron-back" size={22} color={DS.color.text.muted} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.actionRow} onPress={() => router.push('/parent')}>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>والدین</Text>
              <Text style={styles.actionSub}>گزارش ساده پیشرفت</Text>
            </View>
            <Ionicons name="chevron-back" size={22} color={DS.color.text.muted} />
          </Pressable>
        </View>
      </ScrollView>

      {selected && (
        <View style={styles.modalBackdrop} accessibilityViewIsModal>
          <View style={styles.dialog} accessible accessibilityRole="alert">
            <View style={[styles.dialogIcon, selectedUnlocked ? styles.iconUnlocked : styles.iconLocked]}>
              <Ionicons
                name={achievementIcon[selected.id] ?? 'ribbon-outline'}
                size={32}
                color={selectedUnlocked ? DS.color.brand.secondaryDark : DS.color.text.muted}
              />
            </View>
            <Text style={styles.dialogKicker}>{selectedUnlocked ? 'دستاورد تو' : 'هنوز نه'}</Text>
            <Text style={styles.dialogTitle}>{selected.title}</Text>
            <Text style={styles.dialogBody}>
              {selectedUnlocked
                ? selected.description
                : 'این دستاورد با تمام کردن ایستگاه‌های مسیر باز می‌شود.'}
            </Text>
            <Pressable accessibilityRole="button" style={styles.dialogButton} onPress={() => setSelectedId(null)}>
              <Text style={styles.dialogButtonText}>بستن</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], paddingBottom: DS.space[12], gap: DS.space[4] },
  identity: { alignItems: 'center', gap: 4 },
  name: {
    color: DS.color.text.primary,
    fontSize: DS.type.displaySm.fontSize,
    lineHeight: DS.type.displaySm.lineHeight,
    fontWeight: '900',
    marginTop: 4,
  },
  grade: { color: DS.color.text.muted, fontSize: DS.type.sm.fontSize, fontWeight: '700' },
  sessionHint: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '600', marginTop: 2 },
  metrics: { flexDirection: 'row-reverse', gap: DS.space[2], marginTop: DS.space[3] },
  metric: {
    flex: 1,
    minHeight: 74,
    borderRadius: DS.radius.xl,
    backgroundColor: DS.color.bg.surface,
    borderWidth: 1,
    borderColor: DS.color.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: { color: DS.color.text.primary, fontSize: DS.type.title.fontSize, fontWeight: '900' },
  metricLabel: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '700', marginTop: 2 },
  sectionHeader: { marginTop: DS.space[2], alignItems: 'flex-end' },
  sectionTitle: { color: DS.color.text.primary, fontSize: DS.type.title.fontSize, fontWeight: '900', textAlign: 'right' },
  sectionMeta: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  achievementGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: DS.space[2] },
  achievement: {
    width: '30%',
    minWidth: 96,
    minHeight: DS.size.touchPrimary,
    flexGrow: 1,
    padding: DS.space[3],
    borderRadius: DS.radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  achievementUnlocked: { backgroundColor: DS.color.brand.secondarySoft, borderColor: DS.color.brand.secondary },
  achievementLocked: { backgroundColor: DS.color.bg.surface, borderColor: DS.color.border.subtle, opacity: 0.85 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconUnlocked: { backgroundColor: DS.color.bg.surface },
  iconLocked: { backgroundColor: DS.color.state.disabledSoft },
  achievementTitle: { color: DS.color.text.primary, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  actions: { gap: DS.space[2], marginTop: DS.space[2] },
  actionRow: {
    minHeight: 64,
    paddingHorizontal: DS.space[3],
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: DS.radius.xl,
    backgroundColor: DS.color.bg.surface,
    borderWidth: 1,
    borderColor: DS.color.border.subtle,
  },
  actionCopy: { flex: 1, alignItems: 'flex-end' },
  actionTitle: { color: DS.color.text.primary, fontSize: DS.type.sm.fontSize, fontWeight: '900', textAlign: 'right' },
  actionSub: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, marginTop: 2, textAlign: 'right' },
  modalBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, // absoluteFillObject was removed from newer React Native
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: DS.space[4],
  },
  dialog: {
    borderRadius: DS.radius['2xl'],
    backgroundColor: DS.color.bg.surface,
    padding: DS.space[5],
    alignItems: 'center',
    gap: DS.space[2],
  },
  dialogIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  dialogKicker: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '800' },
  dialogTitle: { color: DS.color.text.primary, fontSize: DS.type.title.fontSize, fontWeight: '900', textAlign: 'center' },
  dialogBody: { color: DS.color.text.secondary, fontSize: DS.type.sm.fontSize, textAlign: 'center', lineHeight: 22 },
  dialogButton: {
    marginTop: DS.space[2],
    minHeight: DS.size.touchMin,
    paddingHorizontal: DS.space[5],
    borderRadius: DS.radius.lg,
    backgroundColor: DS.color.brand.primary,
    justifyContent: 'center',
  },
  dialogButtonText: { color: DS.color.text.inverse, fontWeight: '900' },
});
