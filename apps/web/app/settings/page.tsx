'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChildRouteShell } from '../../components/ChildRouteShell';
import styles from '../../components/SettingsView.module.css';

interface SettingsState { sound: boolean; motion: boolean; largeText: boolean; }
const STORAGE_KEY = 'math_app_child_settings_v2';
const LEGACY_STORAGE_KEY = 'math_app_child_settings_v1';
const DEFAULTS: SettingsState = { sound: true, motion: true, largeText: false };

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<SettingsState>) });
    } catch { setSettings(DEFAULTS); }
  }, []);
  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* best effort */ }
      return next;
    });
  }
  return (
    <ChildRouteShell activeTab="PROFILE">
      <div dir="rtl" className={styles.root} data-screen-id="S21">
        <header className={styles.header}>
          <Link className={styles.back} href="/?tab=profile" aria-label="بازگشت به من">←</Link>
          <div><p className={styles.kicker}>من</p><h1>تنظیمات</h1></div>
        </header>

        <section className={styles.section} aria-labelledby="experience-title">
          <h2 id="experience-title">تجربه یادگیری</h2>
          <div className={styles.list}>
            <SettingRow title="صدا" description="بازخوردهای صوتی درس" value={settings.sound} onChange={(v) => update('sound', v)} />
            <SettingRow title="حرکت و انیمیشن" description="حرکت‌های کوتاه داخل مسیر و درس" value={settings.motion} onChange={(v) => update('motion', v)} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="accessibility-title">
          <h2 id="accessibility-title">دسترس‌پذیری</h2>
          <div className={styles.list}>
            <SettingRow title="متن بزرگ‌تر" description="خواندن راحت‌تر متن‌ها" value={settings.largeText} onChange={(v) => update('largeText', v)} />
          </div>
        </section>

        <p className={styles.footerNote}>تنظیمات فقط تجربه این دستگاه را تغییر می‌دهند.</p>
      </div>
    </ChildRouteShell>
  );
}

function SettingRow({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className={styles.row}>
      <button type="button" role="switch" aria-checked={value} className={`${styles.switch} ${value ? styles.switchOn : ''}`} onClick={() => onChange(!value)} aria-label={`${title}: ${value ? 'روشن' : 'خاموش'}`}>
        <span />
      </button>
      <div className={styles.copy}><strong>{title}</strong><span>{description}</span></div>
    </div>
  );
}
