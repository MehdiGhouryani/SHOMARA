'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JUMP_ASSESSMENTS, JUMP_PASS_THRESHOLD, jumpAssessmentForTarget } from '@math/contracts';
import { toPersianDigits } from '../lib/persian';
import { UiButton, UiSurface } from './ui';
import styles from './JumpAssessmentView.module.css';

const STORAGE_KEY = 'math_app_jump_unlocked_station_ids';

type Result = { passed: boolean; correctCount: number; totalCount: number; targetStationId: string; targetUnitId: string };

function saveUnlock(stationId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    const next = Array.from(new Set([...(Array.isArray(ids) ? ids.map(String) : []), stationId]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* cache only; server result remains the source of truth */ }
}

export function JumpAssessmentView({ targetStationId }: { targetStationId: string }) {
  const router = useRouter();
  const assessment = useMemo(() => jumpAssessmentForTarget(targetStationId), [targetStationId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setIndex(0); setAnswers({}); setResult(null); setError(''); }, [assessment?.id]);

  if (!assessment) {
    return <div dir="rtl" className={styles.root}><UiSurface elevated className={styles.card}><h1>این پرش آماده نیست</h1><p>برای این نقطه هنوز ارزیابی معتبر تعریف نشده است.</p><UiButton variant="primary" onClick={() => router.push('/')}>برگشت به مسیر</UiButton></UiSurface></div>;
  }

  // `assessment` is narrowed here, but TS does not carry narrowing into the hoisted `choose` declaration below.
  const activeAssessment = assessment;
  const question = activeAssessment.questions[index]!;
  const selected = answers[question.id];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / assessment.questions.length) * 100);

  async function choose(optionIndex: number) {
    if (busy || result) return;
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);
    if (index + 1 < activeAssessment.questions.length) {
      window.setTimeout(() => setIndex((value) => value + 1), 160);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/v1/progression/jump', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ assessmentId: activeAssessment.id, answers: next }),
      });
      const payload = await response.json() as Result & { code?: string };
      if (!response.ok) throw new Error(payload.code ?? 'JUMP_FAILED');
      setResult(payload);
      if (payload.passed) saveUnlock(payload.targetStationId);
    } catch {
      setError('نتیجه ارزیابی ثبت نشد. دوباره امتحان کن.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir="rtl" className={styles.root} data-screen-id="S13">
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => router.back()} aria-label="بازگشت">←</button>
        <div><span className={styles.kicker}>پرش به مسیر جلوتر</span><h1>{assessment.title}</h1><p>{assessment.intro}</p></div>
      </header>

      {!result ? (
        <UiSurface elevated className={styles.questionCard}>
          <div className={styles.progressRow}><span>سؤال {toPersianDigits(index + 1)} از {toPersianDigits(assessment.questions.length)}</span><span>{toPersianDigits(progress)}٪</span></div>
          <div className={styles.progressTrack}><span style={{ width: `${Math.max(progress, 20)}%` }} /></div>
          <h2>{question.prompt}</h2>
          <div className={styles.options}>
            {question.options.map((option, optionIndex) => (
              <button key={optionIndex} type="button" className={`${styles.option} ${selected === optionIndex ? styles.optionSelected : ''}`} onClick={() => choose(optionIndex)} disabled={busy}>{option}</button>
            ))}
          </div>
          <p className={styles.targetHint}>با ۴ پاسخ درست، ایستگاه بعدی باز می‌شود.</p>
          {error && <div role="alert" className={styles.error}>{error}</div>}
        </UiSurface>
      ) : (
        <UiSurface elevated className={`${styles.resultCard} ${result.passed ? styles.resultPass : styles.resultRetry}`}>
          <div className={styles.resultIcon} aria-hidden="true">{result.passed ? '✓' : '↺'}</div>
          <span className={styles.kicker}>{result.passed ? 'پرش باز شد' : 'هنوز آماده پرش نیستی'}</span>
          <h2>{result.correctCount} از {result.totalCount} پاسخ درست</h2>
          <p>{result.passed ? 'ایستگاه هدف در مسیرت باز شد. می‌توانی از همین‌جا ادامه بدهی.' : 'چند تمرین دیگر انجام بده و بعد دوباره این پرش را امتحان کن.'}</p>
          <div className={styles.actions}>
            {result.passed ? <UiButton variant="primary" onClick={() => router.push(`/station/${result.targetStationId}/start?entry=jump`)}>رفتن به ایستگاه</UiButton> : <UiButton variant="primary" onClick={() => router.push('/')}>ادامه مسیر معمولی</UiButton>}
            <UiButton variant="outline" onClick={() => router.push('/')}>برگشت به مسیر</UiButton>
          </div>
        </UiSurface>
      )}
    </div>
  );
}

export const AVAILABLE_JUMP_COUNT = JUMP_ASSESSMENTS.length;
export const JUMP_THRESHOLD_LABEL = `${Math.round(JUMP_PASS_THRESHOLD * 100)}٪`;
