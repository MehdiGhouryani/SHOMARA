'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileFrame } from './MobileFrame';
import { ChildTopBar } from './ChildTopBar';
import { ChildBottomNav, type MainTabType } from './ChildBottomNav';
import { GRADES, type GradeMeta } from '../lib/persian';
import { type ChildTabId } from '@math/contracts';

const TAB_ROUTE: Record<ChildTabId, string> = {
  PATH: '/',
  PRACTICE: '/?tab=practice',
  PROFILE: '/?tab=profile',
};

export function ChildRouteShell({ activeTab = 'PATH', children }: { activeTab?: MainTabType; children: React.ReactNode }) {
  const router = useRouter();
  const [gradeId, setGradeId] = useState('G1');
  const [childName, setChildName] = useState('دوست ریاضی');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('math_app_child_profile');
      if (raw) {
        const profile = JSON.parse(raw) as { childName?: string; gradeId?: string };
        setChildName(profile.childName || 'دوست ریاضی');
        setGradeId(profile.gradeId || 'G1');
      }
    } catch {
      // Keep safe defaults.
    }
  }, []);

  const grade: GradeMeta = useMemo(() => GRADES.find((item) => item.id === gradeId) ?? GRADES[0]!, [gradeId]);

  return (
    <MobileFrame>
      <ChildTopBar selectedGrade={grade} />
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: 'var(--ds-bg-canvas)' }} aria-label={`فضای یادگیری ${childName}`}>
        {children}
      </main>
      <ChildBottomNav activeTab={activeTab} onChangeTab={(tab) => router.push(TAB_ROUTE[tab])} />
    </MobileFrame>
  );
}
