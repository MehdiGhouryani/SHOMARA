'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CharacterArt } from './CharacterArt';
import { ChildAvatar } from './ChildAvatar';
import { requestOtp, verifyOtp } from '../lib/auth-provider';
import {
  CHILD_AVATAR_PRESETS,
  CURRENT_ONBOARDING_GRADE_IDS,
  ONBOARDING_GRADE_OPTIONS,
  PLACEMENT_ITEMS,
  isValidChildAlias,
  isValidOtp,
  isValidPhone,
  normalizeDigits,
  scorePlacement,
  type AuthMethod,
  type ChildAvatarPresetId,
  type OnboardingStep,
} from '@math/contracts';
import styles from './OnboardingFlow.module.css';

export type AuthFlowStep = OnboardingStep;

interface AuthFlowScreenProps {
  onCompleteAuth: (userData: {
    phoneNumber?: string;
    authMethod: AuthMethod;
    gradeId: string;
    characterId: string;
    childName: string;
    avatarPresetId: ChildAvatarPresetId;
    consentAt: string;
  }) => void;
  onClose?: () => void;
  initialStep?: AuthFlowStep;
}

const STORAGE_KEY = 'math_app_onboarding_v2';

interface Draft {
  phoneNumber: string;
  otpCode: string;
  authMethod: AuthMethod;
  gradeId: string;
  childName: string;
  avatarPresetId: ChildAvatarPresetId;
  consentAt: string | null;
  answers: Array<string | undefined>;
}

const EMPTY_DRAFT: Draft = {
  phoneNumber: '',
  otpCode: '',
  authMethod: 'MOBILE',
  gradeId: CURRENT_ONBOARDING_GRADE_IDS[0] ?? 'G1',
  childName: '',
  avatarPresetId: 'sun',
  consentAt: null,
  answers: [undefined, undefined],
};

const STEP_LABELS: Partial<Record<AuthFlowStep, string>> = {
  WELCOME: 'ریاضی دانا',
  AUTH: 'ورود با شماره',
  OTP: 'تأیید ورود',
  GRADE: 'پایه',
  CHILD: 'ساخت پروفایل',
  PLACEMENT: 'نقطه شروع',
};

