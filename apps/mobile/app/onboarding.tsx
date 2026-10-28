import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../src/state/AppStateContext';
import { requestOtp, verifyOtp } from '../src/auth/authApi';
import { Button, ProgressBar } from '../src/ui/v2/core';
import { OptionTile } from '../src/ui/v2/lesson';
import { ClaySurface } from '../src/ui/v2/clay';
import { Character } from '../src/ui/v2/Character';
import { TextLink2 } from '../src/ui/v2/forms';
import { GuideBubble2, StepBar2 } from '../src/ui/v2/shell';
import { C2, R2, S2, type2 } from '../src/ui/v2/tokens';
import { prepareGradeContent } from '../src/content/bootstrap';
import { isLocalContentPreview } from '../src/config/runtime';
import {
  isValidIranMobileInput,
  maskIranMobile,
  normalizeIranMobileInput,
  toIranE164,
} from '../src/auth/phone';
import { Text } from '../src/ui/AppText';
import { toFa } from '../src/ui/digits';
import { CHILD_AVATAR_PRESETS, CURRENT_ONBOARDING_GRADE_IDS, GRADES_FOR_ONBOARDING } from '../src/onboarding/catalog';
import { stepBack, stepProgress } from '../src/onboarding/steps';
import { CodeView2 } from '../src/onboarding/views2/CodeView2';
import { PhoneView2 } from '../src/onboarding/views2/PhoneView2';
import { ProfileView2 } from '../src/onboarding/views2/ProfileView2';
import { WelcomeView2 } from '../src/onboarding/views2/WelcomeView2';
import {
  PLACEMENT_ITEMS,
  isValidChildAlias,
  isValidOtp,
  normalizeDigits,
  scorePlacement,
  type ChildAvatarPresetId,
  type OnboardingStep,
} from '@math/contracts';

/** Consent line: not in the approved welcome page, but tapping "start" records the consent timestamp. */
const LEGAL_LINE = 'با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیری.';

