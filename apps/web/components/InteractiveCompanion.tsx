'use client';

import React, { useState } from 'react';
import { CHARACTERS, CompanionCharacter } from '../lib/persian';
import { soundFx } from '../lib/sound';
import { CharacterArt, stateFromEvent } from './CharacterArt';
import type { AnimationSemanticEvent } from '@math/contracts';

interface InteractiveCompanionProps {
  characterId: string;
  semanticEvent?: AnimationSemanticEvent;
  customMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
  onTap?: () => void;
}

export function InteractiveCompanion({
  characterId,
  semanticEvent = 'SESSION_START',
  customMessage,
  size = 'md',
  showBubble = true,
  onTap,
}: InteractiveCompanionProps) {
  const [isTapped, setIsTapped] = useState(false);
  const char: CompanionCharacter = CHARACTERS[characterId] ?? CHARACTERS['aria']!;

  // Determine speech text based on event
  let speech = customMessage;
  if (!speech) {
    switch (semanticEvent) {
      case 'ANSWER_CORRECT':
        speech = char.reactions.correct;
        break;
      case 'ANSWER_WRONG':
      case 'NEAR_MISS':
        speech = char.reactions.wrong;
        break;
      case 'HINT_OPENED':
        speech = char.reactions.hint;
        break;
      case 'RECOVERY':
        speech = char.reactions.recovery;
        break;
      case 'STATION_PASS':
      case 'MILESTONE':
      case 'REWARD_GRANTED':
        speech = char.reactions.pass;
        break;
      default:
        speech = char.reactions.idle;
    }
  }

  const dimension = size === 'sm' ? 80 : size === 'lg' ? 170 : 120;

  function handleCharacterTap() {
    soundFx.playCharacterChirp(char.id);
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
    onTap?.();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {showBubble && speech && (
        <div
          className="character-speech-bubble"
          style={{
            maxWidth: 320,
            fontSize: size === 'sm' ? '13px' : '15px',
            color: '#1e293b',
            lineHeight: 1.6,
            textAlign: 'center',
            borderColor: char.themeColor + '40',
            backgroundColor: '#ffffff',
            boxShadow: `0 8px 24px ${char.themeColor}15`,
            animation: 'bounceIn 0.3s ease-out',
          }}
        >
          <span style={{ fontWeight: 700, color: char.themeColor, display: 'block', marginBottom: 2 }}>
            {char.name}:
          </span>
          {speech}
        </div>
      )}

      {/* Shomara cast v2 layered SVG (see project-design-v2) */}
      <button
        type="button"
        onClick={handleCharacterTap}
        aria-label={`شخصیت همراه ${char.name}`}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: '50%',
          backgroundColor: char.avatarBg,
          border: `3px solid ${char.themeColor}26`,
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 25px ${char.themeColor}25`,
          position: 'relative',
          cursor: 'pointer',
          padding: 0,
          transform: isTapped ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <CharacterArt
          id={char.id}
          state={stateFromEvent(semanticEvent)}
          size={Math.round(dimension * 0.78)}
          staticIdle={semanticEvent === 'SESSION_START' || semanticEvent === 'EXPLAIN'}
        />

      </button>
    </div>
  );
}
