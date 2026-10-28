'use client';

import { useSearchParams } from 'next/navigation';
import { ChildRouteShell } from '../../../../components/ChildRouteShell';
import { JumpAssessmentView } from '../../../../components/JumpAssessmentView';

export default function UnitJumpPage() {
  const search = useSearchParams();
  const targetStationId = search.get('targetStationId') ?? 'ST06';
  return (
    <ChildRouteShell activeTab="PATH">
      <JumpAssessmentView targetStationId={targetStationId} />
    </ChildRouteShell>
  );
}
