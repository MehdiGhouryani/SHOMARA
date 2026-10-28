import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/mobile/src/game-feel/feedback.ts',
  'apps/mobile/src/game-feel/GameFeelController.ts',
  'apps/mobile/src/game-feel/useGameFeel.ts',
  'apps/mobile/src/game-feel/TactileChoice.tsx',
  'apps/mobile/src/game-feel/FeedbackBurst.tsx',
  'apps/mobile/src/game-feel/DragDropController.ts',
  'apps/mobile/src/game-feel/DraggableToken.tsx',
  'apps/mobile/src/game-feel/GameFeelController.test.ts',
  'apps/mobile/src/game-feel/RevealPrimitives.tsx',
  'apps/mobile/src/game-feel/RevealPrimitives.test.tsx',
  'apps/mobile/src/animation/useAnimationController.ts',
  'apps/mobile/src/components/AnimatedCharacter.tsx',
  'apps/mobile/src/game-feel/ProgressFill.tsx',
  'apps/mobile/src/game-feel/feedbackEffects.ts',
  'apps/mobile/src/game-feel/haptics.ts',
  'apps/mobile/src/game-feel/haptics.test.ts',
  'packages/contracts/src/game-feel.ts',
  'packages/contracts/src/game-feel.test.ts',
];
const forbiddenForks = [
  'apps/mobile/src/animation/feedback.ts',
  'apps/mobile/src/animation/FeedbackController.ts',
  'apps/mobile/src/animation/useFeedback.ts',
  'apps/mobile/src/animation/FeedbackPrimitives.tsx',
];
const failures = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing:${file}`);
for (const file of forbiddenForks) if (fs.existsSync(path.join(root, file))) failures.push(`fork:${file}`);
if (failures.length) { console.error(JSON.stringify({ phase: 'P03-GAME-FEEL', status: 'FAIL', failures }, null, 2)); process.exit(1); }
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const feedback = read('packages/contracts/src/game-feel.ts');
const mobileFeedback = read('apps/mobile/src/game-feel/feedback.ts');
const contractAnimation = read('packages/contracts/src/animation.ts');
const effects = read('apps/mobile/src/game-feel/feedbackEffects.ts');
const progressFill = read('apps/mobile/src/game-feel/ProgressFill.tsx');
const chrome = read('apps/mobile/src/station/LessonPlayerChrome.tsx');
const gameFeelHook = read('apps/mobile/src/game-feel/useGameFeel.ts');
const webModal = read('apps/web/components/DuolingoLessonModal.tsx');
const webCompanion = read('apps/web/components/InteractiveCompanion.tsx');
const animationIndex = read('apps/mobile/src/animation/index.ts');
const controller = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/GameFeelController.ts'), 'utf8');
const hook = fs.readFileSync(path.join(root, 'apps/mobile/src/animation/useAnimationController.ts'), 'utf8');
const character = fs.readFileSync(path.join(root, 'apps/mobile/src/components/AnimatedCharacter.tsx'), 'utf8');
const station = fs.readFileSync(path.join(root, 'apps/mobile/src/station/StationFlow.tsx'), 'utf8');
const tactile = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/TactileChoice.tsx'), 'utf8');
const draggable = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/DraggableToken.tsx'), 'utf8');
const motion = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/motionPreferences.ts'), 'utf8');
const drag = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/DragDropController.ts'), 'utf8');
const reveal = fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/RevealPrimitives.tsx'), 'utf8');
const ds = fs.readFileSync(path.join(root, 'apps/mobile/src/ui/design-system/components.tsx'), 'utf8');
const checks = {
  calmCorrectFeedback: feedback.includes("ANSWER_CORRECT: spec({ tone: 'POSITIVE', characterState: 'CORRECT'") && feedback.includes('durationMs: 650'),
  wrongIsEncouragement: feedback.includes("ANSWER_WRONG: spec({ tone: 'ENCOURAGE', characterState: 'ENCOURAGE'") && !feedback.includes("ANSWER_WRONG: spec({ tone: 'CELEBRATE'"),
  nearMissIsEncouragement: contractAnimation.includes("NEAR_MISS: 'ENCOURAGE'") && feedback.includes("NEAR_MISS: spec({ tone: 'ENCOURAGE'"),
  celebrationIsMeaningful: feedback.includes("STATION_PASS: spec({ tone: 'CELEBRATE'") && feedback.includes("MILESTONE: spec({ tone: 'CELEBRATE'") && feedback.includes("REWARD_GRANTED: spec({ tone: 'CELEBRATE'"),
  celebrationBlocksInput: feedback.includes("STATION_PASS: spec({ tone: 'CELEBRATE', characterState: 'CELEBRATE', motion: 'CELEBRATE', durationMs: 1400, blocksInput: true"),
  feedbackSemanticsSharedViaContracts: mobileFeedback.includes("from '@math/contracts'") && !mobileFeedback.includes('FEEDBACK_BY_EVENT: Readonly') && !animationIndex.includes('Feedback'),
  silentAndReducedVariantsResolved: feedback.includes('export function resolveFeedbackPresentation') && feedback.includes("channels.sound ? s.audioCue : 'NONE'") && feedback.includes("channels.reducedMotion ? 'NONE' : s.motion") && feedback.includes("channels.haptics ? s.haptic : 'NONE'"),
  hapticsRespectPreference: effects.includes('resolveFeedbackPresentation') && effects.includes('Vibration.vibrate') && effects.includes('announceForAccessibility'),
  dispatchStaysStable: gameFeelHook.includes('playRef.current') && gameFeelHook.includes('}, [controller]);'),
  stationHasNoBrokenFeedbackFork: !station.includes('feedback.emit') && !station.includes('FeedbackOverlay') && !station.includes('feedback.clear') && station.includes('semanticEventForOutcome(outcome)'),
  stationUsesHintReveal: station.includes('<HintReveal visible>'),
  webSharesOutcomeSemantics: webModal.includes('semanticEventForOutcome') && webCompanion.includes("case 'NEAR_MISS':"),
  progressFillRespectsReducedMotion: progressFill.includes('useReducedMotionPreference') && progressFill.includes('reducedMotion || !increasing') && chrome.includes('<ProgressFill '),
  nearMissDrop: drag.includes("'NEAR_MISS'") && drag.includes('feedbackEventForDrop') && draggable.includes('feedbackEventForDrop(result)'),
  tactileChoice: station.includes('TactileChoice') && station.includes('<TactileChoice'),
  transientOverlay: station.includes('<FeedbackBurst feedback={feedback} />'),
  stableAnimationDispatch: hook.includes('useCallback') && hook.includes('[controller]'),
  reducedMotion: motion.includes('isReduceMotionEnabled') && motion.includes('preferences.motion'),
  interactivePrimitivesRespectReducedMotion: tactile.includes('channels.reducedMotion') && tactile.includes('!reducedMotion') && draggable.includes('channels.reducedMotion') && draggable.includes('reducedMotion ? 0'),
  noPunitiveWrongAnimation: character.includes("case 'ENCOURAGE':") && !character.includes("case 'ANSWER_WRONG': shake"),
  feedbackSurvivesSilentTransition: controller.includes('shouldPreserveVisibleReaction') && controller.includes('!nextSpec.message') && controller.includes('latestEventState'),
  celebrationActuallyBlocksInput: fs.readFileSync(path.join(root, 'apps/mobile/src/game-feel/useGameFeel.ts'), 'utf8').includes('inputBlocked: Boolean(snapshot.feedback?.blocksInput') && station.includes('inputBlocked'),
  testsPresent: fs.existsSync(path.join(root, 'packages/contracts/src/game-feel.test.ts')) && fs.existsSync(path.join(root, 'apps/mobile/src/game-feel/haptics.test.ts')) && fs.existsSync(path.join(root, 'apps/mobile/src/game-feel/GameFeelController.test.ts')) && fs.existsSync(path.join(root, 'apps/mobile/src/game-feel/feedback.test.ts')) && fs.existsSync(path.join(root, 'apps/mobile/src/game-feel/DragDropController.test.ts')),
  dragDropPrimitive: drag.includes('evaluateDrop') && drag.includes('pointInsideRect') && drag.includes("return canAccept ? 'ACCEPTED' : 'REJECTED'") && fs.existsSync(path.join(root, 'apps/mobile/src/game-feel/DraggableToken.tsx')),
  revealPrimitives: ['RevealPanel', 'RewardReveal', 'BadgeReveal', 'UnlockReveal', 'HintReveal'].every((name) => reveal.includes(`export function ${name}`)) && reveal.includes('useFeedbackEffects') && reveal.includes('feedbackEvent="REWARD_REVEAL"') && reveal.includes('feedbackEvent="HINT_REVEAL"'),
  // D-021 (2026-10-28): shared primitives are the V2 kit now; the intent (no ad-hoc buttons/surfaces,
  // one named PrimaryButton wrapper) is unchanged.
  stationUsesSharedSurfaceButton: station.includes('ClaySurface') && station.includes('<Button label={label}') && station.includes('function PrimaryButton(') && station.includes("variant={secondary ? 'ghost' : 'primary'}"),
  stationUsesRewardReveal: station.includes('<RewardReveal visible={stationPassAchieved} />'),
  progressPrimitiveShared: progressFill.includes('export function ProgressFill') && progressFill.includes('accessibilityRole="progressbar"'),
};
for (const [name, ok] of Object.entries(checks)) if (!ok) failures.push(`check:${name}`);
const result = { phase: 'P03-GAME-FEEL', status: failures.length ? 'FAIL' : 'PASS', checks, failures };
if (failures.length) { console.error(JSON.stringify(result, null, 2)); process.exit(1); }
console.log(JSON.stringify(result, null, 2));
