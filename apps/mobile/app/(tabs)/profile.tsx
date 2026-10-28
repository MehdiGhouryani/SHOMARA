import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { Text } from '../../src/ui/AppText';
import { Button } from '../../src/ui/v2/core';
import { C2, R2, S2, type2 } from '../../src/ui/v2/tokens';
import { toFa } from '../../src/ui/digits';
import { MeView2, type AchievementRowItem, type ActionRowItem } from '../../src/profile/views2/MeView2';
import { useAppState } from '../../src/state/AppStateContext';
import { DEFAULT_CHILD_AVATAR_PRESET_ID, isStationPassed } from '../../src/state/appStateCore';
import { S } from '../../src/ui/strings.fa';

const achievementIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  A01: 'grid-outline',
  A02: 'compass-outline',
  A03: 'calculator-outline',
  A04: 'shapes-outline',
  A05: 'add-circle-outline',
};

const presetIcon: Record<string, React.ComponentProps<typeof Ionicons>['name']> = { sun: 'sunny', leaf: 'leaf', cloud: 'cloudy', moon: 'moon' };

/**
 * The «من» tab on UI V2 (playbook 14): identity card, chapter-free progress over the 25 stations and
 * the achievement rows. The action rows (تغییر ظاهر / والدین) are not on the page but the profile contract
 * requires them; they stay as derived rows (pinned in scripts/lib/tabs-waivers.mjs). The achievement detail
 * sheet (S18) keeps its behavior, restyled on tokens.v2.
 */
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
  const achievements: AchievementRowItem[] = CHILD_ACHIEVEMENTS.map((item) => {
    const unlocked = isAchievementUnlocked(item, completedStationIds);
    const stationNumber = G1_STATIONS.find((station) => station.id === item.stationId)?.number ?? 1;
    return {
      id: item.id,
      title: item.title,
      kicker: unlocked ? S.me.achievementDone : S.me.completeStation(toFa(stationNumber)),
      unlocked,
    };
  });
  const actions: ActionRowItem[] = [
    { id: 'avatar', title: S.me.changeLook, subtitle: S.me.changeLookSub, icon: 'person' },
    { id: 'parent', title: S.me.parents, subtitle: S.me.parentsSub, icon: 'people' },
  ];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CHILD_ACHIEVEMENTS.find((item) => item.id === selectedId) ?? null;
  const selectedUnlocked = selected ? isAchievementUnlocked(selected, completedStationIds) : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C2.canvas }} edges={['top']}>
      <MeView2
        settingsLabel={S.me.settingsA11y}
        onSettings={() => router.push('/settings')}
        avatarIcon={presetIcon[presetId] ?? 'sunny'}
        avatarLabel={name}
        name={name}
        gradeLabel={grade}
        progressLabel={S.me.stations(toFa(completedStationIds.length), toFa(G1_STATIONS.length))}
        progress={completedStationIds.length / G1_STATIONS.length}
        progressFieldLabel={S.me.progress}
        achievementsFieldLabel={S.me.achievements}
        achievementsA11y={`${S.me.progress}. ${S.me.achievementsA11y(toFa(unlockedCount), toFa(CHILD_ACHIEVEMENTS.length))}. پیشنهاد هر بار: ${sessionHint}`}
        achievements={achievements}
        actions={actions}
        onAchievement={(id) => setSelectedId(id)}
        onAction={(id) => {
          if (id === 'avatar') router.push('/avatar');
          if (id === 'parent') router.push('/parent');
        }}
      />

      {selected && (
        <View style={styles.modalBackdrop} accessibilityViewIsModal>
          <View style={styles.dialog} accessible accessibilityRole="alert">
            <View style={[styles.dialogIcon, selectedUnlocked ? styles.iconUnlocked : styles.iconLocked]}>
              <Ionicons
                name={achievementIcon[selected.id] ?? 'ribbon-outline'}
                size={density === 'MINIMAL' ? 28 : 32}
                color={selectedUnlocked ? C2.amberInk : C2.muted}
              />
            </View>
            <Text style={styles.dialogKicker}>{selectedUnlocked ? 'دستاورد تو' : 'هنوز نه'}</Text>
            <Text style={styles.dialogTitle}>{selected.title}</Text>
            <Text style={styles.dialogBody}>
              {selectedUnlocked
                ? selected.description
                : 'این دستاورد با تمام کردن ایستگاه‌های مسیر باز می‌شود.'}
            </Text>
            <View style={styles.dialogButton}>
              <Button label="بستن" onPress={() => setSelectedId(null)} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Functional modal scrim (not a surface color): keeps the dialog readable over any page.
  modalBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: S2.xl,
  },
  dialog: {
    borderRadius: R2.xl,
    backgroundColor: C2.surface,
    padding: S2.xl,
    alignItems: 'center',
    gap: S2.sm,
  },
  dialogIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  iconUnlocked: { backgroundColor: C2.amberSoft },
  iconLocked: { backgroundColor: C2.surfaceAlt },
  dialogKicker: { ...type2('caption'), color: C2.muted },
  dialogTitle: { ...type2('title'), color: C2.ink, textAlign: 'center' },
  dialogBody: { ...type2('body'), color: C2.ink2, textAlign: 'center' },
  dialogButton: { marginTop: S2.sm, width: '100%' },
});
