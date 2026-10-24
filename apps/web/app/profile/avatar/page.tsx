'use client';

import { useEffect, useState } from 'react';
import { ChildRouteShell } from '../../../components/ChildRouteShell';
import { AvatarWorkshopView } from '../../../components/AvatarWorkshopView';
import type { ChildAvatarPresetId } from '@math/contracts';

export default function AvatarPage() {
  const [name, setName] = useState('دوست ریاضی');
  const [preset, setPreset] = useState<ChildAvatarPresetId>('sun');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('math_app_child_profile');
      if (!raw) return;
      const p = JSON.parse(raw) as { childName?: string; avatarPresetId?: ChildAvatarPresetId };
      setName(p.childName || 'دوست ریاضی');
      if (p.avatarPresetId) setPreset(p.avatarPresetId);
    } catch { /* best-effort: failure is intentionally non-fatal */ }
  }, []);
  const save = (next: ChildAvatarPresetId) => {
    try {
      const raw = localStorage.getItem('math_app_child_profile');
      const p = raw ? JSON.parse(raw) as Record<string, unknown> : {};
      localStorage.setItem('math_app_child_profile', JSON.stringify({ ...p, avatarPresetId: next }));
      setPreset(next);
    } catch { /* best-effort: failure is intentionally non-fatal */ }
  };
  return <ChildRouteShell activeTab="PROFILE"><AvatarWorkshopView childName={name} initialPreset={preset} onSaved={save} /></ChildRouteShell>;
}
