'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHILD_ACHIEVEMENTS, isAchievementUnlocked, PROFILE_SECONDARY_ACTIONS, achievementIconKind, stationPresentationById } from '@math/contracts';
import { toPersianDigits } from '../lib/persian';
import { ChildAvatar } from './ChildAvatar';
import styles from './ProfileView.module.css';

interface ProfileViewProps {
  childName: string;
  gradeTitle: string;
  avatarPresetId?: 'sun' | 'leaf' | 'cloud' | 'moon';
  completedStationIds?: string[];
}

function AchievementIcon({ achievementId, unlocked }: { achievementId: string; unlocked: boolean }) {
  const kind = achievementIconKind(achievementId);
  const common = { stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {kind === 'COUNT' && <><circle cx="9" cy="10" r="2.4" {...common} /><circle cx="16" cy="10" r="2.4" {...common} /><circle cx="23" cy="10" r="2.4" {...common} /><path d="M7 21c2.4-3.1 5.1-3.1 8 0 2.4-3.1 5.1-3.1 8 0" {...common} /></>}
      {kind === 'DIRECTION' && <><circle cx="16" cy="16" r="9" {...common} /><path d="m16 10 4 8-8 4 4-12Z" {...common} /></>}
      {kind === 'NUMBER' && <><path d="M11 9c3-2 8 .1 7.5 4-.3 2.7-3.4 3.9-5.3 5.8-1.2 1.2-1.7 2.4-2.2 4.2h9" {...common} /></>}
      {kind === 'SHAPE' && <><circle cx="10" cy="16" r="4" {...common} /><path d="m20 11 5 9h-10l5-9Z" {...common} /><rect x="8" y="7" width="4" height="4" rx=".8" {...common} /></>}
      {kind === 'CALCULATION' && <><rect x="9" y="7" width="14" height="18" rx="2.4" {...common} /><path d="M12 11h8M12 16h3m2 0h3M12 20h3m2 0h3" {...common} /></>}
    </svg>
  );
}

export function ProfileView({ childName, gradeTitle, avatarPresetId = 'sun', completedStationIds = [] }: ProfileViewProps) {
  const router = useRouter();
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const completed = new Set(completedStationIds);
  const unlockedCount = useMemo(() => CHILD_ACHIEVEMENTS.filter((item) => isAchievementUnlocked(item, completedStationIds)).length, [completedStationIds]);
  const selectedAchievement = CHILD_ACHIEVEMENTS.find((item) => item.id === selectedAchievementId) ?? null;
  const selectedUnlocked = selectedAchievement ? isAchievementUnlocked(selectedAchievement, completedStationIds) : false;

  return (
    <div dir="rtl" className={styles.root} data-screen-id="S19">
      <section className={styles.identity} aria-label="پروفایل کودک">
        <ChildAvatar presetId={avatarPresetId} name={childName} size={104} label={`آواتار ${childName}`} />
        <div className={styles.identityCopy}>
          <h1>{childName}</h1>
          <p>{gradeTitle.replace(' ابتدایی', '')}</p>
        </div>
      </section>

      <section className={styles.metrics} aria-label="پیشرفت">
        <div className={styles.metric}><strong>{toPersianDigits(completedStationIds.length)}</strong><span>ایستگاه کامل</span></div>
        <div className={styles.metric}><strong>{toPersianDigits(unlockedCount)}</strong><span>دستاورد</span></div>
      </section>

      <section className={styles.section} aria-labelledby="achievements-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="achievements-title">دستاوردها</h2>
            <p>{toPersianDigits(unlockedCount)} از {toPersianDigits(CHILD_ACHIEVEMENTS.length)} باز شده</p>
          </div>
        </div>

        <div className={styles.achievementGrid}>
          {CHILD_ACHIEVEMENTS.map((achievement) => {
            const unlocked = completed.has(achievement.stationId);
            return (
              <button
                key={achievement.id}
                type="button"
                className={`${styles.achievement} ${unlocked ? styles.unlocked : styles.locked}`}
                aria-label={`${achievement.title}، ${unlocked ? 'گرفته شده' : 'باز نشده'}`}
                onClick={() => setSelectedAchievementId(achievement.id)}
              >
                <span className={styles.achievementIcon}><AchievementIcon achievementId={achievement.id} unlocked={unlocked} /></span>
                <strong>{achievement.title}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.actions} aria-label="بخش‌های مرتبط">
        {PROFILE_SECONDARY_ACTIONS.map((action) => {
          const href = action.id === 'AVATAR' ? '/profile/avatar' : action.id === 'SETTINGS' ? '/settings' : '/parent';
          const description = action.id === 'AVATAR' ? 'آواتارت را انتخاب کن' : action.id === 'SETTINGS' ? 'صدا، حرکت و دسترس‌پذیری' : 'گزارش و تنظیمات بزرگسالان';
          return (
            <button key={action.id} type="button" className={styles.actionRow} onClick={() => router.push(href)}>
              <span className={styles.actionCopy}><strong>{action.label}</strong><small>{description}</small></span>
              <span className={styles.actionArrow} aria-hidden="true">←</span>
            </button>
          );
        })}
      </section>

      {selectedAchievement && (
        <div className={styles.dialogBackdrop} role="presentation" onMouseDown={() => setSelectedAchievementId(null)}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="achievement-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={`${styles.dialogIcon} ${selectedUnlocked ? styles.unlocked : styles.locked}`}>
              <AchievementIcon achievementId={selectedAchievement.id} unlocked={selectedUnlocked} />
            </div>
            <p className={styles.dialogKicker}>{selectedUnlocked ? 'دستاورد تو' : 'دستاورد بعدی'}</p>
            <h2 id="achievement-dialog-title">{selectedAchievement.title}</h2>
            <p>{selectedUnlocked ? `ایستگاه «${stationPresentationById(selectedAchievement.stationId)?.title ?? 'مسیر'}» را کامل کردی.` : selectedAchievement.description}</p>
            <button type="button" className={styles.dialogButton} onClick={() => setSelectedAchievementId(null)}>بستن</button>
          </section>
        </div>
      )}
    </div>
  );
}
