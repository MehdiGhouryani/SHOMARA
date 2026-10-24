/**
 * Character bible (SoT §0.2 / §14 / DEC-009).
 *
 * MAIN (brand): Aria — the app's face. Appears on Home, Splash, lesson intros,
 * gentle "try again" moments and the finish screen. The child never picks or
 * swaps her.
 * SUPPORTING (3): appear only inside specific exercises, each with a fixed job,
 * so the child learns "who shows up when":
 *   Qbo  — counting / strategy exercises (the "how do I solve it" helper)
 *   Dana — pattern / shape / space exercises (the explorer)
 *   Jiko — celebration & rewards (the cheerleader)
 * During assessments (Check A/B, mastery) NO character speaks — SoT §10.5.
 */
export type CharacterId = 'aria' | 'qbo' | 'jiko' | 'dana';

export interface Character {
  id: CharacterId;
  name: string;
  tier: 'MAIN' | 'SUPPORTING';
  species: 'baby-dragon' | 'cube-robot' | 'squirrel' | 'songbird';
  color: string;
  bg: string;
  role: string;
  personality: string;
  catchphrase: string;
  lines: { greet: string; hint: string; correct: string; wrong: string; done: string };
}

export const CHARACTERS: Record<CharacterId, Character> = {
  aria: {
    id: 'aria',
    name: 'آریا',
    tier: 'MAIN',
    species: 'baby-dragon',
    color: '#218B92',
    bg: '#E3F4F3',
    role: 'راهنمای اصلی',
    personality: 'بچه‌اژدهای فیروزه‌ای مهربان و صبور؛ هیچ‌وقت عجله نمی‌کند و هیچ‌وقت سرزنش نمی‌کند. هنوز آتش زدن بلد نیست و از ذوق جرقهٔ ستاره‌ای عطسه می‌کند.',
    catchphrase: 'قدم‌به‌قدم با هم!',
    lines: {
      greet: 'سلام! آماده‌ای قدم‌به‌قدم با هم یاد بگیریم؟',
      hint: 'یک نفس عمیق بکش؛ با هم فکر می‌کنیم.',
      correct: 'آفرین! درست بود!',
      wrong: 'اشکالی نداره؛ با هم یک راه دیگه امتحان می‌کنیم.',
      done: 'دمت گرم! یک ایستگاه را تمام کردی.',
    },
  },
  qbo: {
    id: 'qbo',
    name: 'کیوبو',
    tier: 'SUPPORTING',
    species: 'cube-robot',
    color: '#C9850C',
    bg: '#FFF4D6',
    role: 'دستیار شمردن و حل مسئله',
    personality: 'رباتی ساخته‌شده از مکعب‌های شمارش؛ خودش را به مکعب‌ها می‌شکند و دوباره می‌چیند. یک مکعبش همیشه کمی کج است.',
    catchphrase: 'بیا یکی‌یکی بسازیمش!',
    lines: {
      greet: 'من کیوبو هستم! بیا با هم بشماریم.',
      hint: 'هر کدام را فقط یک بار بشمار و به عدد آخر دقت کن.',
      correct: 'تق! مکعب‌ها درست سر جاشون نشستن.',
      wrong: 'دوباره یکی‌یکی می‌شماریم؛ من کمکت می‌کنم.',
      done: 'شمارش تمام!',
    },
  },
  dana: {
    id: 'dana',
    name: 'دانا',
    tier: 'SUPPORTING',
    species: 'squirrel',
    color: '#8F3963',
    bg: '#F6E9F0',
    role: 'کاشف الگوها و شکل‌ها',
    personality: 'سنجاب کاشف با ذره‌بین؛ دم بزرگ راه‌راهش خودش یک الگوی تکرارشونده است و وقتی الگو پیدا می‌شود پف می‌کند.',
    catchphrase: 'چی دوباره تکرار می‌شه؟',
    lines: {
      greet: 'من دانا هستم! بیا الگوها را کشف کنیم.',
      hint: 'ببین چه چیزی دوباره و دوباره تکرار می‌شود.',
      correct: 'الگو را پیدا کردی! چه کاشف خوبی!',
      wrong: 'یک بار دیگه دقیق نگاه کن؛ الگو یک جا قایم شده.',
      done: 'کشف تمام شد!',
    },
  },
  jiko: {
    id: 'jiko',
    name: 'جیکو',
    tier: 'SUPPORTING',
    species: 'songbird',
    color: '#CF4A26',
    bg: '#FFE9DF',
    role: 'مشوق و جشن پیروزی',
    personality: 'پرندهٔ کوچولوی گرد و آوازخوان با کاکل سه‌پر؛ فقط برای جشن‌های واقعی (قبولی، جایزه) می‌آید و گاهی روی سر آریا می‌نشیند.',
    catchphrase: 'جیک‌جیک! جشن بگیریم!',
    lines: {
      greet: 'جیک‌جیک! من جیکو هستم!',
      hint: 'تو می‌توانی؛ من مطمئنم!',
      correct: 'جیک‌جیک! معرکه بود!',
      wrong: 'ایراد نداره؛ باز هم امتحان کن!',
      done: 'جشن بگیریم! ستاره‌ی جدید مال توست!',
    },
  },
};

export const MAIN_CHARACTER: CharacterId = 'aria';

/** Which character speaks for a given encounter (null = none, e.g. assessments). */
export function speakerForContent(contentId: string | undefined): CharacterId | null {
  switch (contentId) {
    case 'G1-ST01-E01':
      return 'aria'; // Discover / story — the main guide introduces the concept
    case 'G1-ST01-E02':
    case 'G1-ST01-E04':
    case 'G1-ST01-E05':
      return 'qbo'; // counting
    case 'G1-ST01-E03':
    case 'G1-ST01-E06':
    case 'G1-ST01-E11':
      return 'dana'; // patterns / transfer
    case 'G1-ST01-E09':
      return 'aria'; // recovery — the trusted main character steps in
    case 'G1-ST01-E07':
    case 'G1-ST01-E08':
    case 'G1-ST01-E10':
    case 'G1-ST01-E12':
      return null; // assessment: no answer-revealing character behaviour (SoT §10.5)
    default:
      return 'aria';
  }
}
