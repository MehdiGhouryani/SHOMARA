import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../src/state/AppStateContext';
import { DS } from '../src/ui/design-system/theme';
import { requestOtp, verifyOtp } from '../src/auth/authApi';
import { DSButton, DSProgress, DSSurface } from '../src/ui/design-system/components';
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
import { CodeView } from '../src/onboarding/views/CodeView';
import { PhoneView } from '../src/onboarding/views/PhoneView';
import { ProfileView } from '../src/onboarding/views/ProfileView';
import { WelcomeView } from '../src/onboarding/views/WelcomeView';
import { Character, GuideBubble, ProgressBar, TopBar } from '../src/ui/v1';
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
        {step === 'WELCOME' && <WelcomeView onStart={begin} legal={LEGAL_LINE} />}

        {step === 'AUTH' && (
          <PhoneView
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
          <CodeView
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
          <ProfileView
            name={name}
            error={error}
            avatarId={avatarPresetId}
            gradeId={gradeId}
            avatars={CHILD_AVATAR_PRESETS.map(({ id, label }) => ({ id, label }))}
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
          // Placement, result and sync have no approved page yet: they keep their content and logic and
          // share the new top bar. Their bodies are restyled by the new tokens only.
          <View style={styles.flex}>
            <TopBar action={step === 'SYNC_LOADING' ? undefined : { icon: 'chevronBack', label: 'برگشت', onPress: goBack }}>
              <ProgressBar value={progress.percent / 100} label={progress.label} />
            </TopBar>
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
                <DSProgress value={((placementIndex + 1) / PLACEMENT_ITEMS.length) * 100} label="پیشرفت جایابی" />
              </View>

              <DSSurface elevated style={styles.questionCard}>
                <Text style={styles.questionTitle}>{PLACEMENT_ITEMS[placementIndex]!.prompt}</Text>
                <View style={styles.display}>
                  <Text style={styles.displayText}>{PLACEMENT_ITEMS[placementIndex]!.display}</Text>
                </View>
                <View style={styles.choiceGrid}>
                  {PLACEMENT_ITEMS[placementIndex]!.options.map((option) => (
                    <DSButton key={option} variant="outline" onPress={() => answerPlacement(option)}>
                      {option}
                    </DSButton>
                  ))}
                </View>
              </DSSurface>

              <Pressable accessibilityRole="button" onPress={skipPlacement} style={styles.skipButton}>
                <Text style={styles.link}>فعلاً رد می‌کنم</Text>
              </Pressable>
            </View>
          )}

          {step === 'RESULT' && (
            <View style={styles.center}>
              <GuideBubble
                pose={placementScore.fastTrack ? 'main-celebrate' : 'main-front'}
                portraitLabel="شخصیت اصلی"
                tone="main"
                text={placementScore.fastTrack ? 'می‌توانیم سریع‌تر وارد تمرین مستقل شویم.' : 'از پایه شروع می‌کنیم و هر وقت آماده بودی جلوتر می‌رویم.'}
              />
              <View style={styles.resultBadge}>
                <Ionicons name="sparkles" size={20} color={DS.color.brand.secondaryDark} />
                <Text style={styles.resultBadgeText}>{placementScore.fastTrack ? 'شروع سریع' : 'شروع مطمئن'}</Text>
              </View>
              <Text style={styles.title}>نقطه شروع تو آماده است</Text>
              <Text style={styles.subtitle}>این نتیجه فقط یک پیشنهاد برای شروع است؛ هیچ امتیاز یا پاداشی به آن وصل نیست.</Text>
              <DSButton onPress={() => next('SYNC_LOADING')}>ورود به یادگیری</DSButton>
            </View>
          )}

          {step === 'SYNC_LOADING' && (
            <View style={styles.center}>
              <View style={styles.syncCharacter}>
                <Character pose="main-wave" height={124} label="شخصیت اصلی" />
              </View>
              <Text style={styles.kicker}>یک لحظه</Text>
              <Text style={styles.title}>مسیرت را آماده می‌کنیم</Text>
              <Text style={styles.subtitle}>پروفایل و شروع یادگیری ذخیره می‌شود…</Text>
              <ActivityIndicator size="large" color={DS.color.brand.primary} style={styles.loader} />
              {error ? (
                <View style={styles.saveErrorBox}>
                  <Text style={styles.error}>{error}</Text>
                  <DSButton onPress={finish} disabled={busy} variant="outline">دوباره تلاش کن</DSButton>
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
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, gap: 24, flexGrow: 1 },

  kicker: { textAlign: 'center', fontSize: 13, color: DS.color.text.muted, fontWeight: '800' },
  title: { fontSize: 28, lineHeight: 40, color: DS.color.text.primary, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 28, color: DS.color.text.secondary, fontWeight: '500', textAlign: 'center' },
  link: { textAlign: 'center', color: DS.color.text.link, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline', paddingVertical: 8 },

  pageScreen: { flexGrow: 1, gap: 20, paddingBottom: 8 },

  assessmentHeader: { alignItems: 'center', gap: 8, paddingTop: 8 },
  questionProgressRow: { gap: 8 },
  questionCount: { textAlign: 'right', fontSize: 12, color: DS.color.text.muted, fontWeight: '800' },
  questionCard: { gap: 18 },
  questionTitle: { color: DS.color.text.primary, fontSize: 22, lineHeight: 32, fontWeight: '900', textAlign: 'center' },
  display: { minHeight: 96, borderRadius: 20, backgroundColor: DS.color.bg.subtle, alignItems: 'center', justifyContent: 'center', padding: 18, borderWidth: 1, borderColor: DS.color.border.subtle },
  displayText: { fontSize: 22, lineHeight: 34, fontWeight: '900', color: DS.color.text.primary, textAlign: 'center' },
  choiceGrid: { gap: 10 },
  skipButton: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },

  center: { flexGrow: 1, minHeight: 600, justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 28 },
  resultBadge: { minHeight: 40, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: DS.radius.full, backgroundColor: DS.color.brand.secondarySoft },
  resultBadgeText: { color: DS.color.brand.secondaryDark, fontSize: 12, fontWeight: '900' },
  syncCharacter: { width: 150, height: 150, borderRadius: 75, backgroundColor: DS.color.brand.primarySoft, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 4 },
  saveErrorBox: { width: '100%', gap: 10, alignItems: 'center' },
  error: { fontSize: 13, lineHeight: 21, color: DS.color.state.error, fontWeight: '700', textAlign: 'center' },
});
