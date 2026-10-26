import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CharacterSays } from '../components/CharacterAvatar';
import { CHARACTERS, speakerForContent, type CharacterId } from '../characters/characters';
import { makeAnimationEvent } from '../animation';
import { FeedbackBurst, HintReveal, RewardReveal, TactileChoice, semanticEventForOutcome, useGameFeel } from '../game-feel';
import { createEncounter, getLocalContent, getRecoveryContent, getRecheckContent, resumeStationSession, shouldUseRemoteRuntime, startStationSession, submitAttempt, type AuthoritativeEncounterContent } from './runtimeApi';
import { useAppState } from '../state/AppStateContext';
import { RESUMABLE_STAGES, getResume, shouldFastTrack, type ResumableStage } from '../state/appStateCore';
import { LessonFeedbackCard, LessonPlayerChrome } from './LessonPlayerChrome';
import { DS } from '../ui/design-system/theme';
import { DSButton, DSSurface } from '../ui/design-system/components';
import { isLocalContentPreview, productionConfigError } from '../config/runtime';
import { S } from '../ui/strings.fa';
import { toFa } from '../ui/digits';
import type { AnswerPayload, StationContent, StationStage, SubmitOutcome } from './types';
import {
  challengeDefinitionIdForStation,
  G1_PATH_ACHIEVEMENTS,
  G1_STATIONS,
  G1_UNITS,
  hasStationChallenge,
  normalizeStationCode,
  sessionAttemptFeel,
  sessionCompleteFeel,
  ST01_SIGNATURE_CHALLENGE,
  type LessonStage,
  type SessionCompleteKind,
} from '@math/contracts';
import { SignatureChallengeView } from './SignatureChallengeView';
import { TeachView } from './views/TeachView';
import { QuestionView, type QuestionPhase } from './views/QuestionView';
import { StageResultView } from './views/StageResultView';
import { ChallengeIntroView } from './views/ChallengeIntroView';
import { MACRO_LABELS, macroFilled, macroLabel } from './macro';
import { speakFa, stopSpeaking } from './speech';
import { C } from '../ui/v1';

/** Page 07 shows three beads; the E01 content has no `visualCount`, so the teach scene keeps the count the old scene showed. */
const TEACH_DEFAULT_BEADS = 3;

/**
 * Encounters whose single-choice interaction is the approved question page (08 to 10, D-001 to D-003):
 * tap selects, «بررسی» submits once, the sheet's action moves on. Other single-choice encounters
 * (pattern games, E11 transfer) have no approved page yet and keep the legacy rendering.
 */
const QUESTION_ENCOUNTER_IDS = new Set(['G1-ST01-E02', 'G1-ST01-E04', 'G1-ST01-E05']);

function isQuestionEncounter(content: StationContent | null): content is StationContent {
  return Boolean(content && QUESTION_ENCOUNTER_IDS.has(content.id));
}

/** The wrong-answer sheet follows the server's decision (D-002): RECOVERY/RECHECK redirects, CONTINUE may retry the same item. */
function questionSheetAllowsRetry(outcome: SubmitOutcome): boolean {
  return outcome.selectedStep === 'CONTINUE' || outcome.selectedStep === 'STATION_PASS';
}

/** Page 11 data: the station's display title and its chapter's station codes. */
function stationChapter(stationCode: string) {
  const station = G1_STATIONS.find((s) => s.id === stationCode) ?? null;
  const unit = G1_UNITS.find((u) => u.stationIds.includes(stationCode)) ?? null;
  return { station, unit };
}

/** The path achievement a finished station earns (`شمارش‌گر` for ST01), or null when there is none. */
function pathAchievementTitle(stationCode: string): string | null {
  const found = G1_PATH_ACHIEVEMENTS.find((a) => a.trigger.type === 'STATION_COMPLETED' && a.trigger.targetRef === stationCode);
  return found?.titleFa ?? null;
}

/** ST01 keeps the full vertical-slice lesson engine; other stations use challenge-first path when seeded. */
function isSt01Station(stationId: string): boolean {
  return normalizeStationCode(stationId) === 'ST01';
}

