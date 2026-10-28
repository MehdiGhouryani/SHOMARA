'use client';

import type { ContentManifest } from '@math/contracts';
import { G1_U01_STATIONS, deriveStationStatus, stationById, type ProgressionNodeStatus } from '@math/contracts';

export interface StoredLearningState {
  completedStationIds: string[];
  downloadedStationIds: string[];
  syncPendingStationIds: string[];
}

export function readLearningState(): StoredLearningState {
  if (typeof window === 'undefined') return { completedStationIds: [], downloadedStationIds: [], syncPendingStationIds: [] };
  const read = (key: string): string[] => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  };
  const completed = read('math_app_completed_node_ids').map((id) => id.startsWith('step-') ? `ST0${id.replace('step-', '')}` : id).filter((id) => Boolean(stationById(id)));
  return { completedStationIds: completed, downloadedStationIds: ['ST01'], syncPendingStationIds: [] };
}

export function manifestStationIds(manifest: ContentManifest | null): string[] {
  if (!manifest) return [];
  return [...manifest.current, ...manifest.next, ...manifest.recent].map((pkg) => pkg.stationId).filter((id): id is string => Boolean(id)).map((id) => id.replace('G1-', ''));
}

export function stationStatus(stationId: string, state: StoredLearningState): ProgressionNodeStatus {
  const station = stationById(stationId);
  if (!station) return 'LOCKED';
  return deriveStationStatus({ station, ...state });
}

export function stationFromNode(nodeId: string) {
  return G1_U01_STATIONS.find((station) => station.id === nodeId) ?? null;
}
