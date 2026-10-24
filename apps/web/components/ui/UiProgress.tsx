export function UiProgress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} aria-label={label} style={{ width: '100%' }}>
      <div style={{ height: '12px', background: 'var(--ds-state-disabledSoft)', borderRadius: 'var(--ds-radius-full)', overflow: 'hidden' }}>
        <div style={{ width: `${clamped}%`, height: '100%', background: 'var(--ds-brand-emerald)', borderRadius: 'inherit', transition: 'width var(--ds-motion-normal) var(--ds-motion-ease)' }} />
      </div>
    </div>
  );
}
