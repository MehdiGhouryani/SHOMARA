'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MobileFrame } from '../components/MobileFrame';
import { ChildBottomNav, type MainTabType } from '../components/ChildBottomNav';
import { DuolingoPath } from '../components/DuolingoPath';
import { PracticeHubView } from '../components/PracticeHubView';
import { ProfileView } from '../components/ProfileView';
import { GRADES, type GradeMeta } from '../lib/persian';

interface ChildProfile {
  childName: string;
  gradeId: string;
  avatarPresetId?: 'sun' | 'leaf' | 'cloud' | 'moon';
}

const DEFAULT_PROFILE: ChildProfile = { childName: 'آرش', gradeId: 'G1' };

function canonicalCompletedStationIds(ids: readonly string[]): string[] {
  const mapping: Record<string, string> = {
    'step-1': 'ST01', 'step-2': 'ST01', 'step-3': 'ST01', 'step-4': 'ST01', 'step-5': 'ST01',
    'step-6': 'ST01', 'step-7': 'ST01', 'step-8': 'ST01', 'step-9': 'ST01', 'step-10': 'ST01',
    'station-ST01': 'ST01', 'station-ST02': 'ST02', 'station-ST03': 'ST03', 'station-ST04': 'ST04', 'station-ST05': 'ST05',
  };
  return Array.from(new Set(ids.map((id) => mapping[id] ?? id).filter((id) => /^ST\d\d$/.test(id))));
}

function ChildHomeContent() {
  const [activeTab, setActiveTab] = useState<MainTabType>('PATH');
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [selectedGrade, setSelectedGrade] = useState<GradeMeta>(GRADES[0]!);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('math_app_child_profile');
      if (!savedProfile) setFirstRun(true);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as Partial<ChildProfile>;
        const merged: ChildProfile = {
          childName: parsed.childName || DEFAULT_PROFILE.childName,
          gradeId: parsed.gradeId || DEFAULT_PROFILE.gradeId,
          avatarPresetId: parsed.avatarPresetId,
        };
        setProfile(merged);
        setSelectedGrade(GRADES.find((g) => g.id === merged.gradeId) || GRADES[0]!);
      }
      const savedNodes = localStorage.getItem('math_app_completed_node_ids');
      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        if (Array.isArray(parsedNodes)) setCompletedNodeIds(parsedNodes);
      }
    } catch {
      setFirstRun(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated && firstRun) router.replace('/welcome');
  }, [firstRun, hydrated, router]);

  useEffect(() => {
    const queryTab = searchParams.get('tab');
    if (queryTab === 'practice') {
      setActiveTab('PRACTICE');
    } else if (queryTab === 'profile') setActiveTab('PROFILE');
    else if (queryTab === 'path') setActiveTab('PATH');
  }, [searchParams]);

  if (!hydrated || firstRun) return null;

  const completedStationIds = canonicalCompletedStationIds(completedNodeIds);

  return (
    <MobileFrame>
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ds-bg-canvas)', WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'PATH' && (
          <DuolingoPath
            selectedGrade={selectedGrade}
            completedNodeIds={completedNodeIds}
            onSelectNode={(node) => router.push(node.stationId ? `/station/${node.stationId}/start` : '/unit/G1-U01')}
          />
        )}
        {activeTab === 'PRACTICE' && (
          <PracticeHubView completedNodeIds={completedNodeIds} onGoPath={() => setActiveTab('PATH')} />
        )}
        {activeTab === 'PROFILE' && (
          <ProfileView
            childName={profile.childName}
            gradeTitle={selectedGrade.title}
            avatarPresetId={profile.avatarPresetId}
            completedStationIds={completedStationIds}
          />
        )}
      </main>
      <ChildBottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </MobileFrame>
  );
}

// useSearchParams() needs a Suspense boundary or `next build` cannot prerender this page.
export default function ChildHomePage() {
  return (
    <Suspense fallback={null}>
      <ChildHomeContent />
    </Suspense>
  );
}