export function StationFlow({ stationId }: { stationId: string }) {
  const { dispatch, feedback, characterState, inputBlocked, clearFeedback } = useGameFeel();
  const app = useAppState();
  const gradeId = app.state?.profile.gradeId;
  const [completeKind, setCompleteKind] = useState<SessionCompleteKind>('PRACTICED');
  const router = useRouter();
  const [stage, setStage] = useState<StationStage>('ENTRY');
  const [lessonStage, setLessonStage] = useState<StationStage | null>(null);
  const [activeSkillId, setActiveSkillId] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [sequence, setSequence] = useState(1);
  const [lastOutcome, setLastOutcome] = useState<SubmitOutcome | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'REMOTE' | 'LOCAL'>(shouldUseRemoteRuntime() ? 'REMOTE' : 'LOCAL');
  const [message, setMessage] = useState('');
  const [localPassedChecks, setLocalPassedChecks] = useState(0);
  const [stationPassAchieved, setStationPassAchieved] = useState(false);
  const [authoritativeContent, setAuthoritativeContent] = useState<StationContent | null>(null);
  // Question pages 08 to 10 (D-001): tap only selects, «بررسی» submits once, the sheet's action moves on.
  const [questionSelection, setQuestionSelection] = useState<number | null>(null);
  const [questionOutcome, setQuestionOutcome] = useState<SubmitOutcome | null>(null);
  // Page 12: the challenge invitation shows once; the run itself keeps the player chrome.
  const [challengeIntroDone, setChallengeIntroDone] = useState(false);

  // Consume the placement fast-track the first time the station really starts
  // (stage leaves ENTRY). Done here, not in start(), so a failed network call at
  // the very first encounter does not burn the fast-track.
  const { startStation } = app;
  useEffect(() => {
    if (stage !== 'ENTRY') startStation(stationId);
  }, [stage, stationId, startStation]);

  useEffect(() => {
    dispatch(makeAnimationEvent('SESSION_START', { stationId }));
  }, [dispatch, stationId]);

  const content = useMemo(() => {
    if (mode === 'REMOTE' && authoritativeContent && stage !== 'ENTRY') return authoritativeContent;
    if (stage === 'LEARN') return getLocalContent('learn');
    if (stage === 'GUIDED') return getLocalContent('guided');
    if (stage === 'GAME_PATTERN') return getLocalContent('pattern');
    if (stage === 'GAME_COUNT') return getLocalContent('count');
    if (stage === 'INDEPENDENT') return getLocalContent('independent');
    if (stage === 'REVIEW') return getLocalContent('review');
    if (stage === 'TRANSFER') return getLocalContent('transfer');
    if (stage === 'CHECK_A') return getLocalContent('checkA');
    if (stage === 'CHECK_B') return getLocalContent('checkB');
    if (stage === 'MASTERY_CHECK') return getLocalContent('mastery');
    if (stage === 'RECOVERY') return getRecoveryContent(activeSkillId);
    if (stage === 'RECHECK') return getRecheckContent(activeSkillId);
    return null;
  }, [stage, mode, authoritativeContent, activeSkillId]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    if (mode === 'LOCAL') {
      const localId = `local-session-${Date.now()}`;
      setSessionId(localId);
      return localId;
    }
    try {
      const session = await startStationSession();
      setSessionId(session.id);
      return session.id;
    } catch {
      if (__DEV__) {
        setMode('LOCAL');
        const localId = `local-session-${Date.now()}`;
        setSessionId(localId);
        // DEV-only fallback; intentionally silent for children.
        return localId;
      }
      setMessage(S.lesson.startFailed);
      throw new Error('REMOTE_RUNTIME_UNAVAILABLE');
    }
  }

  async function beginEncounter(nextContent: StationContent, nextStage: StationStage) {
    const session = await ensureSession();
    setBusy(true);
    try {
      if (mode === 'REMOTE') {
        const created = await createEncounter(session, nextContent, sequence);
        setEncounterId(created.encounter.id);
        if (!created.encounter.content) throw new Error('REMOTE_CONTENT_MISSING');
        setAuthoritativeContent(normalizeAuthoritativeContent(created.encounter.content));
      } else {
        setAuthoritativeContent(null);
      }
      setSequence((value) => value + 1);
      setActiveSkillId(nextContent.skillId);
      setStage(nextStage);
      setQuestionSelection(null);
      setQuestionOutcome(null);
      const semantic = nextStage === 'LEARN' ? 'EXPLAIN' : 'HINT_OPENED';
      dispatch(makeAnimationEvent(semantic, { sessionId: session, stationId }));
    } finally {
      setBusy(false);
    }
  }

  async function answerContent(target: StationContent, answerIndex: number) {
    const session = await ensureSession();
    setBusy(true);
    try {
      let outcome: SubmitOutcome;
      if (mode === 'REMOTE' && encounterId) {
        outcome = await submitAttempt({ sessionId: session, encounterId, content: target, answer: { answerIndex, answerPayload: answerIndex }, attemptNumber });
      } else {
        // LOCAL is only a dev/startup fallback. There is no server encounter to
        // attach an idempotent attempt to, so never claim that it was queued.
        setMessage(S.lesson.submitFailed);
        return;
      }
      setLastOutcome(outcome);
      if (outcome.syncPending) {
        setMessage(S.lesson.checkQueued);
        return;
      }
      setAttemptNumber((value) => value + 1);
      const answerSemantic = semanticEventForOutcome(outcome);
      dispatch(makeAnimationEvent(answerSemantic, { sessionId: session, stationId }));

      // Question encounters (D-001/U-Q20) hold this stage until the feedback sheet's action;
      // what was submitted above is byte-for-byte what the old immediate answer sent.
      if (isQuestionEncounter(target)) {
        setQuestionOutcome(outcome);
        return;
      }
      await advanceAfterAnswer(target, outcome);
    } catch {
      setMessage(S.lesson.submitFailed);
    } finally {
      setBusy(false);
    }
  }

  /** The stage transition that used to run inside answerContent; the question sheet's action triggers it (D-001). */
  async function advanceAfterAnswer(target: StationContent, outcome: SubmitOutcome) {
    const session = await ensureSession();
    setBusy(true);
    try {
      // D-002/U-Q21: when the server redirects a wrong answer (RECOVERY/RECHECK), the client follows it.
      if (!outcome.correct && isQuestionEncounter(target)) {
        if (outcome.selectedStep === 'RECOVERY') {
          await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
          return;
        }
        if (outcome.selectedStep === 'RECHECK') {
          await beginFreshCheckEncounter(getRecheckContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECHECK');
          return;
        }
      }
      // The guided question used to route through the RESULT screen's continue button; the sheet's «ادامه» now
      // goes straight to the next section (same content sequence, one intermediate screen fewer).
      if (target.id === 'G1-ST01-E02') await beginEncounter(getLocalContent('pattern'), 'GAME_PATTERN');
      else if (target.id === 'G1-ST01-E03') await beginEncounter(getLocalContent('count'), 'GAME_COUNT');
      else if (target.id === 'G1-ST01-E04') await beginEncounter(getLocalContent('independent'), 'INDEPENDENT');
      else if (target.id === 'G1-ST01-E05') await beginEncounter(getLocalContent('review'), 'REVIEW');
      else if (target.id === 'G1-ST01-E06') await beginEncounter(getLocalContent('checkA'), 'CHECK_A');
      else if (target.id === 'G1-ST01-E07') {
        if (outcome.correct || outcome.selectedStep === 'RECHECK') {
          await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');
        } else {
          await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
        }
      } else if (target.id === 'G1-ST01-E08') {
        const passed = outcome.stationPass;
        if (passed) {
          setStationPassAchieved(true);
          setLastOutcome({ ...outcome, stationPass: true, selectedStep: 'STATION_PASS', semanticEvent: 'STATION_PASS' });
          dispatch(makeAnimationEvent('STATION_PASS', { sessionId: session, stationId }));
          await beginEncounter(getLocalContent('transfer'), 'TRANSFER');
        } else if (outcome.selectedStep === 'RECOVERY') {
          await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
        } else {
          await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');
        }
      } else if (target.id === 'G1-ST01-E09') await beginFreshCheckEncounter(getRecheckContent(outcome?.decisionTargetSkillId ?? target.skillId), 'RECHECK');
      else if (target.id === 'G1-ST01-E10') {
        if (outcome.selectedStep === 'RECOVERY') await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
        else await beginEncounter(getLocalContent('transfer'), 'TRANSFER');
      } else if (target.id === 'G1-ST01-E11') {
        await beginFreshCheckEncounter(getLocalContent('mastery'), 'MASTERY_CHECK');
      } else setStage('RESULT');
    } catch {
      setMessage(S.lesson.submitFailed);
    } finally {
      setBusy(false);
    }
  }

  async function answerCheck(target: StationContent, answers: AnswerPayload[]) {
    const session = await ensureSession();
    setBusy(true);
    try {
      let outcome: SubmitOutcome;
      if (mode === 'REMOTE' && encounterId) {
        outcome = await submitAttempt({ sessionId: session, encounterId, content: target, answers, attemptNumber });
      } else {
        // A local fallback cannot produce an authoritative Check result.
        setMessage(S.lesson.submitFailed);
        return;
      }
      setLastOutcome(outcome);
      if (outcome.syncPending) {
        setMessage(S.lesson.checkQueued);
        return;
      }
      setAttemptNumber((value) => value + 1);
      const answerSemantic = semanticEventForOutcome(outcome);
      dispatch(makeAnimationEvent(answerSemantic, { sessionId: session, stationId }));
      if (target.id === 'G1-ST01-E12') {
        setLastOutcome({ ...outcome, stationPass: stationPassAchieved, selectedStep: 'CONTINUE', semanticEvent: outcome.correct ? 'ANSWER_CORRECT' : 'ANSWER_WRONG' });
        setStage('SIGNATURE_CHALLENGE');
      } else if (target.id === 'G1-ST01-E08') {
        if (outcome.stationPass) {
          setStationPassAchieved(true);
          setLastOutcome({ ...outcome, stationPass: true, selectedStep: 'STATION_PASS', semanticEvent: 'STATION_PASS' });
          dispatch(makeAnimationEvent('STATION_PASS', { sessionId: session, stationId }));
          await beginEncounter(getLocalContent('transfer'), 'TRANSFER');
        } else if (outcome.selectedStep === 'RECOVERY') {
          await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
        } else {
          // A single qualifying Check is not Station Pass; never advance to Transfer without the second independent pass.
          await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');
        }
      } else if (outcome.stationPass) {
        setStationPassAchieved(true);
        setLastOutcome({ ...outcome, stationPass: true, selectedStep: 'STATION_PASS', semanticEvent: 'STATION_PASS' });
        dispatch(makeAnimationEvent('STATION_PASS', { sessionId: session, stationId }));
        await beginEncounter(getLocalContent('transfer'), 'TRANSFER');
      } else if (target.id === 'G1-ST01-E07' && outcome.selectedStep !== 'RECOVERY') {
        await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');
      } else if (target.id === 'G1-ST01-E10') {
        if (outcome.selectedStep === 'RECOVERY') await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
        else if (stationPassAchieved) await beginEncounter(getLocalContent('transfer'), 'TRANSFER');
        else await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');
      } else if (target.id === 'G1-ST01-E11') {
        await beginFreshCheckEncounter(getLocalContent('mastery'), 'MASTERY_CHECK');
      } else if (outcome.selectedStep === 'RECOVERY') {
        await beginEncounter(getRecoveryContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECOVERY');
      } else if (outcome.selectedStep === 'RECHECK') {
        await beginFreshCheckEncounter(getRecheckContent(outcome.decisionTargetSkillId ?? target.skillId), 'RECHECK');
      } else {
        setStage('RESULT');
      }
    } catch {
      setMessage(S.lesson.submitFailed);
    } finally {
      setBusy(false);
    }
  }

  async function beginFreshCheckEncounter(nextContent: StationContent, nextStage: StationStage) {
    setBusy(true);
    try {
      let freshSessionId = sessionId;
      if (mode === 'REMOTE') {
        const freshSession = await startStationSession();
        freshSessionId = freshSession.id;
        setSessionId(freshSession.id);
      } else {
        freshSessionId = `local-check-session-${Date.now()}`;
        setSessionId(freshSessionId);
      }
      if (mode === 'REMOTE') {
        const created = await createEncounter(freshSessionId!, nextContent, 1);
        if (!created.encounter.content) throw new Error('REMOTE_CONTENT_MISSING');
        const authoritative = normalizeAuthoritativeContent(created.encounter.content);
        setEncounterId(created.encounter.id);
        setAuthoritativeContent(authoritative);
        setActiveSkillId(authoritative.skillId);
      } else {
        setAuthoritativeContent(null);
        setActiveSkillId(nextContent.skillId);
      }
      setStage(nextStage);
      setQuestionSelection(null);
      setQuestionOutcome(null);
      dispatch(makeAnimationEvent('EXPLAIN', { sessionId: freshSessionId ?? undefined, stationId }));
    } finally {
      setBusy(false);
    }
  }

  function contentForResume(stage: ResumableStage, skillId?: string): StationContent {
    switch (stage) {
      case 'LEARN': return getLocalContent('learn');
      case 'GUIDED': return getLocalContent('guided');
      case 'GAME_PATTERN': return getLocalContent('pattern');
      case 'GAME_COUNT': return getLocalContent('count');
      case 'INDEPENDENT': return getLocalContent('independent');
      case 'REVIEW': return getLocalContent('review');
      case 'TRANSFER': return getLocalContent('transfer');
      case 'CHECK_A': return getLocalContent('checkA');
      case 'CHECK_B': return getLocalContent('checkB');
      case 'MASTERY_CHECK': return getLocalContent('mastery');
      case 'RECOVERY': return getRecoveryContent(skillId ?? getLocalContent('recovery').skillId);
      case 'RECHECK': return getRecheckContent(skillId ?? getLocalContent('recheck').skillId);
      case 'SIGNATURE_CHALLENGE':
        // Challenge path does not use lesson StationContent; caller must not use this branch.
        return getLocalContent('learn');
    }
  }

  /**
   * Begin (or resume) the station. `fresh` ignores any saved resume point
   * ("دوباره بازی کنیم"). Never throws: failure leaves the friendly retry screen.
   */
  async function start(fresh: boolean) {
    setLocalPassedChecks(0);
    setStationPassAchieved(false);
    setLastOutcome(null);
    setMessage('');
    setAttemptNumber(1);
    setSequence(1);
    setEncounterId(null);
    setSessionId(null);
    setAuthoritativeContent(null);
    setLessonStage(null);
    setQuestionSelection(null);
    setQuestionOutcome(null);
    setChallengeIntroDone(false);
    try {
      // A configured-but-insecure API base still fails closed in any release build.
      // The preview APK with no API base at all runs in LOCAL content mode (D-019):
      // browsing only, answers are never evaluated client-side, nothing claims a queue.
      const releaseConfigError = productionConfigError();
      if (releaseConfigError && !isLocalContentPreview()) {
        setMessage(releaseConfigError);
        setStage('ENTRY');
        return;
      }
      const resume = fresh ? null : getResume(app.state, stationId);
      if (resume) {
        setLocalPassedChecks(resume.checks);
        setStationPassAchieved(resume.passAchieved);

        // Challenge resume: do not route through lesson content lookup.
        if (resume.stage === 'SIGNATURE_CHALLENGE') {
          if (resume.sessionId) setSessionId(resume.sessionId);
          else await ensureSession();
          setStage('SIGNATURE_CHALLENGE');
          return;
        }

        const target = contentForResume(resume.stage, resume.skillId);
        if (mode === 'REMOTE' && resume.sessionId) {
          try {
            const snapshot = await resumeStationSession(resume.sessionId);
            setSessionId(snapshot.session.id);
            if (snapshot.latestEncounter) {
              setEncounterId(snapshot.latestEncounter.id);
              setSequence(snapshot.latestEncounter.sequence + 1);
              if (!snapshot.latestEncounter.content) throw new Error('REMOTE_CONTENT_MISSING');
              const resumedContent = normalizeAuthoritativeContent(snapshot.latestEncounter.content);
              setAuthoritativeContent(resumedContent);
              setActiveSkillId(snapshot.latestEncounter.skillId || resumedContent.skillId);
              setStage(stageForAuthoritativeContent(resumedContent.id, resumedContent.learningRole, resume.stage));
              return;
            }
          } catch {
            // The cached session may be stale/revoked. Start a new authoritative session
            // rather than trusting local resume as learning truth.
          }
        }
        if (resume.stage === 'CHECK_A' || resume.stage === 'CHECK_B' || resume.stage === 'MASTERY_CHECK' || resume.stage === 'RECHECK') await beginFreshCheckEncounter(target, resume.stage);
        else await beginEncounter(target, resume.stage);
        return;
      }

      // Placement fast-track (SoT S06-S08) is ONE-SHOT: it only applies until this
      // station is first started (see the effect above), so review/retry always
      // teaches from the beginning again.
      if (isSt01Station(stationId)) {
        if (!fresh && app.state && shouldFastTrack(app.state, stationId)) {
          await beginEncounter(getLocalContent('independent'), 'INDEPENDENT');
        } else {
          await beginEncounter(getLocalContent('learn'), 'LEARN');
        }
        return;
      }

      // ST02–ST25 (P10): challenge-first path when a Signature Challenge is seeded.
      // Challenge never grants station pass / mastery (server + client guardrail).
      if (hasStationChallenge(stationId)) {
        const sid = await ensureSession();
        // Use returned id (not only React state) so SIGNATURE_CHALLENGE never mounts without a session.
        if (!sid) {
          setMessage(S.lesson.startFailed);
          setStage('ENTRY');
          return;
        }
        setSessionId(sid);
        setStage('SIGNATURE_CHALLENGE');
        return;
      }

      setMessage('این ایستگاه هنوز برای بازی آماده نشده است.');
      setStage('ENTRY');
    } catch {
      setMessage((m) => m || S.lesson.startFailed);
      setStage('ENTRY');
    }
  }

  // Open the lesson straight away (no extra "start" screen): first tap on Home = first exercise.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    void start(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember the last lesson stage for the macro bar and RESULT screen.
  useEffect(() => {
    if ((RESUMABLE_STAGES as readonly string[]).includes(stage)) setLessonStage(stage);
  }, [stage]);

  // Persist the resume point whenever the child reaches a resumable stage; clear it
  // when the journey is finished (and record the station pass if it was earned).
  const { saveResume, passStation } = app;
  useEffect(() => {
    if ((RESUMABLE_STAGES as readonly string[]).includes(stage)) {
      saveResume(stationId, {
        stage: stage as ResumableStage,
        checks: Math.min(2, localPassedChecks),
        passAchieved: stationPassAchieved,
        ...(sessionId ? { sessionId } : {}),
        ...(encounterId ? { encounterId } : {}),
        ...(stage === 'RECOVERY' || stage === 'RECHECK' ? (activeSkillId ? { skillId: activeSkillId } : {}) : {}),
      });
    } else if (stage === 'COMPLETE') {
      if (stationPassAchieved) passStation(stationId);
      else saveResume(stationId, null);
    }
  }, [stage, stationId, localPassedChecks, stationPassAchieved, activeSkillId, saveResume, passStation]);

  // Leaving a lesson is a deliberate act: ✕ and the Android back button both ask first.
  function confirmExit() {
    Alert.alert(S.lesson.exitTitle, S.lesson.exitBody, [
      { text: S.lesson.exitStay, style: 'cancel' },
      { text: S.lesson.exitLeave, style: 'destructive', onPress: leave },
    ]);
  }
  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }
  useEffect(() => stopSpeaking, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'COMPLETE' || stage === 'ENTRY') {
        leave();
        return true;
      }
      confirmExit();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function continueFromResult() {
    if (lastOutcome?.syncPending) return;
    if (lastOutcome?.selectedStep === 'RECOVERY') void beginEncounter(getRecoveryContent(lastOutcome.decisionTargetSkillId), 'RECOVERY');
    else if (lastOutcome?.selectedStep === 'RECHECK') void beginFreshCheckEncounter(getRecheckContent(lastOutcome.decisionTargetSkillId), 'RECHECK');
    else if (lastOutcome?.stationPass) {
      app.passStation(stationId);
      setCompleteKind('STATION_PASSED');
      setStage('COMPLETE');
    }
    else void beginEncounter(getLocalContent('pattern'), 'GAME_PATTERN');
  }

  const attemptFeel = sessionAttemptFeel(
    message ? 'ERROR' : lastOutcome?.correct ? 'CORRECT' : 'TRY_AGAIN',
    gradeId,
  );
  const completeFeel = sessionCompleteFeel(
    stationPassAchieved ? 'STATION_PASSED' : completeKind,
    gradeId,
  );
  const showFeedback = Boolean(message) || stage === 'RESULT';
  const feedbackState = message ? 'ERROR' as const : lastOutcome?.correct ? 'CORRECT' as const : 'TRY_AGAIN' as const;
  const feedbackTitle = attemptFeel.titleFa;
  const feedbackText = message || attemptFeel.bodyFa;
  const feedbackAction = message
    ? attemptFeel.actionFa
    : lastOutcome?.selectedStep === 'RECOVERY'
      ? S.lesson.easierWay
      : attemptFeel.actionFa;
  const feedbackHandler = message ? () => { clearFeedback(); setMessage(''); void start(false); } : continueFromResult;

  if (stage === 'LEARN' && content && !message) {
    const total = toFa(MACRO_LABELS.length);
    const filled = macroFilled(stage, null);
    const beadCount = content.visualCount ?? TEACH_DEFAULT_BEADS;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
        <TeachView
          caption={{ label: macroLabel(stage, null), position: S.lesson.sectionOf(toFa(filled), total) }}
          progress={filled / MACRO_LABELS.length}
          progressLabel={S.lesson.sectionA11y(toFa(filled), total)}
          closeLabel={S.lesson.close}
          prompt={content.prompt}
          beadCount={beadCount}
          beadsLabel={S.lesson.beadsA11y(toFa(beadCount))}
          guideLabel={S.lesson.guideA11y}
          replayLabel={S.lesson.replay}
          continueLabel={S.lesson.continue}
          busy={busy || inputBlocked}
          onReplay={() => speakFa(content.prompt)}
          onContinue={() => { stopSpeaking(); void beginEncounter(getLocalContent('guided'), 'GUIDED'); }}
          onClose={confirmExit}
        />
      </SafeAreaView>
    );
  }

  // Pages 08 to 10 (D-001 to D-003): tap selects, «بررسی» submits once, the sheet's action moves on.
  if (isQuestionEncounter(content) && !message) {
    const total = toFa(MACRO_LABELS.length);
    const filled = macroFilled(stage, null);
    const beadCount = content.visualCount ?? TEACH_DEFAULT_BEADS;
    const phase: QuestionPhase = questionOutcome ? (questionOutcome.correct ? 'correct' : 'retry') : 'choose';
    const sheetDirectsElsewhere = questionOutcome !== null && !questionOutcome.correct && !questionSheetAllowsRetry(questionOutcome);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
        <QuestionView
          caption={{ label: macroLabel(stage, null), position: S.lesson.sectionOf(toFa(filled), total) }}
          progress={filled / MACRO_LABELS.length}
          progressLabel={S.lesson.questionOf(toFa(filled), total)}
          closeLabel={S.lesson.close}
          prompt={content.prompt}
          beadCount={beadCount}
          beadsLabel={S.lesson.beadsA11y(toFa(beadCount))}
          replayLabel={S.lesson.replay}
          options={content.options ?? []}
          selectedIndex={questionSelection}
          phase={phase}
          checkLabel={S.lesson.check}
          feedbackText={phase === 'correct' ? S.lesson.correctFeedback : S.lesson.retryFeedback}
          feedbackActionLabel={phase === 'correct' || sheetDirectsElsewhere ? S.lesson.continue : S.lesson.retry}
          busy={busy || inputBlocked}
          onReplay={() => speakFa(content.prompt)}
          onSelect={setQuestionSelection}
          onCheck={() => { if (questionSelection !== null) void answerContent(content, questionSelection); }}
          onFeedbackAction={() => {
            if (phase === 'choose') return;
            if (phase === 'correct' || sheetDirectsElsewhere) {
              stopSpeaking();
              void advanceAfterAnswer(content, questionOutcome!);
            } else {
              // The server allowed another attempt on the same item (D-002); choose again.
              setQuestionSelection(null);
              setQuestionOutcome(null);
            }
          }}
          onClose={confirmExit}
        />
      </SafeAreaView>
    );
  }

  // Page 11: the calm celebration when the station was actually passed (the other complete kinds keep the legacy card).
  if (stage === 'COMPLETE' && stationPassAchieved) {
    const stationCode = normalizeStationCode(stationId) ?? stationId;
    const { station, unit } = stationChapter(stationCode);
    const unitStations = unit ? [...unit.stationIds] : [stationCode];
    // The pass of THIS station lands in the store one commit later; count it right away so the
    // celebration never flashes a lower number.
    const passedCount = unitStations.filter((code) => app.state?.progress[code]?.passed).length;
    const done = Math.min(unitStations.length, passedCount + (stationPassAchieved && !app.state?.progress[stationCode]?.passed ? 1 : 0));
    const achievementTitle = pathAchievementTitle(stationCode);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
        <StageResultView
          heroLabel={S.stationDone.heroA11y}
          title={S.stationDone.title}
          subtitle={S.stationDone.subtitle(station?.title ?? stationCode)}
          done={done}
          total={unitStations.length}
          progressLabel={S.stationDone.progressLabel(toFa(done), toFa(unitStations.length))}
          achievement={achievementTitle ? { kicker: S.stationDone.newAchievement, title: achievementTitle } : undefined}
          continueLabel={S.lesson.continue}
          onContinue={leave}
        />
      </SafeAreaView>
    );
  }

  // Page 12: the challenge invitation; «شروع چالش» opens the player (which has no approved page yet).
  if (stage === 'SIGNATURE_CHALLENGE' && !challengeIntroDone && sessionId) {
    const total = toFa(MACRO_LABELS.length);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
        <ChallengeIntroView
          caption={{ label: macroLabel(stage, null), position: S.lesson.sectionOf(total, total) }}
          progress={(MACRO_LABELS.length - 1) / MACRO_LABELS.length}
          progressLabel={S.lesson.sectionA11y(total, total)}
          closeLabel={S.lesson.close}
          title={macroLabel(stage, null)}
          subtitle={S.challengeIntro.subtitle}
          kindChip={S.challengeIntro.kindChip}
          kindChipIcon="trophy"
          questionsChip={S.challengeIntro.questionsChip(toFa(ST01_SIGNATURE_CHALLENGE.rounds.length))}
          heroLabel={S.challengeIntro.heroA11y}
          startLabel={S.challengeIntro.start}
          onStart={() => setChallengeIntroDone(true)}
          onClose={confirmExit}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FeedbackBurst feedback={feedback} />
      <LessonPlayerChrome
        stage={stage as LessonStage}
        progress={stage === 'COMPLETE' ? 100 : Math.max(8, Math.min(96, filledFromStage(stage)))}
        onExit={stage === 'COMPLETE' ? leave : confirmExit}
        feedback={showFeedback ? (
          <LessonFeedbackCard state={feedbackState} title={feedbackTitle} text={feedbackText} actionLabel={feedbackAction} onAction={feedbackHandler} disabled={busy} />
        ) : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {(() => {
            let speaker: { id: CharacterId; text: string } | null = null;
            if (stage === 'ENTRY') speaker = { id: 'aria', text: message ? CHARACTERS.aria.lines.wrong : CHARACTERS.aria.lines.greet };
            else if (stage === 'RESULT') speaker = lastOutcome?.correct ? { id: 'jiko', text: CHARACTERS.jiko.lines.correct } : { id: 'aria', text: CHARACTERS.aria.lines.wrong };
            else if (stage === 'COMPLETE') speaker = { id: 'jiko', text: CHARACTERS.jiko.lines.done };
            else if (!['CHECK_A', 'CHECK_B', 'MASTERY_CHECK'].includes(stage) && content) {
              const id = speakerForContent(content.id);
              if (id) speaker = { id, text: content.id === 'G1-ST01-E01' ? CHARACTERS[id].lines.greet : CHARACTERS[id].lines.hint };
            }
            return speaker ? <CharacterSays id={speaker.id} text={speaker.text} visualState={characterState} /> : null;
          })()}
          {message ? <View style={styles.notice}><Text style={styles.noticeText}>{message}</Text></View> : null}
          {stage === 'ENTRY' && (
            <Card title={message ? 'یک لحظه…' : S.lesson.preparing} subtitle={message || 'درس را برایت آماده می‌کنم.'}>
              {message ? <PrimaryButton label={S.lesson.retry} onPress={() => void start(false)} /> : <Text style={styles.story}>در حال آماده‌سازی</Text>}
            </Card>
          )}
          {content && (stage !== 'ENTRY' && stage !== 'RESULT' && stage !== 'COMPLETE' && stage !== 'SIGNATURE_CHALLENGE') && (
            <Card title={content.title} subtitle={content.prompt}>
              {content.id === 'G1-ST01-E01' ? <LearnScene /> : null}
              {content.id === 'G1-ST01-E02' ? <OptionRow options={content.options ?? []} onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} /> : null}
              {content.id === 'G1-ST01-E03' || content.id === 'G1-ST01-E06' ? <PatternGame onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} /> : null}
              {(content.id === 'G1-ST01-E07' || content.id === 'G1-ST01-E08' || content.id === 'G1-ST01-E10' || content.id === 'G1-ST01-E12') && content.questions ? <CheckQuiz questions={content.questions} onSubmit={(answers) => void answerCheck(content, answers)} disabled={busy || inputBlocked} /> : null}
              {content.id === 'G1-ST01-E04' || content.id === 'G1-ST01-E05' ? <CountGame count={content.visualCount ?? 3} options={content.options ?? []} onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} /> : null}
              {content.id === 'G1-ST01-E11' ? <OptionRow options={content.options ?? ['الگو A', 'الگو B', 'الگو C']} onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} /> : null}
              {content.id === 'G1-ST01-E09' ? (content.skillId === 'G1-SK009' || content.skillId === 'G1-SK011' ? <PatternGame onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} /> : <RecoveryGame onPick={(index) => void answerContent(content, index)} disabled={busy || inputBlocked} />) : null}
              {content.id === 'G1-ST01-E01' ? <PrimaryButton label={S.lesson.letsGo} onPress={() => void beginEncounter(getLocalContent('guided'), 'GUIDED')} disabled={busy || inputBlocked} /> : null}
            </Card>
          )}
          {stage === 'RESULT' && (
            <Card title={attemptFeel.titleFa} subtitle={attemptFeel.bodyFa}>
              <Text style={styles.resultBig}>{attemptFeel.mark}</Text>
            </Card>
          )}
          {stage === 'SIGNATURE_CHALLENGE' && sessionId ? (
            <SignatureChallengeView
              sessionId={sessionId}
              stationId={stationId}
              challengeDefinitionId={challengeDefinitionIdForStation(stationId) ?? undefined}
              onDone={(result) => {
                setCompleteKind(result?.result === 'NOT_YET' ? 'CHALLENGE_NOT_YET' : 'CHALLENGE_DONE');
                setMessage('');
                setStage('COMPLETE');
              }}
            />
          ) : null}
          {stage === 'COMPLETE' && (
            <Card title={completeFeel.titleFa} subtitle={completeFeel.bodyFa}>
              <Text style={styles.resultBig}>{completeFeel.mark}</Text>
              <Text style={styles.story}>پیشرفت این جلسه ذخیره شد. هر وقت خواستی برگرد.</Text>
              <RewardReveal visible={stationPassAchieved} />
              <PrimaryButton label={completeFeel.actionFa} onPress={leave} />
              <PrimaryButton label={S.complete.again} onPress={() => void start(true)} secondary />
            </Card>
          )}
        </ScrollView>
      </LessonPlayerChrome>
    </SafeAreaView>
  );

}

