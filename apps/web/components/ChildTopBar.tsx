'use client';

import React from 'react';
import { GradeMeta } from '../lib/persian';
import { DESIGN_TOKENS } from '../lib/theme/tokens';

interface ChildTopBarProps {
  selectedGrade: GradeMeta;
}

export function ChildTopBar({ selectedGrade }: ChildTopBarProps) {
  const gradeLabel = selectedGrade.title.replace(' ابتدایی', '');
  return (
    <header
      dir="rtl"
      aria-label="اطلاعات مسیر"
      style={{
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 14px',
        background: DESIGN_TOKENS.colors.neutral.white,
        borderBottom: `1px solid ${DESIGN_TOKENS.colors.neutral.border}`,
        fontFamily: DESIGN_TOKENS.typography.fonts.body,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 10px', borderRadius: 12, background: DESIGN_TOKENS.colors.neutral.cream, color: DESIGN_TOKENS.colors.neutral.charcoal, fontSize: 12, fontWeight: 800 }}>
        {gradeLabel}
      </div>
    </header>
  );
}
