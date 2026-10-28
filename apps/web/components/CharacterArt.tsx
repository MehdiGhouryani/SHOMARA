'use client';

import React, { useEffect, useId, useState } from 'react';
import type { CastState } from '../lib/characterArt.generated';
import { characterArtAttrs, characterMarkup, toCastId } from '../lib/characterArtMarkup';
import type { AnimationSemanticEvent, CharacterVisualState } from '@math/contracts';
import { CHARACTER_STATE_BY_EVENT } from '@math/contracts';

/**
 * Shomara cast v2 renderer (web). Single source: project-design-v2/source/shomara-cast.mjs.
 * Layered SVG + CSS motion (globals.css "Shomara cast v2"). Swap for Rive when .riv assets ship;
 * this stays as the packaged fallback and the reduced-motion path.
 */
export interface CharacterArtProps {
  id: string;
  state?: CastState;
  size?: number; // width in px; height keeps the 224:256 canvas unless bust
  bust?: boolean;
  /** lesson mode: no looping body motion (ADR: idle is static during questions) */
  staticIdle?: boolean;
  reducedMotion?: boolean;
  label?: string;
  className?: string;
}

export { toCastId };

export function stateFromVisual(v: CharacterVisualState): CastState {
  return v.toLowerCase() as CastState;
}

export function stateFromEvent(e: AnimationSemanticEvent | undefined): CastState {
  return stateFromVisual(CHARACTER_STATE_BY_EVENT[e ?? 'SESSION_START'] ?? 'IDLE');
}

export function CharacterArt({
  id,
  state = 'idle',
  size = 120,
  bust = false,
  staticIdle = false,
  reducedMotion,
  label,
  className = '',
}: CharacterArtProps) {
  const [osReduced, setOsReduced] = useState(false);
  const instance = useId();
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const a = characterArtAttrs({ id, state, size, bust, staticIdle, reducedMotion, osReduced });
  // layers are class-targeted and gradient ids are instance-scoped: any number of guides can share a page
  const svg = characterMarkup(a.cid, state, bust, instance);
  return (
    <div
      // remount on state change so one-shot animations replay (stable key: no extra mount on first render)
      key={a.remountKey}
      className={`sh-char ${className}`}
      data-character={a.cid}
      data-state={a.dataState}
      data-static={a.dataStatic}
      data-reduced={a.dataReduced}
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: a.width, height: a.height }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
