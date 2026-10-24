import type { CSSProperties, ReactNode } from 'react';

export type UiBadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'error';

const tones: Record<UiBadgeTone, CSSProperties> = {
  neutral: { background: 'var(--ds-state-disabledSoft)', color: 'var(--ds-text-secondary)' },
  primary: { background: 'var(--ds-brand-primarySoft)', color: 'var(--ds-brand-primaryDark)' },
  success: { background: 'var(--ds-state-successSoft)', color: 'var(--ds-state-success)' },
  warning: { background: 'var(--ds-state-warningSoft)', color: 'var(--ds-state-warning)' },
  info: { background: 'var(--ds-state-infoSoft)', color: 'var(--ds-state-info)' },
  error: { background: 'var(--ds-state-errorSoft)', color: 'var(--ds-state-error)' },
};

export function UiBadge({ tone = 'neutral', children }: { tone?: UiBadgeTone; children: ReactNode }) {
  return (
    <span
      style={{
        ...tones[tone],
        minHeight: '32px',
        paddingInline: 'var(--ds-space-3)',
        borderRadius: 'var(--ds-radius-full)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--ds-font-family)',
        fontSize: 'var(--ds-type-xs-size)',
        fontWeight: '700',
        lineHeight: '1',
      }}
    >
      {children}
    </span>
  );
}
