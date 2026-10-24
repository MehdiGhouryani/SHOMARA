'use client';

import type { ContentManifest } from '@math/contracts';
import { UiButton, UiSurface } from './ui';
import styles from './StationStartView.module.css';

export interface StationStartViewProps {
  number: number;
  title: string;
  subtitle: string;
  minutes: number;
  cached: boolean;
  manifestState: 'loading' | 'ready' | 'error';
  downloadState: 'idle' | 'downloading' | 'ready' | 'error';
  packageRef: ContentManifest['current'][number] | null;
  onBack: () => void;
  onPrepare: () => void;
  onStart: () => void;
}

export function StationStartView({ number, title, subtitle, minutes, cached, manifestState, downloadState, packageRef, onBack, onPrepare, onStart }: StationStartViewProps) {
  return (
    <div dir="rtl" className={styles.root} data-screen-id="S09">
      <div className={styles.wrap}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="بازگشت به مسیر">مسیر</button>
        <UiSurface elevated className={styles.card}>
          <p className={styles.eyebrow}>ایستگاه {number}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.meta}>{minutes} دقیقه</p>
          <p className={styles.summary}>{subtitle}</p>
          <div className={`${styles.status} ${cached ? styles.statusReady : ''}`}>
            <span className={styles.statusLabel}>وضعیت محتوا</span>
            <strong className={`${styles.statusValue} ${cached ? styles.readyText : styles.pendingText}`}>{cached ? 'آماده شروع' : 'هنوز آماده نیست'}</strong>
          </div>
          {manifestState === 'loading' && <p className={styles.info} role="status">در حال آماده‌سازی محیط یادگیری…</p>}
          {manifestState === 'error' && <div className={styles.error} role="alert">محتوای این ایستگاه دریافت نشد. اتصال را بررسی کن و دوباره تلاش کن.</div>}
          {downloadState === 'error' && <div className={styles.error} role="alert">آماده‌سازی این ایستگاه کامل نشد. دوباره تلاش کن.</div>}
          {downloadState === 'ready' && <div className={styles.success} role="status">ایستگاه آماده شد.</div>}
          <div className={styles.actions}>
            {!cached && <UiButton fullWidth variant="secondary" disabled={manifestState !== 'ready' || downloadState === 'downloading' || !packageRef} onClick={onPrepare}>{downloadState === 'downloading' ? 'در حال آماده‌سازی…' : 'آماده‌سازی'}</UiButton>}
            <UiButton fullWidth variant="primary" disabled={!cached} onClick={onStart}>{cached ? 'شروع ایستگاه' : 'ابتدا آماده‌سازی'}</UiButton>
          </div>
        </UiSurface>
      </div>
    </div>
  );
}
