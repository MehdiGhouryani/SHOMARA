import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { G1_STATIONS, PRACTICE_GAMES, canOpenPracticeStation, pickRecommendedPractice, practiceListLimit, practiceStartLabelFa, softDailyHabitForGrade } from '@math/contracts';
import { toFa } from './digits';
import { S } from './strings.fa';
import { PracticeView, type PracticeRowItem } from '../practice/views/PracticeView';
import { useAppState } from '../state/AppStateContext';

function canonicalCompletedStationIds(ids: readonly string[]): string[] {
  const mapping: Record<string, string> = {
    'step-1': 'ST01', 'step-2': 'ST01', 'step-3': 'ST01', 'step-4': 'ST01', 'step-5': 'ST01',
    'step-6': 'ST01', 'step-7': 'ST01', 'step-8': 'ST01', 'step-9': 'ST01', 'step-10': 'ST01',
    'station-ST01': 'ST01', 'station-ST02': 'ST02', 'station-ST03': 'ST03', 'station-ST04': 'ST04', 'station-ST05': 'ST05',
  };
  return Array.from(new Set(ids.map((id) => mapping[id] ?? id).filter((id) => /^ST\d\d$/.test(id))));
}

function stationNumberOf(stationId: string): number {
  return G1_STATIONS.find((station) => station.id === stationId)?.number ?? 1;
}

/**
 * The practice tab on UI v1 (page 13, ADR-0035): Fandogh's guide, the short-game rows from the practice
 * contract and one primary action. The habit line and the one-tap recommendation card the old screen drew
 * are not on the approved page (waived in scripts/lib/tabs-waivers.mjs).
 */
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
  // practiceListLimit counts the SECONDARY rows (contract); the recommended row comes on top of it.
  const others = PRACTICE_GAMES.filter((g) => g.id !== recommended.id).slice(0, Math.max(listCap, 0));
  const rows: PracticeRowItem[] = [recommended, ...others].map((game) => {
    const locked = !canOpenPracticeStation(game.stationId, completedStationIds);
    return {
      id: game.id,
      title: game.title,
      kicker: locked
        ? S.practice.opensAfter(toFa(Math.max(stationNumberOf(game.stationId) - 1, 0)))
        : S.practice.questions(toFa(Math.max(game.contentIds.length, 1))),
      icon: locked ? 'lock' : 'bolt',
      locked,
    };
  });

  function openStation(stationId: string) {
    if (!canOpenPracticeStation(stationId, completedStationIds)) {
      router.push('/');
      return;
    }
    router.push(`/station/${stationId}/start?entry=practice`);
  }

  return (
    <PracticeView
      title={S.practice.title}
      guideLabel={S.practice.guideA11y}
      guideText={S.practice.guide}
      rows={rows}
      chipLabel={S.practice.title}
      startLabel={startLabel}
      onStart={() => openStation(recommended.stationId)}
    />
  );
}
