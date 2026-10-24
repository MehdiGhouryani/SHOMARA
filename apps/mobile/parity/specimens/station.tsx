import { ChallengeIntroView } from '../../src/station/views/ChallengeIntroView';
import { StageIntroView } from '../../src/station/views/StageIntroView';
import { StageResultView } from '../../src/station/views/StageResultView';
import { QuestionView, type QuestionPhase } from '../../src/station/views/QuestionView';
import { TeachView } from '../../src/station/views/TeachView';

/**
 * The real station views with the data pages 06 and 07 illustrate (sample copy of the pages; the app passes
 * the station's own title, subtitle and minutes through the same props).
 */
const noop = () => undefined;

export const StageIntro = () => (
  <StageIntroView
    stageLabel="مرحله ۱"
    title="شمارش و الگو"
    subtitle="مهره‌ها را می‌شماری و الگو پیدا می‌کنی."
    sectionsLabel="۵ بخش"
    minutesLabel="حدود ۱۰ دقیقه"
    progress={0}
    progressLabel="هنوز بخشی انجام نشده"
    startLabel="شروع"
    backLabel="برگرد به مسیر"
    closeLabel="بستن"
    heroLabel="نامبر، معلم ریاضی، با دست اشاره می‌کند"
    onStart={noop}
    onBack={noop}
    onClose={noop}
  />
);

export const Lesson = () => (
  <TeachView
    caption={{ label: 'کشف می‌کنیم', position: '۱ از ۵' }}
    progress={0.2}
    progressLabel="بخش ۱ از ۵"
    closeLabel="بستن"
    prompt="این سه مهره است."
    beadCount={3}
    beadsLabel="۳ مهره"
    guideLabel="نامبر"
    replayLabel="دوباره بشنو"
    continueLabel="ادامه"
    onReplay={noop}
    onContinue={noop}
    onClose={noop}
  />
);

const question = (phase: QuestionPhase, selectedIndex: number) => (
  <QuestionView
    caption={{ label: 'با هم تمرین می‌کنیم', position: '۲ از ۵' }}
    progress={0.4}
    progressLabel="سؤال ۲ از ۵"
    closeLabel="بستن"
    prompt="چند مهره می‌بینی؟"
    beadCount={4}
    beadsLabel="۴ مهره"
    replayLabel="دوباره بشنو"
    options={['۳', '۴', '۵']}
    selectedIndex={selectedIndex}
    phase={phase}
    checkLabel="بررسی"
    feedbackText={phase === 'correct' ? 'درست است! چهار مهره.' : 'نزدیک بود. یکی‌یکی بشمار.'}
    feedbackActionLabel={phase === 'correct' ? 'ادامه' : 'دوباره امتحان کن'}
    onReplay={noop}
    onSelect={noop}
    onCheck={noop}
    onFeedbackAction={noop}
    onClose={noop}
  />
);

export const Question = () => question('choose', 1);
export const Correct = () => question('correct', 1);
export const Retry = () => question('retry', 2);

export const StageResult = () => (
  <StageResultView
    heroLabel="شخصیت اصلی در حال جشن گرفتن"
    title="آفرین!"
    subtitle="مرحلهٔ «شمارش و الگو» را کامل کردی."
    done={1}
    total={5}
    progressLabel="۱ از ۵ مرحله"
    achievement={{ kicker: 'دستاورد جدید', title: 'شمارش‌گر' }}
    continueLabel="ادامه"
    onContinue={noop}
  />
);

export const ChallengeIntro = () => (
  <ChallengeIntroView
    caption={{ label: 'مهارتت را نشان بده', position: '۵ از ۵' }}
    progress={0.8}
    progressLabel="بخش ۵ از ۵"
    closeLabel="بستن"
    title="مهارتت را نشان بده"
    subtitle="چهار سؤال کوتاه. این بار بدون کمک."
    kindChip="چالش آخر"
    kindChipIcon="trophy"
    questionsChip="۴ سؤال"
    heroLabel="روکا، روباه شجاع، آمادهٔ چالش"
    startLabel="شروع چالش"
    onStart={noop}
    onClose={noop}
  />
);
