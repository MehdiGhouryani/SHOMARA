/**
 * Generic Signature Challenge player (Phase 2).
 *
 * Renders any station challenge from server presentation fields
 * (title / options / display / sequence). Does not evaluate answers locally.
 * ST01 keeps working when given its definitionId; other stations work the same way.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { Button } from '../ui/v2/core';
import { ClaySurface } from '../ui/v2/clay';
import { C2, R2, S2, type2 } from '../ui/v2/tokens';
import { TactileChoice, HintReveal } from '../game-feel';
import {
  challengeDefinitionIdForStation,
  challengeRoundIdempotencyKey,
  ST01_CHALLENGE_DEFINITION_ID,
} from '@math/contracts';
import {
  requestSignatureChallengeHint,
  startSignatureChallenge,
  submitSignatureChallengeRound,
  type SignatureChallengeRunView,
} from './runtimeApi';

type ChallengeResult = SignatureChallengeRunView['result'];

export type SignatureChallengeViewProps = {
  sessionId: string;
  /** Prefer passing explicit definition id. Falls back to stationId map, then ST01. */
  challengeDefinitionId?: string | undefined;
  /** Station code (ST01…ST25) used to resolve definition when id is omitted. */
  stationId?: string | undefined;
  onDone: (result: ChallengeResult) => void;
};

function resolveDefinitionId(props: SignatureChallengeViewProps): string {
  if (props.challengeDefinitionId) return props.challengeDefinitionId;
  if (props.stationId) {
    const mapped = challengeDefinitionIdForStation(props.stationId);
    if (mapped) return mapped;
  }
  return ST01_CHALLENGE_DEFINITION_ID;
}

function resolveOptions(next: NonNullable<SignatureChallengeRunView['next']>): string[] {
  if (next.options && next.options.length > 0) return [...next.options];
  if (next.content?.options && next.content.options.length > 0) return [...next.content.options];
  return [];
}

function resolveTitle(run: SignatureChallengeRunView): string {
  const next = run.next;
  const fromNext = next?.title ?? next?.content?.title;
  if (fromNext && String(fromNext).trim()) return String(fromNext).trim();
  if (run.challenge.objective?.trim()) return run.challenge.objective.trim();
  return 'چالش';
}

function resolveStem(next: NonNullable<SignatureChallengeRunView['next']>): {
  kind: 'sequence' | 'display' | 'prompt' | 'none';
  sequence: string[] | null;
  text: string | null;
} {
  const sequence =
    (next.sequence && next.sequence.length > 0 ? next.sequence : null) ??
    (next.content?.sequence && next.content.sequence.length > 0 ? next.content.sequence : null);
  if (sequence) return { kind: 'sequence', sequence: [...sequence], text: null };

  const display = next.display ?? next.content?.display ?? null;
  if (display && String(display).trim()) {
    return { kind: 'display', sequence: null, text: String(display).trim() };
  }

  if (next.prompt && next.prompt.trim()) {
    return { kind: 'prompt', sequence: null, text: next.prompt.trim() };
  }

  return { kind: 'none', sequence: null, text: null };
}

function hintCopyForLevel(level: string | undefined): string {
  if (level === 'STRATEGY') return 'یک بار دیگر به سؤال نگاه کن و گزینه‌ها را آرام مقایسه کن.';
  if (level === 'REPRESENTATION') return 'به تصویر یا نوشتهٔ سؤال دقت کن؛ کدام گزینه بیشتر جور است؟';
  if (level === 'WORKED_STEP') return 'گام‌به‌گام پیش برو: اول سؤال، بعد هر گزینه.';
  return 'اگر خواستی، می‌توانی یک سرنخ کوچک بگیری.';
}