export default function Onboarding() {
  const router = useRouter();
  const { entry, completeOnboarding } = useAppState();
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [gradeId, setGradeId] = useState<string>(CURRENT_ONBOARDING_GRADE_IDS[0] ?? 'G1');
  const [name, setName] = useState('');
  const [avatarPresetId, setAvatarPresetId] = useState<ChildAvatarPresetId>('sun');
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<string | undefined>>([undefined, undefined]);
  const [placementIndex, setPlacementIndex] = useState(-1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const finishingRef = useRef(false);
  const placementScore = scorePlacement(answers);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const previous = stepBack(step);
      if (!previous) return false;
      setError('');
      setStep(previous);
      return true;
    });
    return () => subscription.remove();
  }, [step]);

  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const timer = setInterval(() => setPhoneCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [phoneCooldown]);

  useEffect(() => {
    if (step !== 'SYNC_LOADING' || finishingRef.current) return;
    finishingRef.current = true;
    void finish().finally(() => {
      finishingRef.current = false;
    });
  }, [step]);

  if (entry.kind === 'RETURNING') return <Redirect href="/(tabs)" />;

  const progress = stepProgress(step);
  const canSubmitName = isValidChildAlias(name);

  function next(nextStep: OnboardingStep) {
    setError('');
    setStep(nextStep);
  }

  function begin() {
    setTermsAcceptedAt(new Date().toISOString());
    // D-019: the preview APK has no server, so the phone-OTP step cannot run there.
    // Every release profile with a configured URL (and production always) keeps the OTP wall.
    next(isLocalContentPreview() ? 'CHILD' : 'AUTH');
  }

  function goBack() {
    const previous = stepBack(step);
    if (previous) {
      // D-019: in the local-content preview the AUTH/OTP steps are never visited;
      // back from CHILD returns to the welcome page instead of the phone step.
      if (isLocalContentPreview() && (previous === 'AUTH' || previous === 'OTP')) {
        setError('');
        setStep('WELCOME');
        return;
      }
      setError('');
      setStep(previous);
    }
  }

  async function submitPhone() {
    const localPhone = normalizeIranMobileInput(phone);
    if (!isValidIranMobileInput(localPhone)) {
      setError('شماره همراه را به شکل ۱۰ رقمی وارد کن.');
      return;
    }
    const normalizedPhone = toIranE164(localPhone);
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await requestOtp(normalizedPhone);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? 'ارسال کد ورود انجام نشد.');
      return;
    }
    setPhone(normalizedPhone);
    setPhoneCooldown(60);
    next('OTP');
  }

  async function submitOtp() {
    if (!isValidOtp(otp)) {
      setError('کد ورود باید دقیقاً ۶ رقم باشد.');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await verifyOtp(phone, normalizeDigits(otp));
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? 'تأیید کد ورود انجام نشد.');
      return;
    }
    setOtp('');
    // Grade is chosen on the profile page (the approved pages merge GRADE into CHILD).
    next('CHILD');
  }

  function continueChild() {
    if (!canSubmitName) {
      setError('یک اسم یا نام مستعار کوتاه وارد کن.');
      return;
    }
    setAnswers([undefined, undefined]);
    // Start at the first question. (It used to be -1, which rendered a blank page with no way forward.)
    setPlacementIndex(0);
    next('PLACEMENT');
  }

  function answerPlacement(value: string) {
    if (placementIndex < 0) return;
    const nextAnswers = [...answers];
    nextAnswers[placementIndex] = value;
    setAnswers(nextAnswers);
    if (placementIndex + 1 < PLACEMENT_ITEMS.length) {
      setPlacementIndex(placementIndex + 1);
      return;
    }
    next('RESULT');
  }

  function skipPlacement() {
    setPlacementIndex(-1);
    next('SYNC_LOADING');
  }

  async function finish() {
    if (busy || !termsAcceptedAt || !canSubmitName) return;
    setBusy(true);
    setError('');
    try {
      // The first path node must be backed by a real cached content package.
      // This is not cosmetic loading: it establishes the offline-ready starting point.
      // D-019: the preview APK has no server to prepare content from; onboarding
      // completes on local state only and the path screen says so honestly.
      if (!isLocalContentPreview()) await prepareGradeContent(gradeId);
      const ok = await completeOnboarding(
        {
          childName: name.trim(),
          gradeId,
          consentAt: termsAcceptedAt,
          avatarPresetId,
        },
        placementScore.fastTrack,
      );
      if (ok) {
        router.replace('/(tabs)');
        return;
      }
      setError('ذخیره پروفایل انجام نشد. دوباره تلاش کنیم؟');
    } catch {
      setError('آماده‌سازی مسیر انجام نشد. اتصال را بررسی کن و دوباره تلاش کنیم؟');
    } finally {
      setBusy(false);
    }
  }

  const designed = step === 'WELCOME' || step === 'AUTH' || step === 'OTP' || step === 'CHILD' || step === 'GRADE';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 'WELCOME' && <WelcomeView2 onStart={begin} legal={LEGAL_LINE} />}

        {step === 'AUTH' && (
          <PhoneView2
            phone={normalizeIranMobileInput(phone)}
            error={error}
            busy={busy}
            canSubmit={!busy && isValidIranMobileInput(phone)}
            progress={progress}
            onChangePhone={(value) => {
              setError('');
              setPhone(normalizeIranMobileInput(value));
            }}
            onSubmit={submitPhone}
            onBack={goBack}
          />
        )}

        {step === 'OTP' && (
          <CodeView2
            maskedPhone={toFa(maskIranMobile(phone))}
            code={otp}
            error={error}
            busy={busy}
            canSubmit={!busy && isValidOtp(otp)}
            cooldown={phoneCooldown}
            progress={progress}
            onChangeCode={(value) => {
              setError('');
              setOtp(normalizeDigits(value).replace(/\D/g, '').slice(0, 6));
            }}
            onSubmit={submitOtp}
            onResend={submitPhone}
            onChangeNumber={() => {
              setOtp('');
              setError('');
              setStep('AUTH');
            }}
            onBack={goBack}
          />
        )}

        {(step === 'CHILD' || step === 'GRADE') && (
          <ProfileView2
            name={name}
            error={error}
            avatarId={avatarPresetId}
            gradeId={gradeId}
            avatars={CHILD_AVATAR_PRESETS.map(({ id, label, accent }) => ({ id, label, accent }))}
            grades={GRADES_FOR_ONBOARDING.map((grade) => ({
              id: grade.id,
              available: CURRENT_ONBOARDING_GRADE_IDS.includes(grade.id as (typeof CURRENT_ONBOARDING_GRADE_IDS)[number]),
            }))}
            canSubmit={canSubmitName}
            progress={progress}
            onChangeName={(value) => {
              setError('');
              setName(value.slice(0, 20));
            }}
            onSelectAvatar={setAvatarPresetId}
            onSelectGrade={setGradeId}
            onSubmit={continueChild}
            onBack={goBack}
          />
        )}

        {!designed && (
          // Placement, result and sync follow the playbook system contracts (pages 10/11/16):
          // the math objective leads, feedback stays warm, loading is honest and recoverable.
          <View style={styles.flex}>
            <StepBar2 percent={progress.percent} label={progress.label} onBack={step === 'SYNC_LOADING' ? undefined : goBack} />
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 'PLACEMENT' && placementIndex >= 0 && (
            <View style={styles.pageScreen}>
              <View style={styles.assessmentHeader}>
                <Text style={styles.kicker}>یک شروع کوتاه</Text>
                <Text style={styles.title}>ببینیم از کجا راحت‌تری</Text>
                <Text style={styles.subtitle}>این چند سؤال فقط کمک می‌کنند نقطه شروع مناسب‌تری پیدا کنیم.</Text>
              </View>

              <View style={styles.questionProgressRow}>
                <Text style={styles.questionCount}>سؤال {toFa(placementIndex + 1)} از {toFa(PLACEMENT_ITEMS.length)}</Text>
                <ProgressBar ratio={(placementIndex + 1) / PLACEMENT_ITEMS.length} accessibilityLabel="پیشرفت جایابی" />
              </View>

              <ClaySurface style={styles.questionCard}>
                <Text style={styles.questionTitle}>{PLACEMENT_ITEMS[placementIndex]!.prompt}</Text>
                <View style={styles.display}>
                  <Text style={styles.displayText}>{PLACEMENT_ITEMS[placementIndex]!.display}</Text>
                </View>
                <View style={styles.choiceGrid}>
                  {PLACEMENT_ITEMS[placementIndex]!.options.map((option) => (
                    <OptionTile key={option} label={option} selected={false} onPress={() => answerPlacement(option)} />
                  ))}
                </View>
              </ClaySurface>

              <TextLink2 label="فعلاً رد می‌کنم" onPress={skipPlacement} />
            </View>
          )}

          {step === 'RESULT' && (
            <View style={styles.center}>
              <GuideBubble2
                characterId="main"
                emotion={placementScore.fastTrack ? 'celebrate' : 'idle'}
                characterLabel="شخصیت اصلی"
                text={placementScore.fastTrack ? 'می‌توانیم سریع‌تر وارد تمرین مستقل شویم.' : 'از پایه شروع می‌کنیم و هر وقت آماده بودی جلوتر می‌رویم.'}
              />
              <View style={styles.resultBadge}>
                <Ionicons name="sparkles" size={18} color={C2.amberInk} />
                <Text style={styles.resultBadgeText}>{placementScore.fastTrack ? 'شروع سریع' : 'شروع مطمئن'}</Text>
              </View>
              <Text style={styles.title}>نقطه شروع تو آماده است</Text>
              <Text style={styles.subtitle}>این نتیجه فقط یک پیشنهاد برای شروع است؛ هیچ امتیاز یا پاداشی به آن وصل نیست.</Text>
              <View style={styles.ctaSpace}>
                <Button label="ورود به یادگیری" onPress={() => next('SYNC_LOADING')} />
              </View>
            </View>
          )}

          {step === 'SYNC_LOADING' && (
            <View style={styles.center}>
              <View style={styles.syncCharacter}>
                <Character characterId="main" emotion="guide" size={124} accessibilityLabel="شخصیت اصلی" />
              </View>
              <Text style={styles.kicker}>یک لحظه</Text>
              <Text style={styles.title}>مسیرت را آماده می‌کنیم</Text>
              <Text style={styles.subtitle}>پروفایل و شروع یادگیری ذخیره می‌شود…</Text>
              <ActivityIndicator size="large" color={C2.primary} style={styles.loader} />
              {error ? (
                <View style={styles.saveErrorBox}>
                  <Text style={styles.error}>{error}</Text>
                  <Button label="دوباره تلاش کن" onPress={finish} disabled={busy} variant="amber" />
                </View>
              ) : null}
            </View>
          )}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C2.canvas },
  flex: { flex: 1 },
  container: { paddingHorizontal: S2.xl, paddingTop: S2.lg, paddingBottom: S2.xxxl, gap: S2.xxl, flexGrow: 1 },

  kicker: { ...type2('caption'), color: C2.muted, textAlign: 'center' },
  title: { ...type2('title'), fontSize: 28, lineHeight: 40, color: C2.ink, textAlign: 'center' },
  subtitle: { ...type2('body'), color: C2.ink2, textAlign: 'center' },

  pageScreen: { flexGrow: 1, gap: S2.xl, paddingBottom: S2.sm },

  assessmentHeader: { alignItems: 'center', gap: S2.sm, paddingTop: S2.sm },
  questionProgressRow: { gap: S2.sm },
  questionCount: { ...type2('caption'), color: C2.muted, textAlign: 'right' },
  questionCard: { gap: S2.lg, width: '100%' },
  questionTitle: { ...type2('title'), color: C2.ink, textAlign: 'center' },
  display: { minHeight: 96, borderRadius: R2.lg, backgroundColor: C2.surfaceAlt, alignItems: 'center', justifyContent: 'center', padding: S2.lg, borderWidth: 1.5, borderColor: C2.line },
  displayText: { ...type2('title'), color: C2.ink, textAlign: 'center' },
  choiceGrid: { gap: S2.sm },

  center: { flexGrow: 1, minHeight: 600, justifyContent: 'center', alignItems: 'center', gap: S2.lg, paddingVertical: S2.xxl },
  ctaSpace: { width: '100%', marginTop: S2.sm },
  resultBadge: { minHeight: 40, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: S2.lg, borderRadius: R2.pill, backgroundColor: C2.amberSoft },
  resultBadgeText: { ...type2('caption'), color: C2.amberInk },
  syncCharacter: { width: 150, height: 150, borderRadius: 75, backgroundColor: C2.amberSoft, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 4 },
  saveErrorBox: { width: '100%', gap: S2.sm, alignItems: 'center' },
  error: { ...type2('caption'), color: C2.danger, textAlign: 'center' },
});
