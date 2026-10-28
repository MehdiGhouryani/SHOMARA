/**
 * Persian localization and formatting utilities for Math Learning Platform
 */

export { toPersianDigits, toEnglishDigits } from '@math/design-system';

export interface GradeMeta {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  active: boolean;
  stationCount: number;
  description: string;
  color: string;
}

export const GRADES: GradeMeta[] = [
  {
    id: 'G1',
    code: 'grade-1',
    title: 'پایه اول ابتدایی',
    subtitle: 'شمارش، الگوها، جمع و تفریق تا ۲۰',
    active: true,
    stationCount: 25,
    description: '۲۵ ایستگاه آموزشی، ۶۴ مهارت پایه‌ای با همراهی ۴ شخصیت تعاملی',
    color: '#3B82F6',
  },
  {
    id: 'G2',
    code: 'grade-2',
    title: 'پایه دوم ابتدایی',
    subtitle: 'اعداد سه‌رقمی، جمع و تفریق فرآیندی',
    active: true,
    stationCount: 28,
    description: '۲۸ ایستگاه آموزشی، مهارت‌های پایه‌ای با همراهی شخصیت‌های تعاملی',
    color: '#10B981',
  },
  {
    id: 'G3',
    code: 'grade-3',
    title: 'پایه سوم ابتدایی',
    subtitle: 'جدول ضرب، تقسیم، کسر و محیط',
    active: true,
    stationCount: 30,
    description: '۳۰ ایستگاه آموزشی، جدول ضرب و تفکر منطقی',
    color: '#F59E0B',
  },
  {
    id: 'G4',
    code: 'grade-4',
    title: 'پایه چهارم ابتدایی',
    subtitle: 'اعداد بزرگ، ضرب چندرقمی، زاویه و مساحت',
    active: true,
    stationCount: 32,
    description: '۳۲ ایستگاه آموزشی، محاسبات و هندسه',
    color: '#8B5CF6',
  },
  {
    id: 'G5',
    code: 'grade-5',
    title: 'پایه پنجم ابتدایی',
    subtitle: 'عملیات کسرها، اعداد اعشاری، تقارن و حجم',
    active: true,
    stationCount: 32,
    description: '۳۲ ایستگاه آموزشی، مفاهیم پیشرفته',
    color: '#EC4899',
  },
  {
    id: 'G6',
    code: 'grade-6',
    title: 'پایه ششم ابتدایی',
    subtitle: 'کسر، اعشار، نسبت و تناسب، درصد و آمار',
    active: true,
    stationCount: 34,
    description: '۳۴ ایستگاه آموزشی، آمادگی برای دوره اول متوسطه',
    color: '#06B6D4',
  },
];

export interface CompanionCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarBg: string;
  themeColor: string;
  personality: string;
  reactions: {
    idle: string;
    correct: string;
    wrong: string;
    hint: string;
    recovery: string;
    pass: string;
  };
}

export const CHARACTERS: Record<string, CompanionCharacter> = {
  aria: {
    id: 'aria',
    name: 'آریا',
    role: 'راهنمای اصلی و دوست صمیمی',
    description: 'بچه‌اژدهای تپل فیروزه‌ای با شکم زعفرانی؛ هنوز آتش زدن بلد نیست و وقتی ذوق می‌کند جرقهٔ ستاره‌ای عطسه می‌کند.',
    avatarBg: '#E3F4F3',
    themeColor: '#218B92',
    personality: 'پرانرژی، حامی و مهربان',
    reactions: {
      idle: 'آماده‌ای با هم یه قدم جدید برداریم؟',
      correct: 'آفرین قهرمان! دقیقاً درست بود!',
      wrong: 'اصلاً اشکالی نداره، با هم دوباره نگاه می‌کنیم!',
      hint: 'بیا به شکل‌ها خوب دقت کنیم؛ سرنخ اینجاست...',
      recovery: 'خیلی خوب داری تلاش می‌کنی، من کنارتم!',
      pass: 'هورااا! ایستگاه رو با موفقیت فتح کردی!',
    },
  },
  qbo: {
    id: 'qbo',
    name: 'کیوبو',
    role: 'دستیار هوشمند حل مسئله',
    description: 'رباتی که از مکعب‌های شمارش ساخته شده؛ خودش را به مکعب‌ها می‌شکند و دوباره می‌چیند تا عددها دیده شوند.',
    avatarBg: '#FFF4D6',
    themeColor: '#C9850C',
    personality: 'دقیق، متفکر و آرامش‌بخش',
    reactions: {
      idle: 'بیا یکی‌یکی بسازیمش!',
      correct: 'تق! مکعب‌ها درست سر جاشون نشستن.',
      wrong: 'یه بار دیگه یکی‌یکی بشماریم.',
      hint: 'اول دسته‌ها رو جدا کن، بعد بشمار.',
      recovery: 'گام‌های کوچک را مرحله به مرحله طی می‌کنیم.',
      pass: 'یه برج تازه ساختیم!',
    },
  },
  jiko: {
    id: 'jiko',
    name: 'جیکو',
    role: 'همراه شاد و جشن پیروزی',
    description: 'پرندهٔ کوچولوی گرد و آوازخوان با کاکل سه‌پر فنری؛ فقط برای جشن‌های واقعی می‌آید.',
    avatarBg: '#FFE9DF',
    themeColor: '#CF4A26',
    personality: 'شاداب، شوخ‌طبع و پر از انگیزه',
    reactions: {
      idle: 'جیک‌جیک! من جیکو هستم!',
      correct: 'وای محشر بود! درست گرفتی!',
      wrong: 'ایراد نداره؛ باز هم امتحان کن!',
      hint: 'یه نگاه دیگه بنداز؛ من مطمئنم پیداش می‌کنی!',
      recovery: 'آروم آروم، با هم دوباره امتحان می‌کنیم.',
      pass: 'جشن و پایکوبی! آفرین به پشتکارت!',
    },
  },
  dana: {
    id: 'dana',
    name: 'دانا',
    role: 'کاشف طبیعت و الگوها',
    description: 'سنجاب کاشف با ذره‌بین و دم بزرگ راه‌راه که خودش یک الگوی تکرارشونده است.',
    avatarBg: '#F6E9F0',
    themeColor: '#8F3963',
    personality: 'صبور، کاشف و جزئی‌نگر',
    reactions: {
      idle: 'چی دوباره تکرار می‌شه؟ کشفش کنیم!',
      correct: 'الگوی طلایی رو پیدا کردی! عالیه!',
      wrong: 'یه بار دیگه دقیق نگاه کنیم؛ الگو یه جا قایم شده.',
      hint: 'به فاصله‌ها دقت کن؛ هر چند تا تکرار میشه؟',
      recovery: 'آرامش، صبوری و کشف دوباره راه حل.',
      pass: 'نشان طلایی کاشف ریاضی به تو تعلق گرفت!',
    },
  },
};

