import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { JUMP_ASSESSMENTS, type JumpQuestion } from '@math/contracts';
import { Text } from '../../../src/ui/AppText';
import { DS } from '../../../src/ui/design-system';
import { toFa } from '../../../src/ui/digits';
import { useAppState } from '../../../src/state/AppStateContext';

import { API_BASE_URL, productionConfigError } from '../../../src/config/runtime';
import { getAuthHeaders } from '../../../src/auth/AuthSession';
import { stableActionKey } from '../../../src/sync/MobileSyncManager';

type PublicAssessment = { id: string; targetStationId: string; targetUnitId: string; title: string; intro: string; questions: JumpQuestion[] };
type AssessmentResult = { passed: boolean; correctCount: number; totalCount: number; targetStationId: string; targetUnitId: string };

export default function JumpScreen() {
  const router = useRouter();
  const { unitId, targetStationId } = useLocalSearchParams<{ unitId?: string; targetStationId?: string }>();
  const fallback = useMemo(() => JUMP_ASSESSMENTS.find((item) => item.targetStationId === targetStationId) ?? JUMP_ASSESSMENTS[0]!, [targetStationId]);
  const { grantJumpUnlock } = useAppState();
  const [assessment, setAssessment] = useState<PublicAssessment | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Loadable + retryable: a failed load must offer an explicit way back in, never a dead end.
  const loadAssessment = useCallback(() => {
    let active = true;
    const configError = productionConfigError();
    if (configError) {
      setError(configError);
      return () => { active = false; };
    }
    setError('');
    fetch(`${API_BASE_URL}/api/v1/progression/jump?targetStationId=${encodeURIComponent(fallback.targetStationId)}`, { headers: { Accept: 'application/json', ...getAuthHeaders() } })
      .then(async (response) => {
        if (!response.ok) throw new Error('JUMP_LOAD_FAILED');
        return response.json() as Promise<PublicAssessment>;
      })
      .then((data) => { if (active) setAssessment(data); })
      .catch(() => { if (active) setError('ارزیابی پرش بارگذاری نشد. اتصال را بررسی کن.'); });
    return () => { active = false; };
  }, [fallback.targetStationId]);

  useEffect(() => loadAssessment(), [loadAssessment]);

  const current = assessment?.questions[index];
  const progress = assessment ? Math.round((Object.keys(answers).length / assessment.questions.length) * 100) : 0;

  async function choose(answerIndex: number) {
    if (!assessment || !current || busy || result) return;
    const next = { ...answers, [current.id]: answerIndex };
    setAnswers(next);
    if (index + 1 < assessment.questions.length) {
      setTimeout(() => setIndex((value) => value + 1), 120);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const clientIdempotencyKey = await stableActionKey('JUMP_ASSESSMENT', `${assessment.id}:${fallback.targetStationId}`, next);
      const response = await fetch(`${API_BASE_URL}/api/v1/progression/jump`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ assessmentId: assessment.id, answers: next, clientIdempotencyKey }),
      });
      const payload = await response.json() as AssessmentResult & { code?: string; unlockGranted?: boolean };
      if (!response.ok) throw new Error(payload.code ?? 'JUMP_FAILED');
      setResult(payload);
      if (payload.passed && payload.unlockGranted) grantJumpUnlock(payload.targetStationId);
    } catch {
      setError('نتیجه ثبت نشد. دوباره امتحان کن.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-forward" size={20} color={DS.color.text.primary} /><Text style={styles.backText}>بازگشت</Text></Pressable>
        <View style={styles.header}><Text style={styles.kicker}>پرش به جلو</Text><Text style={styles.title}>{assessment?.title ?? fallback.title}</Text><Text style={styles.subtitle}>{assessment?.intro ?? fallback.intro}</Text></View>

        {!result && current && (
          <View style={styles.card}>
            <View style={styles.progressRow}><Text style={styles.progressText}>سؤال {toFa(index + 1)} از {toFa(assessment?.questions.length ?? 5)}</Text><Text style={styles.progressText}>{toFa(progress)}٪</Text></View>
            <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
            <Text style={styles.question}>{current.prompt}</Text>
            <View style={styles.options}>{current.options.map((option, optionIndex) => <Pressable key={optionIndex} accessibilityRole="button" disabled={busy} onPress={() => choose(optionIndex)} style={[styles.option, answers[current.id] === optionIndex && styles.optionSelected]}><Text style={[styles.optionText, answers[current.id] === optionIndex && styles.optionTextSelected]}>{option}</Text></Pressable>)}</View>
            <Text style={styles.note}>با ۴ پاسخ درست، ایستگاه بعدی باز می‌شود.</Text>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </View>
        )}

        {!assessment && !error && <View style={styles.card}><Text style={styles.loading}>در حال آماده‌سازی ارزیابی…</Text></View>}

        {!assessment && error ? (
          <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <Pressable accessibilityRole="button" style={styles.retry} onPress={loadAssessment}>
              <Ionicons name="refresh" size={18} color={DS.color.brand.primaryDark} />
              <Text style={styles.retryText}>تلاش دوباره</Text>
            </Pressable>
          </View>
        ) : null}

        {result && (
          <View style={styles.card}>
            <View style={[styles.resultIcon, result.passed ? styles.resultIconPass : styles.resultIconRetry]}><Ionicons name={result.passed ? 'checkmark' : 'refresh'} size={34} color={result.passed ? DS.color.brand.emerald : DS.color.brand.secondaryDark} /></View>
            <Text style={styles.resultKicker}>{result.passed ? 'پرش باز شد' : 'یک قدم دیگر'}</Text>
            <Text style={styles.resultTitle}>{toFa(result.correctCount)} از {toFa(result.totalCount)} پاسخ درست</Text>
            <Text style={styles.resultBody}>{result.passed ? 'ایستگاه هدف در مسیرت باز شد.' : 'چند تمرین دیگر انجام بده و دوباره تلاش کن.'}</Text>
            <Pressable accessibilityRole="button" style={styles.primary} onPress={() => result.passed ? router.replace(`/station/${result.targetStationId}/start`) : router.replace('/')}><Text style={styles.primaryText}>{result.passed ? 'رفتن به ایستگاه' : 'برگرد به مسیر'}</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => router.replace('/')}><Text style={styles.secondaryText}>بازگشت به مسیر</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], paddingBottom: DS.space[12], gap: DS.space[3] },
  back: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 6 },
  backText: { color: DS.color.text.primary, fontSize: DS.type.sm.fontSize, fontWeight: '800' },
  header: { paddingHorizontal: 3, alignItems: 'flex-end' },
  kicker: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '900', textAlign: 'right' },
  title: { color: DS.color.text.primary, fontSize: DS.type.displaySm.fontSize, lineHeight: DS.type.displaySm.lineHeight, fontWeight: '900', marginTop: 2, textAlign: 'right' },
  subtitle: { color: DS.color.text.secondary, fontSize: DS.type.sm.fontSize, lineHeight: 23, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  card: { backgroundColor: DS.color.bg.surface, borderRadius: DS.radius['2xl'], borderWidth: 1, borderColor: DS.color.border.subtle, padding: DS.space[4] },
  progressRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '800' },
  track: { height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: DS.color.state.disabledSoft, marginTop: 8 },
  fill: { height: '100%', borderRadius: 99, backgroundColor: DS.color.brand.primary },
  question: { color: DS.color.text.primary, fontSize: 21, lineHeight: 33, fontWeight: '900', textAlign: 'right', marginTop: 20, marginBottom: 14 },
  options: { gap: 9 },
  option: { minHeight: 56, borderRadius: DS.radius.lg, borderWidth: 1.5, borderColor: DS.color.border.default, backgroundColor: DS.color.bg.surface, justifyContent: 'center', paddingHorizontal: 16 },
  optionSelected: { borderColor: DS.color.brand.primary, backgroundColor: DS.color.brand.primarySoft },
  optionText: { color: DS.color.text.primary, fontSize: 18, fontWeight: '800', textAlign: 'right' },
  optionTextSelected: { color: DS.color.brand.primaryDark },
  note: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '700', textAlign: 'right', marginTop: 14 },
  retry: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 14, borderRadius: DS.radius.lg, borderWidth: 1.5, borderColor: DS.color.border.default, backgroundColor: DS.color.bg.surface },
  retryText: { color: DS.color.brand.primaryDark, fontSize: DS.type.sm.fontSize, fontWeight: '800' },
  error: { color: DS.color.state.error, backgroundColor: DS.color.state.errorSoft, borderRadius: 12, padding: 10, marginTop: 10, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  loading: { color: DS.color.text.secondary, textAlign: 'center', fontSize: DS.type.sm.fontSize, fontWeight: '800', paddingVertical: 30 },
  resultIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 2 },
  resultIconPass: { borderColor: DS.color.brand.emerald, backgroundColor: DS.color.brand.emeraldSoft },
  resultIconRetry: { borderColor: DS.color.brand.secondary, backgroundColor: DS.color.brand.secondarySoft },
  resultKicker: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  resultTitle: { color: DS.color.text.primary, fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  resultBody: { color: DS.color.text.secondary, fontSize: DS.type.sm.fontSize, lineHeight: 23, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  primary: { minHeight: 52, borderRadius: DS.radius.lg, backgroundColor: DS.color.brand.primary, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  primaryText: { color: DS.color.text.inverse, fontSize: DS.type.sm.fontSize, fontWeight: '900' },
  secondary: { minHeight: 48, borderRadius: DS.radius.lg, borderWidth: 1.5, borderColor: DS.color.border.default, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondaryText: { color: DS.color.text.primary, fontSize: DS.type.sm.fontSize, fontWeight: '800' },
});
