/**
 * Canonical learner path model for the child experience.
 *
 * This contract is intentionally UI-facing: it describes the continuous path,
 * the order of stations, their short learner-facing labels, and the semantic
 * state of each node. Learning truth still comes from the learning runtime.
 */
export type ProgressionNodeStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'AVAILABLE'
  | 'LOCKED'
  | 'NOT_DOWNLOADED'
  | 'SYNC_PENDING';

export type StationKind = 'LESSON' | 'CHECKPOINT';

export interface StationDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  skillIds: readonly string[];
  packageCode: string;
  estimatedMinutes: number;
  unitId: string;
}

export interface UnitDefinition {
  id: string;
  gradeId: string;
  number: number;
  title: string;
  subtitle: string;
  stationIds: readonly string[];
}

const station = (
  id: string,
  number: number,
  title: string,
  subtitle: string,
  estimatedMinutes: number,
  unitId: string,
): StationDefinition => ({
  id,
  number,
  title,
  subtitle,
  estimatedMinutes,
  unitId,
  skillIds: [],
  packageCode: `G1-${id}`,
});

export const G1_UNITS: readonly UnitDefinition[] = [
  { id: 'G1-U01', gradeId: 'G1', number: 1, title: 'عددها و جایگاه', subtitle: 'شمارش، جهت، شکل و جمع‌های ساده', stationIds: ['ST01', 'ST02', 'ST03', 'ST04', 'ST05'] },
  { id: 'G1-U02', gradeId: 'G1', number: 2, title: 'عددها و اندازه‌گیری', subtitle: 'عددهای کوچک، اندازه‌گیری و مقایسه', stationIds: ['ST06', 'ST07', 'ST08', 'ST09', 'ST10'] },
  { id: 'G1-U03', gradeId: 'G1', number: 3, title: 'عدد و مسئله', subtitle: 'عددها، جمع، تفریق و گروه‌بندی', stationIds: ['ST11', 'ST12', 'ST13', 'ST14', 'ST15'] },
  { id: 'G1-U04', gradeId: 'G1', number: 4, title: 'زمان و عددهای بزرگ‌تر', subtitle: 'زمان، الگو و ارزش مکانی', stationIds: ['ST16', 'ST17', 'ST18', 'ST19', 'ST20'] },
  { id: 'G1-U05', gradeId: 'G1', number: 5, title: 'اندازه‌گیری و مسئله', subtitle: 'اندازه‌گیری، شمارش و مسئله‌های چندمرحله‌ای', stationIds: ['ST21', 'ST22', 'ST23', 'ST24', 'ST25'] },
] as const;

export const G1_STATIONS: readonly StationDefinition[] = [
  station('ST01', 1, 'شمارش و الگو', 'شمارش تا ۵ و ادامه‌دادن الگوهای ساده', 8, 'G1-U01'),
  station('ST02', 2, 'جایگاه و جهت', 'جایگاه‌ها و حرکت در یک شبکه ساده', 7, 'G1-U01'),
  station('ST03', 3, 'عدد و جمع', 'ساخت عدد و جمع‌های ساده', 9, 'G1-U01'),
  station('ST04', 4, 'شکل‌ها و ویژگی‌ها', 'شکل‌های آشنا و ویژگی‌های آن‌ها', 8, 'G1-U01'),
  station('ST05', 5, 'جمع و تفریق', 'راهبردهای ساده برای محاسبه', 10, 'G1-U01'),
  station('ST06', 6, 'جمع با مهره‌ها', 'جمع و تفریق با کمک شمارنده‌ها', 8, 'G1-U02'),
  station('ST07', 7, 'عددهای ۱ و ۲', 'شناخت، ساخت و مقایسه عددهای ۱ و ۲', 7, 'G1-U02'),
  station('ST08', 8, 'عددهای ۳ و ۴', 'عددهای ۳ و ۴ و اندازه‌گیری قد', 9, 'G1-U02'),
  station('ST09', 9, 'صفر و ۵', 'صفر، ۵ و تقارن ساده', 8, 'G1-U02'),
  station('ST10', 10, 'عددهای ۶ و ۷', 'مقایسه مجموعه‌ها و عددهای ۶ و ۷', 9, 'G1-U02'),
  station('ST11', 11, 'برابری و عدد ۸', 'مجموعه‌های مساوی و عدد ۸', 8, 'G1-U03'),
  station('ST12', 12, 'مقایسه و عدد ۹', 'مقایسه عددها و عدد ۹', 8, 'G1-U03'),
  station('ST13', 13, 'نشانهٔ جمع', 'نشانه جمع و ترکیب‌های عددی', 9, 'G1-U03'),
  station('ST14', 14, 'تفریق و طول', 'تفریق و مقایسه طول', 9, 'G1-U03'),
  station('ST15', 15, 'گروه‌بندی', 'گروه‌بندی و ارزش مکانی اولیه', 9, 'G1-U03'),
  station('ST16', 16, 'ساعت و عددها', 'ساعت و عددهای ۱۰ تا ۲۰', 10, 'G1-U04'),
  station('ST17', 17, 'جمع چندبخشی', 'جمع چندبخشی و تقریب ساده', 10, 'G1-U04'),
  station('ST18', 18, 'الگو و زمان', 'الگوهای عددی و زمان دقیق', 9, 'G1-U04'),
  station('ST19', 19, 'ده‌تایی‌ها و خرید', 'ده‌تایی‌ها و مسئله‌های خرید', 10, 'G1-U04'),
  station('ST20', 20, 'عددهای دو رقمی', 'عددهای دو رقمی و ارزش مکانی', 10, 'G1-U04'),
  station('ST21', 21, 'عددهای ۱ تا ۱۰۰', 'جدول عددها و اندازه‌گیری', 10, 'G1-U05'),
  station('ST22', 22, 'تقویم و شمارش', 'الگوهای شمارش و تقویم', 9, 'G1-U05'),
  station('ST23', 23, 'شمارش گروهی', 'شمارش ۵تایی و ۸تایی و مسئله', 10, 'G1-U05'),
  station('ST24', 24, 'مسئله‌های چندمرحله‌ای', 'مسئله‌های چندمرحله‌ای و زمان تقریبی', 11, 'G1-U05'),
  station('ST25', 25, 'عدد ۱۰۰', 'عدد ۱۰۰ و کفایت اطلاعات', 11, 'G1-U05'),
] as const;

