'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PRACTICE_GAMES, canOpenPracticeStation } from '@math/contracts';
import { UiButton, UiSurface } from './ui';
import styles from './PracticeHubView.module.css';
import { toPersianDigits } from '../lib/persian';

interface PracticeHubViewProps {
  completedNodeIds?: string[];
  onGoPath?: () => void;
}

function canonicalCompletedStationIds(ids: readonly string[]): string[] {
  const mapping: Record<string, string> = {
    'step-1': 'ST01', 'step-2': 'ST01', 'step-3': 'ST01', 'step-4': 'ST01', 'step-5': 'ST01',
    'step-6': 'ST01', 'step-7': 'ST01', 'step-8': 'ST01', 'step-9': 'ST01', 'step-10': 'ST01',
    'station-ST01': 'ST01', 'station-ST02': 'ST02', 'station-ST03': 'ST03', 'station-ST04': 'ST04', 'station-ST05': 'ST05',
  };
  return Array.from(new Set(ids.map((id) => mapping[id] ?? id).filter((id) => /^ST\d\d$/.test(id))));
}

export function PracticeHubView({ completedNodeIds = [], onGoPath }: PracticeHubViewProps) {
  const router = useRouter();
  const completedStationIds = useMemo(() => canonicalCompletedStationIds(completedNodeIds), [completedNodeIds]);
  const currentGame = PRACTICE_GAMES.find((game) => canOpenPracticeStation(game.stationId, completedStationIds)) ?? PRACTICE_GAMES[0]!;
  const availableGames = PRACTICE_GAMES.filter((game) => canOpenPracticeStation(game.stationId, completedStationIds));

  const openPractice = (stationId: string) => {
    if (!canOpenPracticeStation(stationId, completedStationIds)) {
      onGoPath?.();
      if (!onGoPath) router.push('/');
      return;
    }
    router.push(`/station/${stationId}/start?entry=practice`);
  };

  return (
    <div dir="rtl" className={styles.root} data-screen-id="S14">
      <header className={styles.header}>
        <p className={styles.kicker}>تمرین</p>
        <h1 className={styles.title}>یک تمرین کوتاه انتخاب کن</h1>
      </header>

      <section aria-labelledby="recommended-practice" className={styles.featureSection}>
        <UiSurface elevated className={styles.featureCard}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>پیشنهاد امروز</span>
            <h2 id="recommended-practice" className={styles.featureTitle}>{currentGame.title}</h2>
            <p className={styles.cardSubtitle}>{currentGame.subtitle}</p>
            <p className={styles.meta}>{toPersianDigits(currentGame.durationMinutes)} دقیقه</p>
          </div>
          <UiButton variant="primary" onClick={() => openPractice(currentGame.stationId)}>شروع</UiButton>
        </UiSurface>
      </section>

      <section aria-labelledby="practice-games" className={styles.content}>
        <div className={styles.sectionHeading}>
          <h2 id="practice-games" className={styles.sectionTitle}>بازی‌های کوتاه</h2>
          <button type="button" className={styles.pathLink} onClick={() => { onGoPath?.(); if (!onGoPath) router.push('/'); }}>دیدن مسیر</button>
        </div>

        <div className={styles.list}>
          {PRACTICE_GAMES.map((game) => {
            const available = availableGames.some((item) => item.id === game.id);
            return (
              <UiSurface key={game.id} className={styles.card}>
                <div className={styles.copy}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <p className={styles.cardSubtitle}>{game.subtitle}</p>
                  <p className={styles.meta}>{toPersianDigits(game.durationMinutes)} دقیقه</p>
                </div>
                <UiButton variant={available ? 'outline' : 'ghost'} disabled={!available} onClick={() => openPractice(game.stationId)}>
                  {available ? 'شروع' : 'در مسیر'}
                </UiButton>
              </UiSurface>
            );
          })}
        </div>
      </section>
    </div>
  );
}
