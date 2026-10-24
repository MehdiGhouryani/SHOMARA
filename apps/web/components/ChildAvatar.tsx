'use client';

import type { ChildAvatarPresetId } from '@math/contracts';
import { CHILD_AVATAR_PRESETS } from '@math/contracts';

interface ChildAvatarProps {
  presetId: ChildAvatarPresetId;
  name?: string;
  size?: number;
  label?: string;
}

export function ChildAvatar({ presetId, name = '', size = 88, label }: ChildAvatarProps) {
  const preset = CHILD_AVATAR_PRESETS.find((item) => item.id === presetId) ?? CHILD_AVATAR_PRESETS[0]!;
  const initial = name.trim().slice(0, 1) || '؟';
  return (
    <div
      role="img"
      aria-label={label ?? `آواتار ${preset.label}`}
      className="child-avatar"
      style={{ width: size, height: size, ['--avatar-accent' as string]: preset.accent, ['--avatar-soft' as string]: preset.soft }}
    >
      <span className="child-avatar__ring" aria-hidden="true" />
      <span className="child-avatar__shape" aria-hidden="true" />
      <span className="child-avatar__initial" aria-hidden="true">{initial}</span>
    </div>
  );
}