export const G1_U01: UnitDefinition = G1_UNITS[0]!;
export const G1_U01_STATIONS: readonly StationDefinition[] = G1_STATIONS.slice(0, 5);

export function stationById(id: string): StationDefinition | null {
  return G1_STATIONS.find((item) => item.id === id) ?? null;
}

export function unitById(id: string): UnitDefinition | null {
  return G1_UNITS.find((item) => item.id === id) ?? null;
}

export function unitForStation(stationId: string): UnitDefinition | null {
  const found = stationById(stationId);
  return found ? unitById(found.unitId) : null;
}

export function deriveStationStatus(args: {
  station: StationDefinition;
  completedStationIds: readonly string[];
  downloadedStationIds: readonly string[];
  syncPendingStationIds?: readonly string[];
  jumpUnlockedStationIds?: readonly string[];
}): ProgressionNodeStatus {
  const {
    station,
    completedStationIds,
    downloadedStationIds,
    syncPendingStationIds = [],
    jumpUnlockedStationIds = [],
  } = args;
  if (syncPendingStationIds.includes(station.id)) return 'SYNC_PENDING';
  if (completedStationIds.includes(station.id)) return 'COMPLETED';

  const firstUncompletedIndex = G1_STATIONS.findIndex((item) => !completedStationIds.includes(item.id));
  const stationIndex = G1_STATIONS.findIndex((item) => item.id === station.id);
  const jumpIndexes = jumpUnlockedStationIds
    .map((id) => G1_STATIONS.findIndex((item) => item.id === id))
    .filter((index) => index >= 0);
  const highestJumpIndex = jumpIndexes.length ? Math.max(...jumpIndexes) : -1;

  // A successful jump moves the learner's current cursor forward, but does not
  // erase access to the stations that were skipped. They remain revisit-able.
  const cursorIndex = highestJumpIndex >= 0
    ? Math.max(
        firstUncompletedIndex < 0 ? 0 : firstUncompletedIndex,
        ...jumpIndexes.map((index) => completedStationIds.includes(G1_STATIONS[index]!.id) ? index + 1 : index),
      )
    : firstUncompletedIndex;
  const isAheadOfCursor = stationIndex > cursorIndex;
  if (isAheadOfCursor) return 'LOCKED';
  if (!downloadedStationIds.includes(station.id)) return 'NOT_DOWNLOADED';
  if (stationIndex === cursorIndex || jumpIndexes.includes(stationIndex)) return 'CURRENT';
  return 'AVAILABLE';
}

export interface AuthoritativeProgressionStation {
  stationId: string;
  stationCode: string;
  sequence: number;
  title: string;
  status: 'ACTIVE';
  passed: boolean;
  qualifyingCheckSessionCount: number;
}

export interface AuthoritativeActiveSession {
  id: string;
  sessionType: 'LEARNING' | 'DIAGNOSTIC' | 'RECOVERY' | 'REVIEW';
  status: 'CREATED' | 'ACTIVE' | 'INTERRUPTED';
  stationId: string | null;
  stationCode: string | null;
  lastActivityAt: string | null;
  lastResumedByClientInstallationId: string | null;
}

export interface AuthoritativeProgressionSnapshot {
  gradeId: string;
  curriculumVersion: string;
  generatedAt: string;
  stations: AuthoritativeProgressionStation[];
  completedStationIds: string[];
  jumpUnlockedStationIds: string[];
  activeSession: AuthoritativeActiveSession | null;
}

export const PROGRESSION_STATUS_LABELS: Readonly<Record<ProgressionNodeStatus, string>> = {
  COMPLETED: 'تمام‌شده',
  CURRENT: 'ادامه بده',
  AVAILABLE: 'آماده شروع',
  LOCKED: 'قفل است',
  NOT_DOWNLOADED: 'در حال آماده‌سازی',
  SYNC_PENDING: 'در حال همگام‌سازی',
};

export interface PathCheckpoint {
  id: string;
  unitId: string;
  afterStationId: string;
  label: string;
}

export const G1_PATH_CHECKPOINTS: readonly PathCheckpoint[] = [
  { id: 'CP-U01', unitId: 'G1-U01', afterStationId: 'ST05', label: 'پایان واحد ۱' },
  { id: 'CP-U02', unitId: 'G1-U02', afterStationId: 'ST10', label: 'پایان واحد ۲' },
  { id: 'CP-U03', unitId: 'G1-U03', afterStationId: 'ST15', label: 'پایان واحد ۳' },
  { id: 'CP-U04', unitId: 'G1-U04', afterStationId: 'ST20', label: 'پایان واحد ۴' },
  { id: 'CP-U05', unitId: 'G1-U05', afterStationId: 'ST25', label: 'پایان پایه اول' },
] as const;
