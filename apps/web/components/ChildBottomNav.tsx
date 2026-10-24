'use client';

import React from 'react';
import { soundFx } from '../lib/sound';
import { DESIGN_TOKENS } from '@math/design-system';
import { CHILD_PRIMARY_NAV, type ChildTabId } from '@math/contracts';
import { ChildNavIcon } from './ChildNavIcon';

export type MainTabType = ChildTabId;

interface ChildBottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export function ChildBottomNav({ activeTab, onChangeTab }: ChildBottomNavProps) {
  return (
    <nav
      aria-label="ناوبری اصلی کودک"
      style={{
        position: 'relative',
        backgroundColor: DESIGN_TOKENS.colors.neutral.white,
        borderTop: `1px solid ${DESIGN_TOKENS.colors.neutral.border}`,
        display: 'grid',
        gridTemplateColumns: `repeat(${CHILD_PRIMARY_NAV.length}, minmax(0, 1fr))`,
        alignItems: 'stretch',
        padding: '6px 10px calc(10px + env(safe-area-inset-bottom, 0px))',
        zIndex: 40,
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box',
        gap: 8,
      }}
    >
      {CHILD_PRIMARY_NAV.map((tab) => {
        const isSelected = activeTab === tab.id;
        const iconName = tab.id === 'PATH' ? 'path' : tab.id === 'PRACTICE' ? 'practice' : 'profile';
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isSelected ? 'page' : undefined}
            aria-label={tab.label}
            onClick={() => {
              onChangeTab(tab.id);
              soundFx.playTap();
            }}
            style={{
              background: isSelected ? DESIGN_TOKENS.colors.brand.primaryLight : 'transparent',
              border: isSelected ? `1.5px solid ${DESIGN_TOKENS.colors.brand.primary}` : '1.5px solid transparent',
              borderRadius: DESIGN_TOKENS.radius.md,
              minHeight: 52,
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease',
              touchAction: 'manipulation',
              userSelect: 'none',
              outline: 'none',
              minWidth: 0,
              fontFamily: DESIGN_TOKENS.typography.fonts.body,
              color: isSelected ? DESIGN_TOKENS.colors.brand.primary : DESIGN_TOKENS.colors.neutral.slate,
            }}
          >
            <ChildNavIcon name={iconName} active={isSelected} size={23} />
            <span style={{ fontSize: 11, lineHeight: 1.1, fontWeight: isSelected ? DESIGN_TOKENS.typography.weights.black : DESIGN_TOKENS.typography.weights.semibold }}>
              {tab.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
