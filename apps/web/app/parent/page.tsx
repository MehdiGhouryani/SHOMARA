'use client';

import { useEffect, useState } from 'react';
import { AdultRouteShell } from '../../components/AdultRouteShell';
import { toPersianDigits } from '../../lib/persian';
import type { ParentReportProjection } from '@math/contracts';
import styles from '../../components/ParentReportView.module.css';

type SkillBucket = 'STRENGTH' | 'BUILDING' | 'NEEDS_REVIEW';

type ParentData = ParentReportProjection;


function bucketLabel(bucket: SkillBucket) {
  switch (bucket) {
    case 'NEEDS_REVIEW': return 'نیاز به مرور';
    case 'BUILDING': return 'در حال یادگیری';
    default: return 'تثبیت‌شده';
  }
}

function outcomeLabel(outcome: string) {
  switch (outcome) {
    case 'CORRECT': return 'درست';
    case 'RECOVERY': return 'با راهنمایی';
    case 'RECHECK': return 'مرور دوباره';
    default: return 'ثبت شد';
  }
}

export default function ParentHome() {
  const [reloadVersion, setReloadVersion] = useState(0);
  const [data, setData] = useState<ParentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    fetch('/api/v1/parent/today', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'گزارش والد در دسترس نیست.');
        return body as ParentData;
      })
      .then((result) => { if (!cancelled) setData(result); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'خطای بارگذاری گزارش'); });
    return () => { cancelled = true; };
  }, [reloadVersion]);
  if (error) {
    return (
      <AdultRouteShell title="گزارش کودک" subtitle="پیشرفت را ببینید و در خانه همراهی کنید.">
        <div className={styles.state} role="alert">
          <div className={styles.stateIcon}>!</div>
          <h2>گزارش فعلاً آماده نیست</h2>
          <p>{error}</p>
          <button type="button" className={styles.retry} onClick={() => setReloadVersion((value) => value + 1)}>تلاش دوباره</button>
        </div>
      </AdultRouteShell>
    );
  }

  if (!data) {
    return (
      <AdultRouteShell title="گزارش کودک" subtitle="پیشرفت را ببینید و در خانه همراهی کنید.">
        <div className={styles.state} role="status" aria-live="polite">
          <div className={styles.loader} />
          <h2>در حال آماده‌سازی گزارش</h2>
          <p>اطلاعات یادگیری واقعی در حال بارگذاری است.</p>
        </div>
      </AdultRouteShell>
    );
  }

  const focusSkill = data.skills.find((skill) => skill.bucket === 'NEEDS_REVIEW') ?? data.skills.find((skill) => skill.bucket === 'BUILDING') ?? null;

  return (
    <AdultRouteShell title={`امروز ${data.child.displayName} کجای مسیر است؟`} subtitle="گزارشی ساده از چیزی که واقعاً در مسیر یادگیری اتفاق افتاده است.">
      <div className={styles.content}>
        <section className={styles.heroGrid} aria-label="خلاصه امروز">
          <article className={styles.heroCard}>
            <span className={styles.label}>امروز</span>
            <strong>{toPersianDigits(data.today.encountersCompleted)}</strong>
            <span>جلسه یادگیری</span>
          </article>
          <article className={styles.heroCard}>
            <span className={styles.label}>نقطه فعلی</span>
            <strong>{data.progress.currentStation}</strong>
            <span>{data.progress.stationLabel}</span>
          </article>
        </section>

        <section className={styles.section} aria-labelledby="focus-title">
          <div className={styles.sectionHeader}>
            <div><span className={styles.kicker}>تمرکز فعلی</span><h2 id="focus-title">روی چه چیزی کار می‌کند؟</h2></div>
          </div>
          <div className={styles.focusCard}>
            <div className={styles.focusMark} aria-hidden="true">+</div>
            <div><strong>{focusSkill?.title ?? data.progress.stationLabel}</strong><p>{focusSkill ? bucketLabel(focusSkill.bucket) : 'در حال ادامه مسیر'}</p></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="skills-title">
          <div className={styles.sectionHeader}>
            <div><span className={styles.kicker}>نمای کلی</span><h2 id="skills-title">مهارت‌ها</h2></div>
          </div>
          <div className={styles.listCard}>
            {data.skills.slice(0, 4).map((skill, index) => (
              <div className={styles.row} key={skill.skillCode}>
                <span className={styles.rowIndex}>{toPersianDigits(index + 1)}</span>
                <span className={styles.rowTitle}>{skill.title}</span>
                <span className={`${styles.pill} ${styles[skill.bucket]}`}>{bucketLabel(skill.bucket)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="recent-title">
          <div className={styles.sectionHeader}><div><span className={styles.kicker}>شاهدهای اخیر</span><h2 id="recent-title">چند اتفاق اخیر</h2></div></div>
          <div className={styles.listCard}>
            {data.recentLearning.slice(0, 3).map((item, index) => (
              <div className={styles.activity} key={`${item.stationCode}-${index}`}>
                <span className={styles.activityDot} aria-hidden="true" />
                <div><strong>{item.summary}</strong><p>{item.stationCode} · {outcomeLabel(item.outcome)}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="next-title">
          <div className={styles.sectionHeader}><div><span className={styles.kicker}>قدم بعدی</span><h2 id="next-title">چه کار کنیم؟</h2></div></div>
          <div className={styles.nextCard}>
            <strong>{data.nextStep.title}</strong>
            <p>{data.nextStep.reason}</p>
          </div>
        </section>

        {data.simpleHomeActivity ? (
          <section className={styles.homeActivity} aria-label="یک فعالیت ساده در خانه">
            <span className={styles.kicker}>در خانه</span>
            <strong>{data.simpleHomeActivity.title}</strong>
            <p>{data.simpleHomeActivity.description}</p>
          </section>
        ) : null}
      </div>
    </AdultRouteShell>
  );
}
