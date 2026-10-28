/**
 * Canonical child-facing product surface. This is the post-P08 learner surface:
 * only the surfaces with a clear child job stay visible in primary navigation.
 */
export const PRODUCT_SURFACE_VERSION = '2026-10-03-path-2.1' as const;

export const CHILD_PRIMARY_SURFACES = [
  { id: 'PATH', label: 'مسیر', purpose: 'ادامه مسیر یادگیری و ورود به درس بعدی.' },
  { id: 'PRACTICE', label: 'تمرین', purpose: 'چند بازی کوتاهِ مرتبط با مسیر برای تمرین بیشتر.' },
  { id: 'PROFILE', label: 'من', purpose: 'هویت کودک، پیشرفت خلاصه، دستاوردها و ورود والد.' },
] as const;

export const CHILD_SECONDARY_PROFILE_MENU = [
  { id: 'ACHIEVEMENTS', label: 'دستاوردها', screenId: 'S17' as const, embedded: true },
  { id: 'AVATAR', label: 'تغییر ظاهر', screenId: 'S20' as const },
  { id: 'SETTINGS', label: 'تنظیمات', screenId: 'S21' as const },
  { id: 'PARENT', label: 'والدین', screenId: null, adultGate: true },
] as const;

export const DEFERRED_CHILD_SURFACES = [
  { id: 'SKILLS_LIBRARY', screenId: 'S15', reason: 'به فهرست جداگانه تبدیل نمی‌شود؛ پیشرفت باید داخل مسیر و پروفایل معنا پیدا کند.' },
  { id: 'CONCEPT_REVIEW', screenId: 'S16', reason: 'مرور باید در مسیر و خود تمرین دیده شود، نه به‌عنوان مسیر موازی.' },
  { id: 'AVATAR_WORKSHOP', screenId: 'S20', reason: 'در P08 داخل پروفایل اضافه می‌شود؛ تا آن زمان UI ناتمام نمایش داده نمی‌شود.' },
] as const;

export const ADULT_ONLY_SCREEN_IDS = ['S22', 'S23', 'S24'] as const;

/** Surfaces deliberately removed from the child product shell. */
export const CHILD_REMOVED_SURFACES = [
  'TEACHER_LOGIN',
  'TEACHER_PORTAL',
  'LEADERBOARD',
  'ASSIGNMENTS',
  'FRIENDS_FEED',
  'FRIENDS_GALLERY',
  'COMPANION_GALLERY',
  'ANIMATION_LAB',
  'STREAK_WIDGET',
  'XP_WIDGET',
  'GEMS_WIDGET',
  'DAILY_GOAL_WIDGET',
] as const;

export interface StationPresentation {
  id: string;
  title: string;
  shortLabel: string;
}

export const STATION_PRESENTATION: readonly StationPresentation[] = [
  { id: 'ST01', title: 'شمارش و الگو', shortLabel: 'شمارش و الگو' },
  { id: 'ST02', title: 'جایگاه و جهت', shortLabel: 'جایگاه و جهت' },
  { id: 'ST03', title: 'عدد و جمع', shortLabel: 'عدد و جمع' },
  { id: 'ST04', title: 'شکل‌ها و ویژگی‌ها', shortLabel: 'شکل‌ها و ویژگی‌ها' },
  { id: 'ST05', title: 'جمع و تفریق', shortLabel: 'جمع و تفریق' },
  { id: 'ST06', title: 'جمع با مهره‌ها', shortLabel: 'جمع با مهره‌ها' },
  { id: 'ST07', title: 'عددهای ۱ و ۲', shortLabel: 'عددهای ۱ و ۲' },
  { id: 'ST08', title: 'عددهای ۳ و ۴', shortLabel: 'عددهای ۳ و ۴' },
  { id: 'ST09', title: 'صفر و ۵', shortLabel: 'صفر و ۵' },
  { id: 'ST10', title: 'عددهای ۶ و ۷', shortLabel: 'عددهای ۶ و ۷' },
  { id: 'ST11', title: 'برابری و عدد ۸', shortLabel: 'برابری و عدد ۸' },
  { id: 'ST12', title: 'مقایسه و عدد ۹', shortLabel: 'مقایسه و عدد ۹' },
  { id: 'ST13', title: 'نشانهٔ جمع', shortLabel: 'نشانهٔ جمع' },
  { id: 'ST14', title: 'تفریق و طول', shortLabel: 'تفریق و طول' },
  { id: 'ST15', title: 'گروه‌بندی', shortLabel: 'گروه‌بندی' },
  { id: 'ST16', title: 'ساعت و عددها', shortLabel: 'ساعت و عددها' },
  { id: 'ST17', title: 'جمع چندبخشی', shortLabel: 'جمع چندبخشی' },
  { id: 'ST18', title: 'الگو و زمان', shortLabel: 'الگو و زمان' },
  { id: 'ST19', title: 'ده‌تایی‌ها و خرید', shortLabel: 'ده‌تایی‌ها و خرید' },
  { id: 'ST20', title: 'عددهای دو رقمی', shortLabel: 'عددهای دو رقمی' },
  { id: 'ST21', title: 'عددهای ۱ تا ۱۰۰', shortLabel: 'عددهای ۱ تا ۱۰۰' },
  { id: 'ST22', title: 'تقویم و شمارش', shortLabel: 'تقویم و شمارش' },
  { id: 'ST23', title: 'شمارش گروهی', shortLabel: 'شمارش گروهی' },
  { id: 'ST24', title: 'مسئله‌های چندمرحله‌ای', shortLabel: 'مسئله‌های چندمرحله‌ای' },
  { id: 'ST25', title: 'عدد ۱۰۰', shortLabel: 'عدد ۱۰۰' },
] as const;

export const STATION_HEADER_RULES = {
  eyebrow: 'ایستگاه {number}',
  title: 'station.title',
  meta: '{minutes} دقیقه',
  supportingCopy: null,
  hideLongSubtitleInHeader: true,
  maxTitleWords: 5,
} as const;

export const UNIT_PRESENTATION = {
  id: 'G1-U01',
  title: 'شمارش و الگو',
  shortLabel: 'شمارش و الگو',
} as const;

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  stationId: string;
}

/** Compatibility baseline (first five stations only). Authoritative registry: `G1_ACHIEVEMENT_CATALOG` in collection.ts (P07). */
export const CHILD_ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'A01', title: 'شمارش‌گر', description: 'ایستگاه «شمارش و الگو» را کامل کن.', stationId: 'ST01' },
  { id: 'A02', title: 'جهت‌یاب', description: 'ایستگاه «جایگاه و جهت» را کامل کن.', stationId: 'ST02' },
  { id: 'A03', title: 'عددساز', description: 'ایستگاه «عدد و جمع» را کامل کن.', stationId: 'ST03' },
  { id: 'A04', title: 'شکل‌شناس', description: 'ایستگاه «شکل‌ها و ویژگی‌ها» را کامل کن.', stationId: 'ST04' },
  { id: 'A05', title: 'حسابگر', description: 'ایستگاه «جمع و تفریق» را کامل کن.', stationId: 'ST05' },
] as const;

export function stationPresentationById(stationId: string): StationPresentation | null {
  return STATION_PRESENTATION.find((item) => item.id === stationId) ?? null;
}

export function isAchievementUnlocked(achievement: AchievementDefinition, completedStationIds: readonly string[]) {
  return completedStationIds.includes(achievement.stationId);
}