export function SignatureChallengeView({
  sessionId,
  challengeDefinitionId,
  stationId,
  onDone,
}: SignatureChallengeViewProps) {
  const definitionId = useMemo(
    () => resolveDefinitionId({ sessionId, challengeDefinitionId, stationId, onDone }),
    // onDone is not part of definition resolution; omit to avoid restart loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [challengeDefinitionId, stationId],
  );

  const [run, setRun] = useState<SignatureChallengeRunView | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const begin = useCallback(async () => {
    if (!sessionId) {
      setError('نشست آماده نیست. دوباره امتحان می‌کنیم.');
      return;
    }
    setError(null);
    setHint(null);
    setRun(null);
    try {
      const started = await startSignatureChallenge({
        sessionId,
        challengeDefinitionId: definitionId,
        clientIdempotencyKey: `challenge-${definitionId}-${sessionId}`,
      });
      setRun(started);
    } catch {
      setError('چالش آماده نشد. دوباره امتحان می‌کنیم.');
    }
  }, [sessionId, definitionId]);

  useEffect(() => {
    if (!sessionId) return;
    void begin();
  }, [begin, sessionId]);

  async function pick(index: number) {
    if (!run?.next || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await submitSignatureChallengeRound({
        runId: run.runId,
        roundIndex: run.next.roundIndex,
        attemptNumber: run.next.attemptNumber,
        clientIdempotencyKey: challengeRoundIdempotencyKey({
          runId: run.runId,
          roundIndex: run.next.roundIndex,
          attemptNumber: run.next.attemptNumber,
        }),
        answers: [{ answerIndex: 0, answerPayload: index }],
      });
      setHint(next.offerHint ? hintCopyForLevel('STRATEGY') : null);
      if (next.result) {
        onDone(next.result);
      } else {
        setRun({
          ...run,
          next: next.next,
          currentRoundIndex: next.next?.roundIndex ?? run.currentRoundIndex,
        });
      }
    } catch {
      setError('پاسخ ثبت نشد. دوباره تلاش کن.');
    } finally {
      setBusy(false);
    }
  }

  async function askHint() {
    if (!run?.next || busy) return;
    try {
      const h = await requestSignatureChallengeHint({
        runId: run.runId,
        roundIndex: run.next.roundIndex,
        hintIndex: 0,
        clientIdempotencyKey: `hint-${run.runId}-${run.next.roundIndex}`,
      });
      setHint(hintCopyForLevel(h.hintLevel));
    } catch {
      /* hint is optional */
    }
  }

  if (error) {
    return (
      <ClaySurface style={styles.card}>
        <Text style={styles.title}>چالش</Text>
        <Text style={styles.copy}>{error}</Text>
        <Button label="دوباره" onPress={() => void begin()} />
      </ClaySurface>
    );
  }

  if (!run?.next) {
    return (
      <ClaySurface style={styles.card}>
        <Text style={styles.title}>چالش</Text>
        <Text style={styles.copy}>چالش را آماده می‌کنیم…</Text>
      </ClaySurface>
    );
  }

  const title = resolveTitle(run);
  const options = resolveOptions(run.next);
  const stem = resolveStem(run.next);
  const prompt = run.next.prompt?.trim() || run.challenge.objective;

  return (
    <ClaySurface style={styles.card} accessibilityLabel={`چالش ${title}`}>
      <Text style={styles.title}>{title}</Text>
      {prompt && prompt !== title ? <Text style={styles.copy}>{prompt}</Text> : null}

      {stem.kind === 'sequence' && stem.sequence ? (
        <View style={styles.pattern} accessibilityLabel="الگوی چالش">
          {stem.sequence.map((token, i) => (
            <Text key={`${token}-${i}`} style={token === '?' ? styles.gap : styles.dot}>
              {token}
            </Text>
          ))}
        </View>
      ) : null}

      {stem.kind === 'display' && stem.text ? (
        <View style={styles.stemBox}>
          <Text style={styles.stemText}>{stem.text}</Text>
        </View>
      ) : null}

      <HintReveal visible={Boolean(hint)}>
        <Text style={styles.hint}>{hint}</Text>
      </HintReveal>

      {options.length > 0 ? (
        <View style={styles.options}>
          {options.map((label, i) => (
            <TactileChoice
              key={`${label}-${i}`}
              label={label}
              onPress={() => void pick(i)}
              disabled={busy}
              style={styles.option}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.copy}>گزینه‌ها هنوز آماده نشده‌اند.</Text>
      )}

      <Button label="یک سرنخ کوچک" onPress={() => void askHint()} disabled={busy} variant="ghost" />
    </ClaySurface>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 8, gap: 14 },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: C2.ink,
  },
  copy: {
    textAlign: 'center',
    color: C2.ink2,
    fontSize: 16,
  },
  pattern: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    padding: 10,
  },
  dot: { fontSize: 28, color: C2.primary, fontWeight: '700' },
  gap: { fontSize: 28, color: C2.muted, fontWeight: '700' },
  stemBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: C2.surfaceAlt,
  },
  stemText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: C2.ink,
  },
  hint: { textAlign: 'center', color: C2.ink },
  options: { gap: 10 },
  option: { minHeight: 58 },
});
