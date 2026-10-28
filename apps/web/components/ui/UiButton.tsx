'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export type UiButtonVariant = 'primary' | 'secondary' | 'success' | 'neutral' | 'outline' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

const variantStyle: Record<UiButtonVariant, CSSProperties> = {
  primary: { background: 'var(--ds-brand-primary)', color: 'var(--ds-text-inverse)', boxShadow: 'var(--ds-shadow-tactilePrimary)', borderColor: 'var(--ds-brand-primary)' },
  secondary: { background: 'var(--ds-brand-secondary)', color: 'var(--ds-text-inverse)', boxShadow: 'var(--ds-shadow-tactileSecondary)', borderColor: 'var(--ds-brand-secondary)' },
  success: { background: 'var(--ds-brand-emerald)', color: 'var(--ds-text-inverse)', boxShadow: 'var(--ds-shadow-tactileSuccess)', borderColor: 'var(--ds-brand-emerald)' },
  neutral: { background: 'var(--ds-state-disabledSoft)', color: 'var(--ds-text-secondary)', boxShadow: 'var(--ds-shadow-tactileNeutral)', borderColor: 'var(--ds-border-default)' },
  outline: { background: 'var(--ds-bg-surface)', color: 'var(--ds-text-primary)', boxShadow: 'var(--ds-shadow-tactileNeutral)', borderColor: 'var(--ds-border-default)' },
  ghost: { background: 'transparent', color: 'var(--ds-text-secondary)', boxShadow: 'none', borderColor: 'transparent' },
  danger: { background: 'var(--ds-state-error)', color: 'var(--ds-text-inverse)', boxShadow: 'var(--ds-shadow-tactileNeutral)', borderColor: 'var(--ds-state-error)' },
};

const sizeStyle: Record<UiButtonSize, CSSProperties> = {
  sm: { minHeight: 'var(--ds-size-touchMin)', paddingInline: 'var(--ds-space-3)', fontSize: 'var(--ds-type-sm-size)', borderRadius: 'var(--ds-radius-lg)' },
  md: { minHeight: 'var(--ds-size-touchPrimary)', paddingInline: 'var(--ds-space-4)', fontSize: 'var(--ds-type-body-size)', borderRadius: 'var(--ds-radius-xl)' },
  lg: { minHeight: '56px', paddingInline: 'var(--ds-space-6)', fontSize: 'var(--ds-type-lg-size)', borderRadius: 'var(--ds-radius-2xl)' },
};

export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function UiButton({ variant = 'primary', size = 'md', fullWidth = false, icon, style, children, ...props }: UiButtonProps) {
  const state = variantStyle[variant];
  const sizing = sizeStyle[size];
  return (
    <button
      {...props}
      style={{
        ...state,
        ...sizing,
        width: fullWidth ? '100%' : undefined,
        borderWidth: '1px',
        borderStyle: 'solid',
        fontFamily: 'var(--ds-font-family)',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ds-space-2)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.55 : 1,
        transition: 'transform var(--ds-motion-fast) var(--ds-motion-ease), box-shadow var(--ds-motion-fast) var(--ds-motion-ease), background-color var(--ds-motion-fast) var(--ds-motion-ease)',
        touchAction: 'manipulation',
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