function normalizeAuthoritativeContent(remote: AuthoritativeEncounterContent): StationContent {
  if (!remote.id || !remote.title || !remote.prompt || !remote.stationId || !remote.skillId || !remote.learningRole || !remote.experienceForm) {
    throw new Error('REMOTE_CONTENT_INVALID');
  }
  return {
    id: remote.id,
    title: remote.title,
    prompt: remote.prompt,
    stationId: remote.stationId,
    skillId: remote.skillId,
    learningRole: remote.learningRole,
    experienceForm: remote.experienceForm,
    ...(remote.contentVersionId ? { contentVersionId: remote.contentVersionId } : {}),
    ...(remote.options ? { options: remote.options } : {}),
    ...(remote.questions ? { questions: remote.questions.map((question) => ({ prompt: question.prompt, options: question.options, ...(question.visualCount !== undefined ? { visualCount: question.visualCount } : {}) })) } : {}),
    ...(remote.visualCount !== undefined ? { visualCount: remote.visualCount } : {}),
  };
}

function stageForAuthoritativeContent(id: string, learningRole: string, fallback: StationStage): StationStage {
  const map: Record<string, StationStage> = {
    'G1-ST01-E01': 'LEARN',
    'G1-ST01-E02': 'GUIDED',
    'G1-ST01-E03': 'GAME_PATTERN',
    'G1-ST01-E04': 'GAME_COUNT',
    'G1-ST01-E05': 'INDEPENDENT',
    'G1-ST01-E06': 'REVIEW',
    'G1-ST01-E07': 'CHECK_A',
    'G1-ST01-E08': 'CHECK_B',
    'G1-ST01-E09': 'RECOVERY',
    'G1-ST01-E10': 'RECHECK',
    'G1-ST01-E11': 'TRANSFER',
    'G1-ST01-E12': 'MASTERY_CHECK',
  };
  if (map[id]) return map[id];
  if (learningRole === 'RECOVERY') return 'RECOVERY';
  if (learningRole === 'TRANSFER') return 'TRANSFER';
  if (learningRole === 'MASTERY_CHECK') return fallback === 'CHECK_A' ? 'CHECK_A' : fallback === 'CHECK_B' ? 'CHECK_B' : fallback;
  return fallback;
}

