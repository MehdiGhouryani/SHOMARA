'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChildRouteShell } from '../../../../components/ChildRouteShell';
import { DuolingoLessonModal } from '../../../../components/DuolingoLessonModal';
import { G1_STATIONS } from '@math/contracts';
import type { PathNodeItem } from '../../../../components/DuolingoPath';

type LegacyLessonNodeType = Exclude<PathNodeItem['type'], 'CHECK'>;
const LESSON_TYPES: readonly LegacyLessonNodeType[] = ['COUNT', 'PATTERN', 'TALLY', 'SYMMETRY', 'SCALE'];
const COMPANIONS = ['aria', 'dana', 'qbo'] as const;

export default function StationPlayPage() {
  const router = useRouter();
  const params = useParams<{ stationId?: string }>();
  const station = useMemo(() => G1_STATIONS.find((item) => item.id === params.stationId) ?? G1_STATIONS[0]!, [params.stationId]);
  const [done, setDone] = useState(false);
  const type = LESSON_TYPES[(station.number - 1) % LESSON_TYPES.length]!;
  const companionId = COMPANIONS[(station.number - 1) % COMPANIONS.length]!;
  const node: PathNodeItem = {
    id: `station-${station.id}`,
    stationId: station.id,
    stepNumber: station.number,
    title: station.title,
    subtitle: station.subtitle,
    type,
    visualKind: 'LESSON',
    status: 'CURRENT',
    estimatedMinutes: station.estimatedMinutes,
  };

  const markCompleted = () => {
    try {
      const raw = localStorage.getItem('math_app_completed_node_ids');
      const current = raw ? JSON.parse(raw) as unknown : [];
      const ids = Array.isArray(current) ? current.map(String) : [];
      if (!ids.includes(station.id)) localStorage.setItem('math_app_completed_node_ids', JSON.stringify([...ids, station.id]));
    } catch { /* projection only */ }
    setDone(true);
  };

  if (done) return (
    <ChildRouteShell activeTab="PATH">
      <div dir="rtl" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 30, textAlign: 'center' }}>
        <div>
          <h1>ایستگاه تمام شد</h1>
          <p>نتیجه این تمرین ثبت شد.</p>
          <button onClick={() => router.push('/')} style={{ minHeight: 48, padding: '0 18px', borderRadius: 14 }}>بازگشت به مسیر</button>
        </div>
      </div>
    </ChildRouteShell>
  );

  return (
    <ChildRouteShell activeTab="PATH">
      <DuolingoLessonModal
        activeNode={node}
        activeCharId={companionId}
        onClose={() => router.push('/')}
        onCompleteNode={markCompleted}
        onEmitSemanticEvent={() => {}}
      />
    </ChildRouteShell>
  );
}
