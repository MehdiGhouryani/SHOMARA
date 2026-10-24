'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toPersianDigits, type GradeMeta } from '../lib/persian';
import {
  G1_PATH_CHECKPOINTS,
  G1_STATIONS,
  G1_UNITS,
  JUMP_ASSESSMENTS,
  pathNodeKind,
  PROGRESSION_STATUS_LABELS,
  deriveStationStatus,
  type ProgressionNodeStatus,
  type StationDefinition,
} from '@math/contracts';
import styles from './DuolingoPath.module.css';

const LEGACY_NODE_TYPES: Readonly<Record<string, PathNodeItem['type']>> = Object.fromEntries(Array.from({ length: 25 }, (_, index) => {
  const types: PathNodeItem['type'][] = ['COUNT', 'PATTERN', 'TALLY', 'SYMMETRY', 'SCALE'];
  return [`ST${String(index + 1).padStart(2, '0')}`, types[index % types.length]!];
})) as Readonly<Record<string, PathNodeItem['type']>>;

export interface PathNodeItem {
  id: string;
  stationId: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  type: 'COUNT' | 'PATTERN' | 'WONDER_GRID' | 'TALLY' | 'SYMMETRY' | 'SCALE' | 'CHECK';
  visualKind: import('@math/contracts').PathNodeVisualKind;
  status: ProgressionNodeStatus;
  estimatedMinutes: number;
}

interface DuolingoPathProps {
  selectedGrade: GradeMeta;
  activeCharId?: string;
  completedNodeIds: string[];
  downloadedStationIds?: string[];
  syncPendingStationIds?: string[];
  onSelectNode: (node: PathNodeItem) => void;
}

const JUMP_STORAGE_KEY = 'math_app_jump_unlocked_station_ids';

function readJumpUnlocks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(JUMP_STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(String).filter((id) => /^ST\d{2}$/.test(id)) : [];
  } catch {
    return [];
  }
}

function NodeIcon({ status, kind }: { status: ProgressionNodeStatus; kind: import('@math/contracts').PathNodeVisualKind }) {
  const stroke = 'currentColor';
  if (status === 'COMPLETED') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12 4 4 8-9" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (status === 'LOCKED') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" stroke={stroke} strokeWidth="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" stroke={stroke} strokeWidth="2" strokeLinecap="round" /></svg>;
  if (status === 'NOT_DOWNLOADED') return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (status === 'SYNC_PENDING') return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.8-3M4 13a8 8 0 0 0 14.8 3M5 8V4m0 4h4m10 8v4m0-4h-4" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" /></svg>;
  if (kind === 'CHALLENGE') return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" stroke={stroke} strokeWidth="2"/><path d="M8 6H5v1a3 3 0 0 0 3 3m8-4h3v1a3 3 0 0 1-3 3M12 11v4m-4 5h8m-6-5h4" stroke={stroke} strokeWidth="2" strokeLinecap="round"/></svg>;
  if (kind === 'PRACTICE') return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/><path d="M19 16v5m-2.5-2.5h5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (kind === 'REVIEW') return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h10" stroke={stroke} strokeWidth="2" strokeLinecap="round" /></svg>;
  return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 5h9l3 3v11H6z" stroke={stroke} strokeWidth="2" strokeLinejoin="round"/><path d="M15 5v4h3" stroke={stroke} strokeWidth="2" strokeLinejoin="round"/></svg>;
}

function CheckpointIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 5h10v14H7z" stroke="currentColor" strokeWidth="2" /><path d="M9 9h6M9 13h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function stationNodeFrom(station: StationDefinition, status: ProgressionNodeStatus): PathNodeItem {
  return {
    id: `station-${station.id}`,
    stationId: station.id,
    stepNumber: station.number,
    title: station.title,
    subtitle: station.subtitle,
    type: LEGACY_NODE_TYPES[station.id] ?? 'COUNT',
    visualKind: pathNodeKind(station.id),
    estimatedMinutes: station.estimatedMinutes,
    status,
  };
}

function unitProgress(stations: readonly StationDefinition[], completed: readonly string[]) {
  return stations.reduce((count, station) => count + (completed.includes(station.id) ? 1 : 0), 0);
}

