'use client';

import React, { useEffect, useState } from 'react';
import { CHARACTERS, CompanionCharacter } from '../lib/persian';
import { CharacterArt, toCastId } from './CharacterArt';
import type { CastState } from '../lib/characterArt.generated';

/**
 * Public API kept for existing screens (AuthFlowScreen etc.).
 * v2: renders the Shomara cast v2 layered SVG. The name stays for compatibility;
 * there is NO Rive runtime on web yet — do not claim Rive support in QA/release notes.
 */
export type MascotState = 'idle' | 'working' | 'excited' | 'thinking';

const MASCOT_TO_CAST: Record<MascotState, CastState> = {
  idle: 'idle',
  working: 'think',
  thinking: 'think',
  excited: 'celebrate',
};

interface RiveCompanionMascotProps {
  characterId?: string;
  state?: MascotState;
  size?: number;
  interactive?: boolean;
  showSpeechBubble?: boolean;
  speechText?: string;
  onClick?: () => void;
  className?: string;
}

export function RiveCompanionMascot({
  characterId = 'aria',
  state = 'idle',
  size = 180,
  interactive = true,
  showSpeechBubble = false,
  speechText,
  onClick,
  className = '',
}: RiveCompanionMascotProps) {
  const [internalState, setInternalState] = useState<MascotState>(state);
  useEffect(() => setInternalState(state), [state]);

  const id = toCastId(characterId);
  const character: CompanionCharacter = CHARACTERS[id] || CHARACTERS['aria']!;
  const themeColor = character.themeColor;
  const displayText =
    speechText ||
    (internalState === 'excited' ? character.reactions.pass : internalState === 'idle' ? character.reactions.idle : character.reactions.hint);

  const handlePointerClick = () => {
    if (!interactive) return;
    setInternalState('excited');
    setTimeout(() => setInternalState(state), 1900);
    onClick?.();
  };

  const artWidth = Math.round(size * 0.86);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-end select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={handlePointerClick}
    >
      {showSpeechBubble && displayText && (
        <div
          className="absolute -top-12 z-20 bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-lg border-2 whitespace-nowrap pointer-events-none"
          style={{ borderColor: themeColor }}
        >
          {displayText}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r-2 border-b-2"
            style={{ borderColor: themeColor }}
          />
        </div>
      )}
      <div
        className={`relative flex items-end justify-center transition-transform duration-300 ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
        style={{ width: size, height: size }}
      >
        <CharacterArt
          id={id}
          state={MASCOT_TO_CAST[internalState]}
          size={artWidth}
          label={`${character.name}، ${character.role}`}
        />
      </div>
    </div>
  );
}