function loadDraft(): Draft {
  if (typeof window === 'undefined') return EMPTY_DRAFT;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    const value = JSON.parse(raw) as Partial<Draft>;
    return {
      ...EMPTY_DRAFT,
      ...value,
      answers: Array.isArray(value.answers) ? [value.answers[0], value.answers[1]] : EMPTY_DRAFT.answers,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function AuthFlowScreen({ onCompleteAuth, onClose, initialStep = 'WELCOME' }: AuthFlowScreenProps) {
  const [step, setStep] = useState<AuthFlowStep>(initialStep);
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [otpTimer, setOtpTimer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [syncProgress, setSyncProgress] = useState(10);
  const [placementIndex, setPlacementIndex] = useState(() => initialStep === 'PLACEMENT' ? 0 : -1);
  const [placementCorrect, setPlacementCorrect] = useState(0);
  const completionRef = useRef(false);

  const selectedGrade = useMemo(
    () => ONBOARDING_GRADE_OPTIONS.find((grade) => grade.id === draft.gradeId) ?? ONBOARDING_GRADE_OPTIONS[0]!,
    [draft.gradeId],
  );
  const progress = useMemo(() => {
    const order: AuthFlowStep[] = ['WELCOME', 'AUTH', 'OTP', 'GRADE', 'CHILD', 'PLACEMENT', 'RESULT'];
    const index = Math.max(0, order.indexOf(step));
    return Math.round(((index + 1) / order.length) * 100);
  }, [step]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (step === 'SYNC_LOADING' || step === 'RESULT') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Session state is best-effort; child data is only durably committed after auth and onboarding complete.
    }
  }, [draft, step]);

  useEffect(() => {
    if (!otpTimer) return;
    const timer = window.setInterval(() => setOtpTimer((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [otpTimer]);

  useEffect(() => {
    if (step !== 'SYNC_LOADING') return;
    completionRef.current = false;
    setSyncProgress(10);
    const timer = window.setInterval(() => setSyncProgress((value) => Math.min(100, value + 18)), 280);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'SYNC_LOADING' || syncProgress < 100 || completionRef.current) return;
    completionRef.current = true;
    const timer = window.setTimeout(() => {
      if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
      onCompleteAuth({
        phoneNumber: draft.phoneNumber || undefined,
        authMethod: draft.authMethod,
        gradeId: draft.gradeId,
        characterId: 'aria',
        childName: draft.childName.trim(),
        avatarPresetId: draft.avatarPresetId,
        consentAt: draft.consentAt!,
      });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [draft, onCompleteAuth, step, syncProgress]);

  const updateDraft = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const go = (next: AuthFlowStep) => {
    setError('');
    setStep(next);
  };

  async function handleSendOtp() {
    const phone = normalizeDigits(draft.phoneNumber);
    if (!isValidPhone(phone)) {
      setError('شماره همراه را با فرمت معتبر وارد کنید.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await requestOtp(phone);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    updateDraft({ phoneNumber: phone });
    setOtpTimer(60);
    go('OTP');
  }

  async function handleVerifyOtp() {
    if (!isValidOtp(draft.otpCode)) {
      setError('کد ورود باید دقیقاً ۶ رقم باشد.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await verifyOtp(draft.phoneNumber, normalizeDigits(draft.otpCode));
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    updateDraft({ authMethod: 'MOBILE' });
    go('GRADE');
  }

  function handlePlacementAnswer(answer: string) {
    const item = PLACEMENT_ITEMS[placementIndex]!;
    const answers = [...draft.answers];
    answers[placementIndex] = answer;
    const scored = scorePlacement(answers);
    updateDraft({ answers });
    setPlacementCorrect(scored.correct);
    if (placementIndex + 1 < PLACEMENT_ITEMS.length) setPlacementIndex(placementIndex + 1);
    else {
      go('RESULT');
    }
  }

  function startPlacement() {
    setPlacementCorrect(0);
    setPlacementIndex(0);
    setError('');
    go('PLACEMENT');
  }

  function skipPlacement() {
    updateDraft({ answers: [undefined, undefined] });
    setPlacementIndex(-1);
    setPlacementCorrect(0);
    go('SYNC_LOADING');
  }

  function finish() {
    if (busy || !draft.consentAt || !isValidChildAlias(draft.childName)) {
      setError('یک نام یا نام مستعار ۱ تا ۲۰ کاراکتری وارد کنید.');
      return;
    }
    setError('');
    setStep('SYNC_LOADING');
  }

  const heading = STEP_LABELS[step] ?? 'ریاضی دانا';

  return (
    <div className={styles.shell} dir="rtl">
      <div className={styles.panel}>
        <header className={styles.header} aria-label="نوار پیشرفت ثبت‌نام">
          {onClose ? (
            <button type="button" className={styles.iconButton} aria-label="بستن" onClick={onClose}>×</button>
          ) : <span />}
          <div>
            <div className={styles.brand}>{heading}</div>
            {step !== 'SYNC_LOADING' && <div className={styles.progress} aria-label={`پیشرفت ${progress} درصد`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>}
          </div>
          <span />
        </header>

        <main className={styles.main}>
          {step === 'WELCOME' && (
            <section className={styles.center} aria-labelledby="welcome-title">
              <div className={styles.hero}><CharacterArt id="aria" state="idle" size={150} label="آریا" reducedMotion /></div>
              <p className={styles.eyebrow}>ریاضی دانا</p>
              <h1 id="welcome-title" className={styles.title}>یادگیری ریاضی، قدم‌به‌قدم و باحال</h1>
              <p className={styles.subtitle}>با شماره همراه شروع می‌کنیم، بعد مسیر مناسب تو را می‌سازیم.</p>
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => { updateDraft({ consentAt: new Date().toISOString(), authMethod: 'MOBILE' }); go('AUTH'); }}>بزن بریم</button>
              </div>
            </section>
          )}

          {step === 'AUTH' && (
            <section className={styles.card} aria-labelledby="auth-title">
              <div className={styles.center}>
                <p className={styles.eyebrow}>شروع</p>
                <h1 id="auth-title" className={styles.title}>ورود با شماره همراه</h1>
                <p className={styles.subtitle}>برای ادامه، شماره همراهت را وارد کن.</p>
              </div>

              <div className={styles.form} style={{ marginTop: 20 }}>
                <label className={styles.label} htmlFor="phone-number">شماره همراه
                  <input id="phone-number" className={`${styles.textInput} ${styles.numericInput}`} inputMode="tel" autoComplete="tel" dir="ltr" value={draft.phoneNumber} onChange={(event) => updateDraft({ phoneNumber: event.target.value })} placeholder="مثلاً +989121234567" />
                </label>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <button type="button" className={styles.primary} onClick={handleSendOtp} disabled={busy}>{busy ? 'در حال بررسی…' : 'ارسال کد ورود'}</button>
              </div>
              
            </section>
          )}

          {step === 'OTP' && (
            <section className={styles.card} aria-labelledby="otp-title">
              <div className={styles.center}>
                <p className={styles.eyebrow}>ورود</p>
                <h1 id="otp-title" className={styles.title}>کد ورود را وارد کنید</h1>
                <p className={styles.subtitle}>کد ارسال‌شده برای شماره <span dir="ltr">{draft.phoneNumber}</span> را وارد کنید.</p>
              </div>
              <div className={styles.form} style={{ marginTop: 20 }}>
                <label className={styles.label} htmlFor="otp-code">کد ۶ رقمی
                  <input id="otp-code" className={`${styles.textInput} ${styles.numericInput}`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} dir="ltr" value={draft.otpCode} onChange={(event) => updateDraft({ otpCode: normalizeDigits(event.target.value).replace(/\D/g, '').slice(0, 6) })} />
                </label>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <button type="button" className={styles.primary} onClick={handleVerifyOtp} disabled={busy || !isValidOtp(draft.otpCode)}>{busy ? 'در حال تأیید…' : 'تأیید کد'}</button>
                <button type="button" className={styles.secondary} onClick={() => go('AUTH')}>تغییر شماره</button>
                <button type="button" className={styles.linkButton} onClick={handleSendOtp} disabled={busy || otpTimer > 0}>{otpTimer > 0 ? `ارسال دوباره تا ${otpTimer} ثانیه` : 'ارسال دوباره کد'}</button>
              </div>
            </section>
          )}
          {step === 'GRADE' && (
            <section className={styles.card} aria-labelledby="grade-title">
              <div className={styles.center}>
                <p className={styles.eyebrow}>انتخاب</p>
                <h1 id="grade-title" className={styles.title}>از کدام پایه شروع کنیم؟</h1>
                <p className={styles.subtitle}>پایه‌ای را انتخاب کنید که مسیر یادگیری از آن شروع شود.</p>
              </div>
              <div className={styles.gradeGrid} style={{ marginTop: 20 }}>
                {ONBOARDING_GRADE_OPTIONS.map((grade) => {
                  const available = grade.available;
                  const selected = draft.gradeId === grade.id;
                  return (
                    <button key={grade.id} type="button" className={`${styles.grade} ${selected ? styles.gradeSelected : ''} ${!available ? styles.gradeDisabled : ''}`} disabled={!available} aria-pressed={selected} onClick={() => updateDraft({ gradeId: grade.id })}>
                      <span className={styles.gradeTitle}>{grade.title}</span>
                      <span className={styles.gradeMeta}>{available ? grade.subtitle : 'به‌زودی'}</span>
                    </button>
                  );
                })}
              </div>
              {error && <div className={styles.error} role="alert">{error}</div>}
              <div className={styles.actions} style={{ marginTop: 18 }}>
                <button type="button" className={styles.primary} onClick={() => go('CHILD')}>ادامه</button>
              </div>
            </section>
          )}

          {step === 'CHILD' && (
            <section className={styles.card} aria-labelledby="child-title">
              <div className={styles.center}>
                <p className={styles.eyebrow}>پروفایل</p>
                <h1 id="child-title" className={styles.title}>پروفایل کودک را بسازیم</h1>
                <p className={styles.subtitle}>اسم کوچک یا یک نام مستعار کافی است؛ اطلاعات اضافی لازم نیست.</p>
              </div>
              <div className={styles.avatarPreview}><ChildAvatar presetId={draft.avatarPresetId} name={draft.childName} size={96} label={`پیش‌نمایش آواتار، ${draft.childName || 'بدون نام'}`} /></div>
              <div className={styles.form}>
                <label className={styles.label} htmlFor="child-name">نام یا نام مستعار
                  <input id="child-name" className={styles.textInput} maxLength={20} autoComplete="off" value={draft.childName} onChange={(event) => updateDraft({ childName: event.target.value })} placeholder="مثلاً نیما" />
                </label>
                <div className={styles.avatarGrid} aria-label="انتخاب آواتار">
                  {CHILD_AVATAR_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className={`${styles.avatarChoice} ${draft.avatarPresetId === preset.id ? styles.avatarSelected : ''}`} aria-pressed={draft.avatarPresetId === preset.id} onClick={() => updateDraft({ avatarPresetId: preset.id })}>
                      <ChildAvatar presetId={preset.id} name={draft.childName} size={64} />
                      <span className={styles.avatarLabel}>{preset.label}</span>
                    </button>
                  ))}
                </div>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <button type="button" className={styles.primary} onClick={() => isValidChildAlias(draft.childName) ? startPlacement() : setError('یک نام یا نام مستعار ۱ تا ۲۰ کاراکتری وارد کنید.')}>ادامه به جایابی</button>
              </div>
            </section>
          )}

          {step === 'PLACEMENT' && placementIndex >= 0 && (
            <section className={styles.card} aria-labelledby="placement-question">
              <div className={styles.questionNumber}>سؤال {placementIndex + 1} از {PLACEMENT_ITEMS.length}</div>
              <h1 id="placement-question" className={styles.title} style={{ textAlign: 'center', marginTop: 8 }}>{PLACEMENT_ITEMS[placementIndex]!.prompt}</h1>
              <div className={styles.questionDisplay}>{PLACEMENT_ITEMS[placementIndex]!.display}</div>
              <div className={styles.choiceGrid} style={{ marginTop: 14 }}>
                {PLACEMENT_ITEMS[placementIndex]!.options.map((option) => <button key={option} type="button" className={styles.choice} onClick={() => handlePlacementAnswer(option)}>{option}</button>)}
              </div>
            </section>
          )}

          {step === 'RESULT' && (
            <section className={`${styles.card} ${styles.center}`} aria-labelledby="result-title">
              <div className={styles.hero}><CharacterArt id={placementCorrect === PLACEMENT_ITEMS.length ? 'jiko' : 'aria'} state={placementCorrect === PLACEMENT_ITEMS.length ? 'celebrate' : 'encourage'} size={120} label="راهنما" reducedMotion /></div>
              <p className={styles.eyebrow}>نقطه شروع</p>
              <h1 id="result-title" className={styles.title}>نقطه شروع تو مشخص شد</h1>
              <p className={styles.subtitle}>{placementCorrect === PLACEMENT_ITEMS.length ? 'می‌توانیم سریع‌تر وارد تمرین مستقل شویم.' : 'از پایه شروع می‌کنیم و هرجا لازم باشد بیشتر تمرین می‌کنیم.'} این نتیجه فقط یک پیشنهاد برای شروع است.</p>
              <div className={styles.actions} style={{ marginTop: 16 }}>
                <button type="button" className={styles.primary} onClick={() => setStep('SYNC_LOADING')}>ورود به یادگیری</button>
              </div>
            </section>
          )}

          {step === 'SYNC_LOADING' && (
            <section className={styles.sync} aria-live="polite">
              <CharacterArt id="aria" state="idle" size={120} label="آریا" reducedMotion />
              <h1 className={styles.title}>داریم ماجراجویی تو را آماده می‌کنیم</h1>
              <div className={styles.syncTrack}>
                <div className={styles.progress} role="progressbar" aria-label="آماده‌سازی" aria-valuemin={0} aria-valuemax={100} aria-valuenow={syncProgress}><div className={styles.progressFill} style={{ width: `${syncProgress}%` }} /></div>
              </div>
              <p className={styles.syncMessage}>{syncProgress < 40 ? `مسیر ${selectedGrade.title} را آماده می‌کنیم.` : syncProgress < 80 ? 'پروفایل و آواتار را ثبت می‌کنیم.' : 'تقریباً آماده‌ای.'}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