export interface StationSummary {
  id: string;
  code: string;
  title: string;
  badgeTitle: string;
  stepCount: number;
  skillsCount: number;
  status: 'UNLOCKED' | 'LOCKED' | 'COMPLETED';
  progressPercent: number;
  encounters: Array<{
    id: string;
    step: number;
    title: string;
    subtitle: string;
    type: 'LEARN' | 'GUIDED' | 'PRACTICE' | 'CHECK_1' | 'CHECK_2' | 'RECOVERY' | 'PASS';
    status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  }>;
}

export const GRADE_1_STATIONS: StationSummary[] = [
  {
    id: 'G1-ST01',
    code: 'ST01',
    title: 'شمارش و الگوهای ساده (۰ تا ۱۰)',
    badgeTitle: 'ایستگاه ۰۱',
    stepCount: 6,
    skillsCount: 3,
    status: 'UNLOCKED',
    progressPercent: 40,
    encounters: [
      { id: 'e01', step: 1, title: 'یادگیری تعاملی (Learn)', subtitle: 'دیدن و درک اشیاء، دسته‌ها و نمادها', type: 'LEARN', status: 'COMPLETED' },
      { id: 'e02', step: 2, title: 'تمرین هدایت‌شده (Guided)', subtitle: 'حل مسئله با سرنخ و راهنمایی فعال', type: 'GUIDED', status: 'COMPLETED' },
      { id: 'e03', step: 3, title: 'تمرین مستقل (Practice)', subtitle: 'حل تمرین به تنهایی و تثبیت درک', type: 'PRACTICE', status: 'IN_PROGRESS' },
      { id: 'e04', step: 4, title: 'سنجش مستقل ۱ (Check 1)', subtitle: 'اثبات درک بدون دخالت و سرنخ', type: 'CHECK_1', status: 'LOCKED' },
      { id: 'e05', step: 5, title: 'سنجش مستقل ۲ (Check 2)', subtitle: 'تثبیت و اعتبارسنجی مستقل دوم', type: 'CHECK_2', status: 'LOCKED' },
      { id: 'e06', step: 6, title: 'پایان موفقیت‌آمیز (Pass)', subtitle: 'جشن عبور از ایستگاه و پاداش', type: 'PASS', status: 'LOCKED' },
    ],
  },
  {
    id: 'G1-ST02',
    code: 'ST02',
    title: 'شمارش و تناظر یک‌به‌یک (تا ۱۰)',
    badgeTitle: 'ایستگاه ۰۲',
    stepCount: 6,
    skillsCount: 3,
    status: 'LOCKED',
    progressPercent: 0,
    encounters: [],
  },
  {
    id: 'G1-ST03',
    code: 'ST03',
    title: 'مقایسه دسته‌ها (بیشتر، کمتر، مساوی)',
    badgeTitle: 'ایستگاه ۰۳',
    stepCount: 6,
    skillsCount: 2,
    status: 'LOCKED',
    progressPercent: 0,
    encounters: [],
  },
  {
    id: 'G1-ST04',
    code: 'ST04',
    title: 'شکل‌های هندسی پایه و تقارن',
    badgeTitle: 'ایستگاه ۰۴',
    stepCount: 6,
    skillsCount: 2,
    status: 'LOCKED',
    progressPercent: 0,
    encounters: [],
  },
  {
    id: 'G1-ST05',
    code: 'ST05',
    title: 'مفهوم جمع و ترکیب دسته‌ها (تا ۵)',
    badgeTitle: 'ایستگاه ۰۵',
    stepCount: 6,
    skillsCount: 3,
    status: 'LOCKED',
    progressPercent: 0,
    encounters: [],
  },
];
