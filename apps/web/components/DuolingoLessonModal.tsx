'use client';

import React, { useState, useEffect, useId } from 'react';
import { CHARACTERS, toPersianDigits } from '../lib/persian';
import { CHILD_ACHIEVEMENTS } from '@math/contracts';
import { soundFx } from '../lib/sound';
import { InteractiveTallyMarks } from './InteractiveTallyMarks';
import { WonderGrid } from './WonderGrid';
import { SymmetryMirror } from './SymmetryMirror';
import { ComparisonScale } from './ComparisonScale';
import { InteractiveCompanion } from './InteractiveCompanion';
import { CharacterArt } from './CharacterArt';
import type { PathNodeItem } from './DuolingoPath';
import type { AnimationSemanticEvent, LessonStage } from '@math/contracts';
import { semanticEventForOutcome } from '@math/contracts';
import { LessonFeedback, LessonPlayerHeader } from './LessonPlayerShell';
import {
  type SessionResponse,
  type EncounterResponse,
  type SubmitAttemptResponse,
} from '../lib/learning-api-client';
import { learningService } from '../lib/learningService';
import { lessonGuideFor } from '../lib/characterScenes';

interface DuolingoLessonModalProps {
  onClose: () => void;
  activeCharId: string;
  activeNode: PathNodeItem;
  onEmitSemanticEvent: (event: AnimationSemanticEvent, detail: string) => void;
  onCompleteNode: (nodeId: string, result?: any) => void;
}

type EvaluationState = 'UNCHECKED' | 'CORRECT' | 'WRONG' | 'FINISHED';

