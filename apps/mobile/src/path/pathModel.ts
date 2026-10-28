import {
  G1_STATIONS,
  G1_UNITS,
  PATH_NODE_LABELS,
  PATH_NODE_STATUS_HINT,
  worldByUnitId,
  type ProgressionNodeStatus,
} from '@math/contracts';
import { toFa } from '../ui/digits';
import { macroIndex } from '../station/macro';
import type { StationStage } from '../station/types';
import type { StationNodeState } from './layout';
import type { ChapterView, StationView } from './PathView';

type UnitLike = { id: string; number: number; title: string; stationIds: readonly string[] };
type StationLike = { id: string; number: number; title: string; unitId: string };

/** Contract status → the node the approved page draws. The focus station is the one amber node with the ring. */
export function stationNodeState(status: ProgressionNodeStatus, isFocus: boolean): StationNodeState {
  if (status === 'COMPLETED') return 'done';
  if (status === 'LOCKED') return 'lock';
  if (isFocus) return 'cur';
  return status === 'NOT_DOWNLOADED' ? 'download' : 'open';
}

export function stationView(station: StationLike, status: ProgressionNodeStatus, isFocus: boolean): StationView {
  return {
    id: station.id,
    title: station.title,
    state: stationNodeState(status, isFocus),
    accessibilityLabel: `ایستگاه ${toFa(station.number)}، ${station.title}، ${PATH_NODE_LABELS[status]}`,
    // What the child can do with this node, read after the label (e.g. «می‌توانی شروع کنی»).
    hint: PATH_NODE_STATUS_HINT[status],
  };
}

/** "فصل ۱ · عددها و جایگاه": chapter number and the unit's topic (the pages call a unit a chapter). */
export const chapterKicker = (unit: UnitLike): string => `فصل ${toFa(unit.number)} · ${unit.title}`;

/** Band title: the world's name (e.g. «دره‌ی عددها»), falling back to the unit title. */
export const chapterTitle = (unit: UnitLike): string => worldByUnitId(unit.id)?.titleFa ?? unit.title;

/** The grade chip of the page: «پایهٔ ۱». */
export function gradeChipLabel(gradeId: string | null | undefined): string {
  const n = Number(String(gradeId ?? 'G1').replace(/\D/g, '')) || 1;
  return `پایهٔ ${toFa(n)}`;
}

/** Ring around the current node: completed macro stages of the resumed station out of five. */
export function ringFraction(stage: StationStage | null | undefined): number {
  const index = stage ? macroIndex(stage) : null;
  return index === null || index === undefined ? 0 : index / 5;
}

type JumpRule = {
  units: readonly UnitLike[];
  completed: ReadonlySet<string>;
  /** Does an assessment exist for jumping to this station? */
  hasJump: (targetStationId: string) => boolean;
  isJumpUnlocked: (targetStationId: string) => boolean;
};

/**
 * Units whose divider shows the jump offer: not the first unit, nothing of it done yet, the previous unit
 * finished, an assessment exists and it has not been unlocked already (same rule the old screen used).
 */
export function jumpOfferUnitIds({ units, completed, hasJump, isJumpUnlocked }: JumpRule): Set<string> {
  const offered = new Set<string>();
  units.forEach((unit, index) => {
    if (index === 0) return;
    const target = unit.stationIds[0];
    const previous = units[index - 1];
    const previousEnd = previous?.stationIds[previous.stationIds.length - 1];
    if (!target || !previousEnd) return;
    const started = unit.stationIds.some((id) => completed.has(id));
    if (!started && completed.has(previousEnd) && hasJump(target) && !isJumpUnlocked(target)) offered.add(unit.id);
  });
  return offered;
}

type ChapterInput = {
  statuses: Readonly<Record<string, ProgressionNodeStatus>>;
  focusStationId: string | null;
  jumpOffers: ReadonlySet<string>;
  onJump: (unitId: string) => void;
  units?: readonly UnitLike[];
  stations?: readonly StationLike[];
};

export function buildChapterViews({ statuses, focusStationId, jumpOffers, onJump, units = G1_UNITS, stations = G1_STATIONS }: ChapterInput): ChapterView[] {
  return units.map((unit) => ({
    kicker: chapterKicker(unit),
    title: chapterTitle(unit),
    stations: stations
      .filter((s) => s.unitId === unit.id)
      .map((s) => stationView(s, statuses[s.id] ?? 'LOCKED', s.id === focusStationId)),
    jumpOffer: jumpOffers.has(unit.id) ? { label: `پرش به فصل ${toFa(unit.number)}`, onPress: () => onJump(unit.id) } : undefined,
  }));
}