export function DuolingoPath({ selectedGrade, completedNodeIds, downloadedStationIds = ['ST01'], syncPendingStationIds = [], onSelectNode }: DuolingoPathProps) {
  const router = useRouter();
  const [lockedNoticeId, setLockedNoticeId] = useState<string | null>(null);
  const completed = useMemo(() => {
    const mapped = completedNodeIds.map((id) => /^step-\d+$/.test(id) ? `ST0${id.replace('step-', '')}` : id.replace('station-', ''));
    return Array.from(new Set(mapped.filter((id) => /^ST\d{2}$/.test(id))));
  }, [completedNodeIds]);
  const [jumpUnlockedStationIds, setJumpUnlockedStationIds] = useState<string[]>(() => readJumpUnlocks());
  const nodes = useMemo(() => G1_STATIONS.map((station) => {
    const status = deriveStationStatus({ station, completedStationIds: completed, downloadedStationIds, syncPendingStationIds, jumpUnlockedStationIds });
    return stationNodeFrom(station, status);
  }), [completed, downloadedStationIds, syncPendingStationIds, jumpUnlockedStationIds]);

  const currentNode = nodes.find((node) => node.status === 'CURRENT') ?? nodes.find((node) => node.status === 'AVAILABLE') ?? nodes[0]!;
  const completedCount = nodes.filter((node) => node.status === 'COMPLETED').length;
  const pathProgress = Math.round((completedCount / Math.max(nodes.length, 1)) * 100);

  function handleNodeClick(node: PathNodeItem) {
    if (node.status === 'LOCKED') {
      setLockedNoticeId(node.stationId);
      window.setTimeout(() => setLockedNoticeId(null), 2400);
      return;
    }
    onSelectNode(node);
  }

  function scrollToCurrent() {
    const element = document.getElementById(currentNode.id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function openJump(targetStationId: string) {
    const target = nodes.find((node) => node.stationId === targetStationId);
    if (!target) return;
    const assessment = JUMP_ASSESSMENTS.find((item) => item.targetStationId === targetStationId);
    if (!assessment) return;
    router.push(`/unit/${assessment.targetUnitId}/jump?targetStationId=${targetStationId}`);
  }

  return (
    <div dir="rtl" className={styles.root} data-screen-id="S07">
      <header className={styles.topbar}>
        <div className={styles.topbarSide}>
          <span className={styles.gradeBadge}>پایه {toPersianDigits(selectedGrade.id === 'G1' ? 'اول' : selectedGrade.title)}</span>
        </div>
        <div className={styles.topbarProgress} aria-label={`پیشرفت مسیر، ${toPersianDigits(completedCount)} از ${toPersianDigits(nodes.length)} ایستگاه`}>
          <span>{toPersianDigits(completedCount)} / {toPersianDigits(nodes.length)}</span>
          <div className={styles.topbarProgressTrack} aria-hidden="true"><span style={{ width: `${pathProgress}%` }} /></div>
        </div>
      </header>

      <main className={styles.content}>
        {G1_UNITS.map((unit, unitIndex) => {
          const unitStations = G1_STATIONS.filter((station) => station.unitId === unit.id);
          const unitDone = unitProgress(unitStations, completed);
          const firstUnitStation = unitStations[0]!;
          const jump = JUMP_ASSESSMENTS.find((assessment) => assessment.targetStationId === firstUnitStation.id);
          const showJump = unitIndex > 0 && unitDone === 0 && Boolean(jump) && !jumpUnlockedStationIds.includes(firstUnitStation.id) && completed.includes(G1_UNITS[unitIndex - 1]?.stationIds.at(-1) ?? '');
          return (
            <section key={unit.id} className={styles.unitSection} aria-labelledby={`unit-${unit.id}`}>
              <header className={`${styles.unitHeader} ${styles[`unitHeader_${unitIndex + 1}`]}`}>
                <div>
                  <span className={styles.unitKicker}>واحد {toPersianDigits(unit.number)}</span>
                  <h1 id={`unit-${unit.id}`} className={styles.unitTitle}>{unit.title}</h1>
                </div>
                <span className={styles.unitCount}>{toPersianDigits(unitDone)} / {toPersianDigits(unitStations.length)}</span>
              </header>

              {showJump && jump && (
                <button type="button" className={styles.jumpCard} onClick={() => openJump(jump.targetStationId)} aria-label={`ارزیابی پرش به واحد ${toPersianDigits(unit.number)}`}>
                  <span className={styles.jumpIcon} aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12h10m-4-4 4 4-4 4M13 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <span className={styles.jumpCopy}><strong>می‌خواهی بپری جلو؟</strong><small>۵ سؤال کوتاه؛ با ۴ پاسخ درست، واحد باز می‌شود.</small></span>
                  <span className={styles.jumpArrow} aria-hidden="true">←</span>
                </button>
              )}

              <div className={styles.pathLane}>
                {unitStations.map((station, index) => {
                  const node = nodes.find((item) => item.stationId === station.id)!;
                  const globalIndex = G1_STATIONS.findIndex((item) => item.id === station.id);
                  const lane = globalIndex % 2 === 0 ? 'right' : 'left';
                  const notice = lockedNoticeId === station.id;
                  return (
                    <React.Fragment key={station.id}>
                      {index > 0 && <div className={`${styles.curveConnector} ${lane === 'right' ? styles.curveToRight : styles.curveToLeft}`} aria-hidden="true" />}
                      <div id={node.id} className={`${styles.pathRow} ${lane === 'right' ? styles.rowRight : styles.rowLeft} ${node.status === 'CURRENT' ? styles.rowCurrent : ''}`}>
                        <div className={styles.nodeWrap}>
                          {node.status === 'CURRENT' && <span className={styles.currentRing} aria-hidden="true" />}
                          <button
                            type="button"
                            className={`${styles.node} ${styles[`node_${node.status}`]}`}
                            onClick={() => handleNodeClick(node)}
                            aria-label={`ایستگاه ${toPersianDigits(node.stepNumber)}، ${node.title}، ${PROGRESSION_STATUS_LABELS[node.status]}`}
                            aria-describedby={notice ? `locked-${node.stationId}` : undefined}
                          >
                            <NodeIcon status={node.status} kind={node.visualKind} />
                          </button>
                          <div className={styles.nodeLabel}>
                            <span>ایستگاه {toPersianDigits(node.stepNumber)}</span>
                            <strong>{node.title}</strong>
                            <small>{toPersianDigits(node.estimatedMinutes)} دقیقه</small>
                          </div>
                          {notice && <div id={`locked-${node.stationId}`} role="status" className={styles.lockNotice}>اول ایستگاه‌های قبل را جلو ببر.</div>}
                        </div>
                        {node.status === 'CURRENT' && (
                          <button type="button" className={styles.currentAction} onClick={() => handleNodeClick(node)}>ادامه بده</button>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {unitIndex < G1_UNITS.length - 1 && (() => {
                const checkpoint = G1_PATH_CHECKPOINTS.find((item) => item.unitId === unit.id);
                if (!checkpoint) return null;
                const passed = completed.includes(checkpoint.afterStationId);
                return (
                  <div className={`${styles.checkpoint} ${passed ? styles.checkpointPassed : ''}`} aria-label={passed ? `${checkpoint.label}، کامل شده` : `${checkpoint.label}، قفل`}>
                    <span className={styles.checkpointIcon}><CheckpointIcon /></span>
                    <span><strong>مرز واحد</strong><small>{passed ? 'کامل شد' : 'با پایان واحد باز می‌شود'}</small></span>
                  </div>
                );
              })()}
            </section>
          );
        })}

        <button type="button" className={styles.resumeButton} onClick={scrollToCurrent} aria-label="رفتن به قدم بعدی">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m0 0-5 5m5-5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>قدم بعدی</span>
        </button>
        <div className={styles.pathEnd}>
          <span className={styles.pathEndDot} aria-hidden="true" />
          <span>ادامه مسیر به‌زودی</span>
        </div>
        <p className={styles.currentHint}>اکنون: {currentNode.title}</p>
      </main>
    </div>
  );
}
