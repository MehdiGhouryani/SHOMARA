import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface UiSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  interactive?: boolean;
}

export function UiSurface({ children, elevated = false, interactive = false, style, ...props }: UiSurfaceProps) {
  return (
    <div
      {...props}
      style={{
        background: 'var(--ds-bg-surface)',
        border: '1px solid var(--ds-border-subtle)',
        borderRadius: 'var(--ds-radius-2xl)',
        boxShadow: elevated ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
        ...(interactive ? { cursor: 'pointer', touchAction: 'manipulation' } : {}),
        ...style,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}
