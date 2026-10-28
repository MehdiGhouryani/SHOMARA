'use client';

import React from 'react';

export type ChildNavIconName = 'path' | 'practice' | 'treasure' | 'profile';

interface ChildNavIconProps {
  name: ChildNavIconName;
  active?: boolean;
  size?: number;
}

const PATHS: Record<ChildNavIconName, React.ReactNode> = {
  path: <><path d="M4 19 10 13l4 4 6-8" /><path d="M16 9h4v4" /><circle cx="4" cy="19" r="1.7" /><circle cx="10" cy="13" r="1.7" /></>,
  practice: <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><path d="m15.5 17 2 2 3.5-4" /></>,
  treasure: <><path d="M4 7.5 6 5h12l2 2.5v10A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10Z" /><path d="M4 9h16" /><path d="M9 13h6" /><path d="M10 12v3m4-3v3" /></>,
  profile: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-3.3 3.1-5 6.5-5s5.7 1.7 6.5 5" /></>,
};

export function ChildNavIcon({ name, active = false, size = 24 }: ChildNavIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
