'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHILD_AVATAR_PRESETS, type ChildAvatarPresetId } from '@math/contracts';
import { ChildAvatar } from './ChildAvatar';
import { UiButton, UiSurface } from './ui';
import styles from './AvatarWorkshopView.module.css';

interface AvatarWorkshopViewProps { childName: string; initialPreset: ChildAvatarPresetId; onSaved?: (presetId: ChildAvatarPresetId) => void; }

export function AvatarWorkshopView({ childName, initialPreset, onSaved }: AvatarWorkshopViewProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ChildAvatarPresetId>(initialPreset);
  const [saved, setSaved] = useState(false);
  const current = CHILD_AVATAR_PRESETS.find((item) => item.id === draft) ?? CHILD_AVATAR_PRESETS[0]!;

  const save = () => { onSaved?.(draft); setSaved(true); };

  return (
    <div dir="rtl" className={styles.root} data-screen-id="S20">
      <button type="button" className={styles.back} onClick={() => router.back()}>بازگشت به من</button>
      <header className={styles.header}>
        <p className={styles.kicker}>ظاهر من</p>
        <h1>آواتارت را انتخاب کن</h1>
      </header>
      <UiSurface elevated className={styles.preview}>
        <ChildAvatar presetId={draft} name={childName} size={132} label={`پیش‌نمایش آواتار ${childName}`} />
        <strong>{current.label}</strong>
        <p>هر وقت خواستی می‌توانی ظاهرش را عوض کنی.</p>
      </UiSurface>
      <section className={styles.choices} aria-label="انتخاب آواتار">
        {CHILD_AVATAR_PRESETS.map((preset) => (
          <button key={preset.id} type="button" className={`${styles.choice} ${draft === preset.id ? styles.selected : ''}`} aria-pressed={draft === preset.id} onClick={() => { setDraft(preset.id); setSaved(false); }}>
            <ChildAvatar presetId={preset.id} name={childName} size={76} />
            <span>{preset.label}</span>
          </button>
        ))}
      </section>
      <div className={styles.actions}>
        <UiButton variant="primary" onClick={save}>{saved ? 'ذخیره شد' : 'ذخیره'}</UiButton>
        <UiButton variant="ghost" onClick={() => router.back()}>لغو</UiButton>
      </div>
    </div>
  );
}
