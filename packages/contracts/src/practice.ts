/**
 * Canonical child-facing Practice surface.
 *
 * Practice is deliberately small: one destination with one recommended
 * action and a short list of optional games grounded in the learning path.
 * Skills and concept explanation are learning/context surfaces, not a second
 * navigation hierarchy, so they are kept in the data layer for later use.
 */
import { G1_U01_STATIONS } from './progression';

export type PracticeSectionId = 'GAMES';
export type PracticeEvidenceState = 'NOT_STARTED' | 'PRACTICED';

export interface PracticeGameDefinition {
  id: string;
  title: string;
  subtitle: string;
  stationId: string;
  contentIds: readonly string[];
  skillIds: readonly string[];
  durationMinutes: number;
  section: 'GAMES';
  availability: 'CURRENT_PATH' | 'PATH_REQUIRED';
}

export interface PracticeSkillDefinition {
  id: string;
  title: string;
  summary: string;
  stationIds: readonly string[];
  practiceGameIds: readonly string[];
}

export interface PracticeConceptDefinition {
  id: string;
  title: string;
  summary: string;
  example: readonly string[];
  stationId: string;
  skillIds: readonly string[];
}

export const PRACTICE_SECTIONS = [
  { id: 'GAMES', label: 'بازی‌های کوتاه', description: 'تمرین‌های کوتاه از مهارت‌هایی که در مسیر دیده‌ای.', screenId: 'S14' },
] as const;

export const PRACTICE_GAMES: readonly PracticeGameDefinition[] = [
  {
    id: 'pattern-quick',
    title: 'الگوی بعدی را پیدا کن',
    subtitle: 'یک بازی کوتاه برای تشخیص الگوی تکرارشونده.',
    stationId: 'ST01',
    contentIds: ['G1-ST01-E03', 'G1-ST01-E06'],
    skillIds: ['G1-SK009'],
    durationMinutes: 3,
    section: 'GAMES',
    availability: 'CURRENT_PATH',
  },
  {
    id: 'count-quick',
    title: 'تعداد را پیدا کن',
    subtitle: 'با نگاه کردن و شمردن، تعداد یک دسته را پیدا کن.',
    stationId: 'ST01',
    contentIds: ['G1-ST01-E04', 'G1-ST01-E05'],
    skillIds: ['G1-SK001', 'G1-SK003'],
    durationMinutes: 3,
    section: 'GAMES',
    availability: 'CURRENT_PATH',
  },
  {
    id: 'shape-explore',
    title: 'شکل‌ها را پیدا کن',
    subtitle: 'یک تمرین دیداری از شکل‌ها و ویژگی‌های آن‌ها.',
    stationId: 'ST04',
    contentIds: [],
    skillIds: ['G1-SK005'],
    durationMinutes: 4,
    section: 'GAMES',
    availability: 'PATH_REQUIRED',
  },
] as const;

/** Kept as canonical learning data; it is not a child navigation tab. */
export const PRACTICE_SKILLS: readonly PracticeSkillDefinition[] = [
  { id: 'G1-SK001', title: 'شمارش اشیا تا ۵', summary: 'هر شیء را یک‌بار بشمار و بدان که عدد آخر، تعداد کل را نشان می‌دهد.', stationIds: ['ST01'], practiceGameIds: ['count-quick'] },
  { id: 'G1-SK003', title: 'عدد آخر یعنی تعداد کل', summary: 'بعد از شمردن، آخرین عدد را به‌عنوان تعداد کل نگه دار.', stationIds: ['ST01'], practiceGameIds: ['count-quick'] },
  { id: 'G1-SK009', title: 'تشخیص الگوی تکرارشونده', summary: 'قانون تکرار را پیدا کن و جای خالی الگو را کامل کن.', stationIds: ['ST01'], practiceGameIds: ['pattern-quick'] },
  { id: 'G1-SK005', title: 'شکل‌ها و ویژگی‌های آن‌ها', summary: 'شکل‌های آشنا را با ضلع و گوشه‌هایشان مقایسه کن.', stationIds: ['ST04'], practiceGameIds: ['shape-explore'] },
] as const;

export const PRACTICE_CONCEPTS: readonly PracticeConceptDefinition[] = [
  { id: 'count-last-number', title: 'عدد آخر، تعداد کل است', summary: 'وقتی اشیا را یکی‌یکی می‌شماری، عدد آخر می‌گوید چند شیء داری.', example: ['۱', '۲', '۳'], stationId: 'ST01', skillIds: ['G1-SK001', 'G1-SK003'] },
  { id: 'repeat-pattern', title: 'الگوی تکرارشونده', summary: 'در یک الگو، یک ترتیب کوچک بارها تکرار می‌شود.', example: ['●', '■', '●', '■'], stationId: 'ST01', skillIds: ['G1-SK009'] },
  { id: 'shape-features', title: 'شکل‌ها را با ویژگی‌ها بشناس', summary: 'تعداد ضلع و گوشه کمک می‌کند شکل‌های آشنا را از هم تشخیص بدهی.', example: ['مثلث: ۳ ضلع', 'مربع: ۴ ضلع'], stationId: 'ST04', skillIds: ['G1-SK005'] },
] as const;

export function practiceSectionById(_id: string): PracticeSectionId {
  return 'GAMES';
}

export function practiceGameById(id: string): PracticeGameDefinition | null {
  return PRACTICE_GAMES.find((item) => item.id === id) ?? null;
}

export function practiceSkillById(id: string): PracticeSkillDefinition | null {
  return PRACTICE_SKILLS.find((item) => item.id === id) ?? null;
}

export function practiceConceptById(id: string): PracticeConceptDefinition | null {
  return PRACTICE_CONCEPTS.find((item) => item.id === id) ?? null;
}

export function practiceEvidenceState(skill: PracticeSkillDefinition, completedStationIds: readonly string[]): PracticeEvidenceState {
  return skill.stationIds.some((stationId) => completedStationIds.includes(stationId)) ? 'PRACTICED' : 'NOT_STARTED';
}

export function stationTitleForPractice(stationId: string): string {
  return G1_U01_STATIONS.find((station) => station.id === stationId)?.title ?? 'ایستگاه مسیر';
}

export function canOpenPracticeStation(stationId: string, completedStationIds: readonly string[]): boolean {
  const stationIndex = G1_U01_STATIONS.findIndex((station) => station.id === stationId);
  if (stationIndex < 0) return false;
  const firstUncompletedIndex = G1_U01_STATIONS.findIndex((station) => !completedStationIds.includes(station.id));
  if (firstUncompletedIndex < 0) return true;
  return stationIndex <= firstUncompletedIndex;
}
