import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { JUMP_ASSESSMENTS, type JumpQuestion } from '@math/contracts';
import { Text } from '../../../src/ui/AppText';
import { C2, K2, R2, S2 } from '../../../src/ui/v2/tokens';
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
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-forward" size={20} color={C2.ink} /><Text style={styles.backText}>بازگشت</Text></Pressable>
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
              <Ionicons name="refresh" size={18} color={C2.primaryDark} />
              <Text style={styles.retryText}>تلاش دوباره</Text>
            </Pressable>
          </View>
        ) : null}

        {result && (
          <View style={styles.card}>
            <View style={[styles.resultIcon, result.passed ? styles.resultIconPass : styles.resultIconRetry]}><Ionicons name={result.passed ? 'checkmark' : 'refresh'} size={34} color={result.passed ? C2.primary : C2.amberInk} /></View>
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
  safe: { flex: 1, backgroundColor: C2.canvas },
  container: { padding: S2.xl, paddingBottom: S2.huge * 3, gap: S2.md },
  back: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 6 },
  backText: { color: C2.ink, fontSize: 13, fontWeight: '800' },
  header: { paddingHorizontal: 3, alignItems: 'flex-end' },
  kicker: { color: C2.muted, fontSize: 11, fontWeight: '900', textAlign: 'right' },
  title: { color: C2.ink, fontSize: 22, lineHeight: 30, fontWeight: '900', marginTop: 2, textAlign: 'right' },
  subtitle: { color: C2.ink2, fontSize: 13, lineHeight: 23, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  card: { backgroundColor: C2.surface, borderRadius: R2.xl, borderWidth: 1, borderColor: C2.line, padding: S2.xl },
  progressRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: C2.muted, fontSize: 11, fontWeight: '800' },
  track: { height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: C2.surfaceAlt, marginTop: 8 },
  fill: { height: '100%', borderRadius: 99, backgroundColor: C2.primary },
  question: { color: C2.ink, fontSize: 21, lineHeight: 33, fontWeight: '900', textAlign: 'right', marginTop: 20, marginBottom: 14 },
  options: { gap: 9 },
  option: { minHeight: 56, borderRadius: R2.md, borderWidth: 1.5, borderColor: C2.line2, backgroundColor: C2.surface, justifyContent: 'center', paddingHorizontal: 16 },
  optionSelected: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  optionText: { color: C2.ink, fontSize: 18, fontWeight: '800', textAlign: 'right' },
  optionTextSelected: { color: C2.primaryDark },
  note: { color: C2.muted, fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 14 },
  retry: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 14, borderRadius: R2.md, borderWidth: 1.5, borderColor: C2.line2, backgroundColor: C2.surface },
  retryText: { color: C2.primaryDark, fontSize: 13, fontWeight: '800' },
  error: { color: C2.danger, backgroundColor: C2.dangerSoft, borderRadius: 12, padding: 10, marginTop: 10, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  loading: { color: C2.ink2, textAlign: 'center', fontSize: 13, fontWeight: '800', paddingVertical: 30 },
  resultIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 2 },
  resultIconPass: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  resultIconRetry: { borderColor: C2.amber, backgroundColor: C2.amberSoft },
  resultKicker: { color: C2.muted, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  resultTitle: { color: C2.ink, fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  resultBody: { color: C2.ink2, fontSize: 13, lineHeight: 23, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  primary: { minHeight: 52, borderRadius: R2.md, backgroundColor: C2.primary, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  primaryText: { color: C2.white, fontSize: 13, fontWeight: '900' },
  secondary: { minHeight: 48, borderRadius: R2.md, borderWidth: 1.5, borderColor: C2.line2, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondaryText: { color: C2.ink, fontSize: 13, fontWeight: '800' },
});