export function DuolingoLessonModal({
  onClose,
  activeCharId,
  activeNode,
  onEmitSemanticEvent,
  onCompleteNode,
}: DuolingoLessonModalProps) {
  const activeChar = CHARACTERS[activeCharId] ?? CHARACTERS['aria']!;
  // Character guidance stays contextual; assessment states must remain character-free.
  const guideId = lessonGuideFor(activeChar.id, activeNode.type);
  const guideChar = guideId ? CHARACTERS[guideId] ?? activeChar : null;

  const [evaluation, setEvaluation] = useState<EvaluationState>('UNCHECKED');

  // Server Integration State
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [encounter, setEncounter] = useState<EncounterResponse | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastServerResult, setLastServerResult] = useState<SubmitAttemptResponse | null>(null);
  const [serverStationPassed, setServerStationPassed] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<AnimationSemanticEvent>('SESSION_START');

  // Exercise states
  // 1. COUNT
  const [tappedCountItems, setTappedCountItems] = useState<number[]>([]);
  const [selectedCountNum, setSelectedCountNum] = useState<number | null>(null);

  // 2. PATTERN
  const [selectedPatternColor, setSelectedPatternColor] = useState<string | null>(null);

  // 3. WONDER_GRID
  const [isGridSolved, setIsGridSolved] = useState<boolean>(false);

  // 4. TALLY
  const [tallyCount, setTallyCount] = useState<number>(0);

  // 5. CHECK
  const [selectedSeqNum, setSelectedSeqNum] = useState<number | null>(null);

  // 6. SYMMETRY
  const [isSymmetrySolved, setIsSymmetrySolved] = useState<boolean>(false);

  // 7. SCALE
  const [isScaleSolved, setIsScaleSolved] = useState<boolean>(false);

  const stationAchievement = CHILD_ACHIEVEMENTS.find((item) => item.stationId === activeNode.stationId) ?? null;

  // Initialize Session & Encounter on mount
  useEffect(() => {
    let isMounted = true;
    async function initLearningEncounter() {
      try {
        const { session: newSession, encounter: newEncounter } =
          await learningService.initiateEncounterForNode(activeNode.id);

        if (!isMounted) return;
        setSession(newSession);
        setEncounter(newEncounter);
        setAttemptNumber(1);
        onEmitSemanticEvent('SESSION_START', `Session=${newSession.id}, Encounter=${newEncounter.id}`);
      } catch (err) {
        setSubmitMessage('ارتباط با سرور برقرار نشد. پاسخ بدون تأیید سرور ثبت نمی‌شود.');
      }
    }

    initLearningEncounter();
    return () => {
      isMounted = false;
    };
  }, [activeNode.id, activeNode.stepNumber, activeNode.type]);

  function toggleFruitTap(index: number) {
    soundFx.playBubblePop();
    if (tappedCountItems.includes(index)) {
      setTappedCountItems(tappedCountItems.filter((i) => i !== index));
    } else {
      setTappedCountItems([...tappedCountItems, index]);
    }
  }

  async function handleCheck() {
    setIsSubmitting(true);
    setSubmitMessage(null);
    let userAnswerPayload: unknown = null;

    if (activeNode.type === 'COUNT') {
      userAnswerPayload = selectedCountNum;
    } else if (activeNode.type === 'PATTERN') {
      userAnswerPayload = selectedPatternColor;
    } else if (activeNode.type === 'WONDER_GRID') {
      userAnswerPayload = isGridSolved;
    } else if (activeNode.type === 'TALLY') {
      userAnswerPayload = tallyCount;
    } else if (activeNode.type === 'SYMMETRY') {
      userAnswerPayload = isSymmetrySolved;
    } else if (activeNode.type === 'SCALE') {
      userAnswerPayload = isScaleSolved;
    } else if (activeNode.type === 'CHECK') {
      userAnswerPayload = selectedSeqNum;
    }

    try {
      if (!session || !encounter) {
        setSubmitMessage('پاسخ هنوز به سرور نرسیده است. اتصال را بررسی کن.');
        return;
      }
      const idempotencyKey = `attempt-${session.id}-${encounter.id}-${attemptNumber}`;
      const result = await learningService.submitAttempt({
        sessionId: session.id,
        encounterId: encounter.id,
        userAnswer: userAnswerPayload,
        customIdempotencyKey: idempotencyKey,
      });

      setAttemptNumber((value) => value + 1);
      setLastServerResult(result);
      setServerStationPassed(Boolean(result.stationPass));
      const isServerCorrect = Boolean(result.attempt?.evaluation?.correct || result.semanticEvent === 'ANSWER_CORRECT');

      if (isServerCorrect) {
        soundFx.playSuccess();
        setCurrentEvent('ANSWER_CORRECT');
        onEmitSemanticEvent('ANSWER_CORRECT', `ServerScore=${result.attempt?.evaluation?.score ?? 0}`);
        setEvaluation('CORRECT');
        if (result.stationPass) {
          setCurrentEvent('STATION_PASS');
          onEmitSemanticEvent('STATION_PASS', 'StationPassGrantedByServer');
        }
      } else {
        soundFx.playTryAgain();
        if (result.decision?.selectedStep === 'RECOVERY') {
          setCurrentEvent('RECOVERY');
          onEmitSemanticEvent('RECOVERY', `LearningRuntime.triggerRecovery(Step=${result.decision.selectedStep})`);
        } else {
          // Same outcome → semantic mapping as Android (partial credit = near miss).
          const tryAgainEvent = semanticEventForOutcome({ correct: false, score: result.attempt?.evaluation?.score ?? 0 });
          setCurrentEvent(tryAgainEvent);
          onEmitSemanticEvent(tryAgainEvent, 'LearningRuntime.evalTryAgain');
        }
        setEvaluation('WRONG');
      }
    } catch (err) {
      setSubmitMessage('پاسخ به سرور نرسید. بعد از اتصال دوباره تلاش کن.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleContinue() {
    soundFx.playTap();
    if (evaluation === 'CORRECT') {
      setEvaluation('FINISHED');
      soundFx.playLevelPass();
      if (serverStationPassed) {
        setCurrentEvent('STATION_PASS');
        onEmitSemanticEvent('STATION_PASS', `Runtime.passStation(${activeNode.id})`);
      } else {
        onEmitSemanticEvent('ANSWER_CORRECT', `Runtime.passNode(${activeNode.id})`);
      }
    } else {
      setEvaluation('UNCHECKED');
      setCurrentEvent('SESSION_START');
    }
  }

  function handleOptionSelect(exerciseType: string, choiceValue: unknown, onSelect: () => void) {
    soundFx.playBubblePop();
    onSelect();
  }

  const isCheckDisabled =
    (activeNode.type === 'COUNT' && selectedCountNum === null) ||
    (activeNode.type === 'PATTERN' && selectedPatternColor === null) ||
    (activeNode.type === 'WONDER_GRID' && !isGridSolved) ||
    (activeNode.type === 'TALLY' && tallyCount === 0) ||
    (activeNode.type === 'SYMMETRY' && !isSymmetrySolved) ||
    (activeNode.type === 'SCALE' && !isScaleSolved) ||
    (activeNode.type === 'CHECK' && selectedSeqNum === null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--ds-bg-canvas)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        touchAction: 'pan-y',
      }}
    >
      <LessonPlayerHeader
        stage={(() => {
          if (evaluation === 'FINISHED') return 'RESULT' as LessonStage;
          if (currentEvent === 'RECOVERY') return 'RECOVERY' as LessonStage;
          if (activeNode.type === 'CHECK') return 'CHECK_A' as LessonStage;
          if (activeNode.type === 'COUNT' || activeNode.type === 'TALLY') return 'GAME_COUNT' as LessonStage;
          if (activeNode.type === 'PATTERN' || activeNode.type === 'WONDER_GRID' || activeNode.type === 'SYMMETRY' || activeNode.type === 'SCALE') return 'GAME_PATTERN' as LessonStage;
          return 'GUIDED' as LessonStage;
        })()}
        progress={evaluation === 'FINISHED' ? 100 : Math.max(8, Math.min(92, activeNode.stepNumber ? activeNode.stepNumber * 10 : 24))}
        onExit={() => { soundFx.playTap(); onClose(); }}
      />

      {/* Main Body */}
      {evaluation !== 'FINISHED' ? (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 22px 150px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'auto',
            touchAction: 'pan-y',
          }}
        >
          {/* Companion Mascot with Semantic Animation. Character bible v2 §5: no guide on assessment (CHECK); guide picked per allowedScenes */}
          {guideChar && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <InteractiveCompanion
              characterId={guideChar.id}
              semanticEvent={currentEvent}
              size="sm"
              showBubble={true}
              customMessage={
                evaluation === 'CORRECT'
                  ? guideChar.reactions.correct
                  : evaluation === 'WRONG'
                  ? currentEvent === 'RECOVERY'
                    ? guideChar.reactions.recovery
                    : guideChar.reactions.wrong
                  : activeNode.type === 'COUNT'
                  ? 'پرتقال‌ها را لمس کن و بشمار؛ چند تا در سبد هست؟'
                  : activeNode.type === 'PATTERN'
                  ? 'قطار رنگ‌ها را ببین! جای علامت سؤال کدام رنگ می‌آید؟'
                  : activeNode.type === 'WONDER_GRID'
                  ? 'جدول شگفت‌انگیز را بدون رنگ تکراری در هر سطر و ستون کامل کن!'
                  : activeNode.type === 'TALLY'
                  ? 'به تعداد پرتقال‌ها چوب‌خط بکش! خط پنجم کج کشیده می‌شود.'
                  : activeNode.type === 'SYMMETRY'
                  ? 'نیمه سمت راست فرش را قرینه سمت چپ رنگ‌آمیزی کن!'
                  : activeNode.type === 'SCALE'
                  ? 'دو دسته میوه را مقایسه کن و علامت درست را بگذار!'
                  : 'سنجش مستقل: عدد بعدی دنباله ۲، ۴، ۶ چیست؟'
              }
            />
          </div>
          )}

          {/* 1. COUNT EXERCISE */}
          {activeNode.type === 'COUNT' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '2px solid #fde68a',
                  borderRadius: 22,
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                  width: '100%',
                  marginBottom: 24,
                  position: 'relative',
                  zIndex: 5,
                }}
              >
                {[1, 2, 3, 4, 5].map((idx) => {
                  const isTapped = tappedCountItems.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        toggleFruitTap(idx);
                      }}
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: '50%',
                        backgroundColor: isTapped ? '#ffedd5' : '#ffffff',
                        border: isTapped ? '3px solid #f97316' : '2px dashed #fed7aa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        cursor: 'pointer',
                        transform: isTapped ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        position: 'relative',
                        zIndex: 5,
                      }}
                    >
                      🍊
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12,
                  width: '100%',
                  position: 'relative',
                  zIndex: 5,
                }}
              >
                {[3, 4, 5, 6].map((num) => {
                  const isSelected = selectedCountNum === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleOptionSelect('COUNT', num, () => setSelectedCountNum(num))}
                      className={`math-choice-card ${isSelected ? 'selected' : ''}`}
                      style={{
                        fontSize: 24,
                        padding: '16px 0',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        position: 'relative',
                        zIndex: 5,
                      }}
                    >
                      {toPersianDigits(num)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PATTERN EXERCISE */}
          {activeNode.type === 'PATTERN' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: 24,
                  padding: '24px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  marginBottom: 24,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 4px 0 #1d4ed8' }} />
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#facc15', boxShadow: '0 4px 0 #ca8a04' }} />
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 4px 0 #1d4ed8' }} />
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#facc15', boxShadow: '0 4px 0 #ca8a04' }} />
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '3px dashed #94a3b8',
                    backgroundColor:
                      selectedPatternColor === 'blue'
                        ? '#3b82f6'
                        : selectedPatternColor === 'yellow'
                        ? '#facc15'
                        : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  {!selectedPatternColor && '❓'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, width: '100%', position: 'relative', zIndex: 5 }}>
                <button
                  type="button"
                  onClick={() => handleOptionSelect('PATTERN', 'blue', () => setSelectedPatternColor('blue'))}
                  className={`math-choice-card ${selectedPatternColor === 'blue' ? 'selected' : ''}`}
                  style={{
                    flex: 1,
                    gap: 8,
                    fontSize: 16,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    position: 'relative',
                    zIndex: 5,
                  }}
                >
                  <span style={{ fontSize: 24 }}>🔵</span>
                  <span>دایره آبی</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOptionSelect('PATTERN', 'yellow', () => setSelectedPatternColor('yellow'))}
                  className={`math-choice-card ${selectedPatternColor === 'yellow' ? 'selected' : ''}`}
                  style={{
                    flex: 1,
                    gap: 8,
                    fontSize: 16,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    position: 'relative',
                    zIndex: 5,
                  }}
                >
                  <span style={{ fontSize: 24 }}>🟡</span>
                  <span>دایره زرد</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. WONDER GRID EXERCISE */}
          {activeNode.type === 'WONDER_GRID' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <WonderGrid onSuccess={() => {
                soundFx.playSuccess();
                setIsGridSolved(true);
              }} />
            </div>
          )}

          {/* 4. TALLY EXERCISE */}
          {activeNode.type === 'TALLY' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '2px solid #fde68a',
                  borderRadius: 22,
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                  width: '100%',
                  marginBottom: 20,
                }}
              >
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} style={{ fontSize: 36 }}>🍊</div>
                ))}
              </div>
              <InteractiveTallyMarks count={tallyCount} maxCount={8} onChangeCount={(newCount) => {
                setTallyCount(newCount);
              }} />
            </div>
          )}

          {/* 5. SYMMETRY EXERCISE */}
          {activeNode.type === 'SYMMETRY' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <SymmetryMirror onSuccess={() => {
                soundFx.playSuccess();
                setIsSymmetrySolved(true);
              }} />
            </div>
          )}

          {/* 6. SCALE EXERCISE */}
          {activeNode.type === 'SCALE' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <ComparisonScale
                leftCount={4}
                rightCount={2}
                leftItem="🍎"
                rightItem="🍐"
                onCorrect={() => {
                  soundFx.playSuccess();
                  setIsScaleSolved(true);
                }}
              />
            </div>
          )}

          {/* 7. CHECK EXERCISE */}
          {activeNode.type === 'CHECK' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
              <div
                style={{
                  backgroundColor: '#eef2ff',
                  border: '2px solid #c7d2fe',
                  borderRadius: 24,
                  padding: '24px 20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 28,
                  fontWeight: 900,
                  width: '100%',
                  marginBottom: 28,
                  direction: 'rtl',
                }}
              >
                <span>{toPersianDigits(2)}</span>
                <span>،</span>
                <span>{toPersianDigits(4)}</span>
                <span>،</span>
                <span>{toPersianDigits(6)}</span>
                <span>،</span>
                <span style={{ borderBottom: '4px solid #3b52d4', minWidth: 40, textAlign: 'center', color: '#3b52d4' }}>
                  {selectedSeqNum ? toPersianDigits(selectedSeqNum) : '؟'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12,
                  width: '100%',
                  position: 'relative',
                  zIndex: 5,
                }}
              >
                {[7, 8, 9, 10].map((num) => {
                  const isSelected = selectedSeqNum === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleOptionSelect('CHECK_SEQUENCE', num, () => setSelectedSeqNum(num))}
                      className={`math-choice-card ${isSelected ? 'selected' : ''}`}
                      style={{
                        fontSize: 24,
                        padding: '16px 0',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        position: 'relative',
                        zIndex: 5,
                      }}
                    >
                      {toPersianDigits(num)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD VICTORY SCREEN */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
          }}
        >
          {serverStationPassed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CharacterArt id="jiko" state="celebrate" size={84} label="جشن پایان ایستگاه" />
            </div>
          ) : null}
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#10b981', margin: '0 0 8px' }}>
            {serverStationPassed ? 'ایستگاه کامل شد!' : `${activeNode.title} کامل شد!`}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            {serverStationPassed
              ? stationAchievement ? `دستاورد «${stationAchievement.title}» در بخش «من» ثبت شد.` : 'دستاورد این ایستگاه در بخش «من» ثبت شد.'
              : lastServerResult?.decision?.selectedStep === 'RECOVERY'
              ? 'یک تمرین راهنما برایت آماده شده است.'
              : lastServerResult?.decision?.selectedStep === 'RECHECK'
              ? 'یک بررسی دوباره برایت آماده شده است.'
              : 'قدم بعدی مسیر آماده است.'}
          </p>


          <button
            type="button"
            onClick={() => {
              soundFx.playTap();
              onCompleteNode(activeNode.id, lastServerResult);
              onClose();
            }}
            className="math-btn-success"
            style={{ width: '100%', padding: '16px 0', fontSize: 17, cursor: 'pointer', pointerEvents: 'auto', touchAction: 'manipulation' }}
          >
            ادامه مسیر یادگیری
          </button>
        </div>
      )}

      {evaluation !== 'FINISHED' ? (
        <LessonFeedback
          state={submitMessage ? 'ERROR' : evaluation === 'CORRECT' ? 'CORRECT' : evaluation === 'WRONG' ? (currentEvent === 'RECOVERY' ? 'RECOVERY' : 'TRY_AGAIN') : isSubmitting ? 'CHECKING' : 'IDLE'}
          title={submitMessage ? 'پاسخ فعلاً ثبت نشد' : evaluation === 'CORRECT' ? 'آفرین، پاسخ درست بود.' : evaluation === 'WRONG' ? 'اشکالی ندارد؛ یک مسیر بهتر داریم.' : 'پاسخت را بررسی کن'}
          text={submitMessage ?? (evaluation === 'WRONG'
            ? activeNode.type === 'COUNT'
              ? 'یک بار دیگر تعداد را با آرامش بررسی کن.'
              : activeNode.type === 'PATTERN'
              ? 'قانون تکرار را پیدا کن و دوباره انتخاب کن.'
              : activeNode.type === 'CHECK'
              ? 'این مرحله سنجش است؛ یک پاسخ دقیق را انتخاب کن.'
              : 'راهنمایی را ببین و دوباره تلاش کن.'
            : isSubmitting ? 'داریم نتیجه را از موتور یادگیری می‌گیریم.' : undefined)}
          actionLabel={submitMessage ? 'دوباره تلاش کن' : evaluation === 'UNCHECKED' ? 'بررسی پاسخ' : evaluation === 'CORRECT' ? 'ادامه' : 'تلاش دوباره'}
          onAction={submitMessage ? () => setSubmitMessage(null) : evaluation === 'UNCHECKED' ? () => void handleCheck() : handleContinue}
          disabled={isSubmitting || (evaluation === 'UNCHECKED' && isCheckDisabled)}
          statusText={lastServerResult ? `نتیجه از سرور دریافت شد · ${lastServerResult.attempt?.evaluation?.score ?? 0}/${lastServerResult.attempt?.evaluation?.maxScore ?? 1}` : undefined}
        />
      ) : null}
    </div>
  );
}