function filledFromStage(stage: StationStage): number {
  const order: StationStage[] = ['ENTRY','LEARN','GUIDED','GAME_PATTERN','GAME_COUNT','INDEPENDENT','REVIEW','TRANSFER','CHECK_A','CHECK_B','MASTERY_CHECK','RECOVERY','RECHECK','RESULT','COMPLETE'];
  const index = Math.max(0, order.indexOf(stage));
  return Math.round((index / (order.length - 1)) * 100);
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <DSSurface elevated style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text><View style={styles.body}>{children}</View></DSSurface>;
}
function PrimaryButton({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <DSButton variant={secondary ? 'outline' : 'primary'} disabled={disabled} onPress={onPress} style={styles.primarySpacing}>{label}</DSButton>;
}
function LearnScene() {
  return <View style={styles.scene}><View style={styles.numberRow}>{['۱','۲','۳'].map((n) => <View key={n} style={styles.numberDot}><Text style={styles.numberText}>{n}</Text></View>)}</View><Text style={styles.sceneText}>۱، ۲، ۳ — آخرین عدد یعنی سه تا.</Text></View>;
}
function OptionRow({ options, onPick, disabled = false, selectedIndex = null }: { options: string[]; onPick: (index: number) => void; disabled?: boolean; selectedIndex?: number | null | undefined }) {
  return <View style={styles.options}>{options.map((item, index) => <TactileChoice key={`${item}-${index}`} label={item} onPress={() => onPick(index)} disabled={disabled} selected={selectedIndex === index} style={styles.option} />)}</View>;
}
function PatternGame({ onPick, disabled = false }: { onPick: (index: number) => void; disabled?: boolean }) {
  return <View><View style={styles.patternRow}>{[0,1,0,1].map((v, i) => <View key={i} style={[styles.patternDot, v === 0 ? styles.dotYellow : styles.dotBlue]} />)}<Text style={styles.questionMark}>؟</Text></View><OptionRow options={['زرد', 'آبی', 'سبز']} onPick={onPick} disabled={disabled} /></View>;
}
function CountGame({ count, options, onPick, disabled = false }: { count: number; options: string[]; onPick: (index: number) => void; disabled?: boolean }) {
  return <View><View style={styles.objectField}>{Array.from({ length: count }, (_, index) => <View key={index} style={styles.countObject} />)}</View><OptionRow options={options} onPick={onPick} disabled={disabled} /></View>;
}
function CheckQuiz({ questions, onSubmit, disabled }: { questions: Array<{ prompt: string; options: string[]; visualCount?: number }>; onSubmit: (answers: AnswerPayload[]) => void; disabled: boolean }) {
  const [answers, setAnswers] = useState<Array<number | null>>(() => questions.map(() => null));
  const ready = answers.every((value) => value !== null);
  return (
    <View style={{ gap: 16 }}>
      {questions.map((question, questionIndex) => (
        <View key={`${question.prompt}-${questionIndex}`} style={styles.checkCard}>
          <Text style={styles.checkIndex}>{S.lesson.questionOf(toFa(questionIndex + 1), toFa(questions.length))}</Text>
          {question.visualCount ? <View style={styles.objectField}>{Array.from({ length: question.visualCount }, (_, i) => <View key={i} style={styles.countObject} />)}</View> : null}
          <Text style={styles.checkPrompt}>{question.prompt}</Text>
          <OptionRow
            options={question.options}
            selectedIndex={answers[questionIndex]}
            disabled={disabled}
            onPick={(index) => setAnswers((prev) => prev.map((value, i) => i === questionIndex ? index : value))}
          />
        </View>
      ))}
      <PrimaryButton label={disabled ? S.lesson.saving : S.lesson.done} onPress={() => onSubmit(answers.map((answerIndex) => ({ answerIndex: answerIndex as number, answerPayload: answerIndex })))} disabled={disabled || !ready} />
    </View>
  );
}

function RecoveryGame({ onPick, disabled = false }: { onPick: (index: number) => void; disabled?: boolean }) {
  return <View><View style={styles.recoveryRow}>{[0,1,2].map((x) => <View key={x} style={styles.countObject} />)}</View><HintReveal visible><Text style={styles.sceneText}>هر گروه را یکی‌یکی بشمار.</Text></HintReveal><OptionRow options={['۱', '۲', '۳']} onPick={onPick} disabled={disabled} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { paddingTop: 16, paddingBottom: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exit: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  exitText: { fontSize: 22, fontWeight: '900', color: DS.color.text.muted },
  macroBar: { flex: 1, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 12, borderRadius: 6, backgroundColor: DS.color.border.subtle },
  segmentOn: { backgroundColor: DS.color.brand.violet },
  notice: { backgroundColor: DS.color.brand.secondarySoft, padding: 10, borderRadius: 14, marginBottom: 12 },
  noticeText: { textAlign: 'center', color: DS.color.brand.secondaryDark, fontSize: 12 },
  card: { marginTop: 6 },
  primarySpacing: { marginTop: 18 },
  title: { fontSize: 24, fontWeight: '900', color: DS.color.text.primary, textAlign: 'center' },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 23, color: DS.color.text.secondary, textAlign: 'center' },
  body: { marginTop: 20 },
  story: { fontSize: 17, lineHeight: 27, color: DS.color.text.primary, textAlign: 'center' },
  footnote: { marginTop: 12, color: DS.color.text.muted, textAlign: 'center', fontSize: 11 },
  scene: { alignItems: 'center', padding: 12 },
  numberRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  numberDot: { width: 52, height: 52, borderRadius: 26, backgroundColor: DS.color.brand.primarySoft, borderWidth: 1, borderColor: DS.color.brand.primary, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 22, fontWeight: '900', color: DS.color.brand.primary },
  patternRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 18 },
  patternDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2 },
  dotYellow: { backgroundColor: DS.color.brand.secondarySoft, borderColor: DS.color.brand.secondary },
  dotBlue: { backgroundColor: DS.color.brand.primarySoft, borderColor: DS.color.brand.primary },
  questionMark: { fontSize: 32, fontWeight: '900', color: DS.color.text.primary },
  countObject: { width: 34, height: 34, borderRadius: 17, backgroundColor: DS.color.brand.tealSoft, borderWidth: 2, borderColor: DS.color.brand.teal },
  recoveryRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  sceneText: { marginTop: 12, textAlign: 'center', fontSize: 16, color: DS.color.text.primary, lineHeight: 24 },
  options: { gap: 12 },
  option: { backgroundColor: DS.color.bg.subtle, borderWidth: 1, borderColor: DS.color.border.default, borderRadius: 18, minHeight: 64, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: 28, fontWeight: '800' },
  pattern: { textAlign: 'center', fontSize: 38, marginBottom: 18 },
  objectField: { minHeight: 90, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.color.bg.subtle, borderRadius: 18, marginBottom: 16 },
  recoveryCount: { textAlign: 'center', fontSize: 40, marginBottom: 10 },
  checkCard: { backgroundColor: DS.color.bg.subtle, borderRadius: 18, padding: 12 },
  checkIndex: { fontSize: 12, color: DS.color.text.muted, textAlign: 'center', marginBottom: 6 },
  checkPrompt: { fontSize: 16, color: DS.color.text.primary, textAlign: 'center', marginBottom: 10 },
  resultBig: { textAlign: 'center', fontSize: 58, marginVertical: 8 },
  resultText: { textAlign: 'center', fontSize: 15, color: DS.color.text.secondary },
});
