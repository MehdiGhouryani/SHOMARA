import { View } from 'react-native';
import { PracticeView } from '../../src/practice/views/PracticeView';
import { MeView } from '../../src/profile/views/MeView';

/**
 * The real practice and me views with the sample copy of pages 13 and 14. The specimen pads the bottom with
 * the page's own tab-bar height (84) so the body sits exactly like the golden's; the comparison region is
 * `.body` only (the app's real tab bar is the outlined one of the path page, D-011, so the bar itself is
 * deliberately outside the pixel comparison — U-Q9).
 */
const TABS_H = 84;
const noop = () => undefined;

export const PracticeTab = () => (
  <View style={{ height: 844 }}>
    <PracticeView
      title="تمرین"
      guideLabel="فندق، سنجاب سازنده"
      guideText="بیا مهارتت را قوی کنیم."
      rows={[
        { id: 'a', title: 'شمارش تا ۱۰', kicker: '۵ سؤال', icon: 'bolt', locked: false },
        { id: 'b', title: 'جمع ساده', kicker: '۵ سؤال', icon: 'bolt', locked: false },
        { id: 'c', title: 'الگوها', kicker: 'بعد از مرحلهٔ ۳ باز می‌شود', icon: 'lock', locked: true },
      ]}
      chipLabel="تمرین"
      startLabel="شروع تمرین"
      onStart={noop}
    />
    <View style={{ height: TABS_H }} />
  </View>
);

export const MeTab = () => (
  <View style={{ height: 844 }}>
    <MeView
      settingsLabel="تنظیمات"
      onSettings={noop}
      avatarIcon="sun"
      avatarLabel="نیما"
      name="نیما"
      gradeLabel="پایهٔ اول"
      progressLabel="۰ از ۲۵ ایستگاه"
      progress={0}
      progressFieldLabel="پیشرفت"
      achievementsFieldLabel="دستاوردها"
      achievementsA11y="دستاوردها"
      achievements={[
        { id: 'A01', title: 'شمارش‌گر', kicker: 'ایستگاه ۱ را کامل کن', unlocked: false },
        { id: 'A02', title: 'جهت‌یاب', kicker: 'ایستگاه ۲ را کامل کن', unlocked: false },
        { id: 'A03', title: 'عددساز', kicker: 'ایستگاه ۳ را کامل کن', unlocked: false },
      ]}
      actions={[]}
      onAction={noop}
    />
    <View style={{ height: TABS_H }} />
  </View>
);
