'use client';

import React, { useState } from 'react';
import { toPersianDigits } from '../lib/persian';
import { soundFx } from '../lib/sound';

interface ComparisonScaleProps {
  leftCount: number;
  rightCount: number;
  leftItem: string;
  rightItem: string;
  onCorrect: () => void;
}

export function ComparisonScale({
  leftCount = 4,
  rightCount = 2,
  leftItem = '🍎',
  rightItem = '🍐',
  onCorrect,
}: ComparisonScaleProps) {
  const [selectedSign, setSelectedSign] = useState<'<' | '>' | '=' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const correctSign: '<' | '>' | '=' =
    leftCount > rightCount ? '>' : leftCount < rightCount ? '<' : '=';

  function handleSelect(sign: '<' | '>' | '=') {
    setSelectedSign(sign);
    if (sign === correctSign) {
      soundFx.playSuccess();
      setFeedback('CORRECT');
      onCorrect();
    } else {
      soundFx.playTryAgain();
      setFeedback('WRONG');
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid var(--border-subtle)',
        borderRadius: 22,
        padding: '16px 20px',
        boxShadow: '0 4px 0 var(--border-subtle)',
        width: '100%',
        maxWidth: 380,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
            ترازوی مقایسه کمتر، بیشتر، مساوی:
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>
          صفحه ۷۶ و ۷۹ کتاب 🦁
        </span>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
        تعداد شکل‌های سمت چپ و راست را بشمار؛ علامت مناسب را انتخاب کن:
      </p>

      {/* Comparison Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#faf8f5',
          border: '2px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '16px 14px',
          marginBottom: 18,
        }}
      >
        {/* Left Set */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 48, maxWidth: 100 }}>
            {Array.from({ length: leftCount }).map((_, i) => (
              <span key={i} style={{ fontSize: 24 }}>{leftItem}</span>
            ))}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginTop: 6 }}>
            {toPersianDigits(leftCount)}
          </div>
        </div>

        {/* Selected Sign Circle */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: selectedSign ? '#eef2ff' : '#ffffff',
            border: selectedSign ? '3px solid #3b52d4' : '2px dashed #94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#3b52d4',
            boxShadow: selectedSign ? '0 4px 10px rgba(59,82,212,0.2)' : 'none',
          }}
        >
          {selectedSign ? selectedSign : '؟'}
        </div>

        {/* Right Set */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 48, maxWidth: 100 }}>
            {Array.from({ length: rightCount }).map((_, i) => (
              <span key={i} style={{ fontSize: 24 }}>{rightItem}</span>
            ))}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginTop: 6 }}>
            {toPersianDigits(rightCount)}
          </div>
        </div>
      </div>

      {/* Choice Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => handleSelect('>')}
          className={`math-choice-card ${selectedSign === '>' ? 'selected' : ''}`}
          style={{ flex: 1, fontSize: 24, padding: '12px 0', cursor: 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          {'>'}
        </button>
        <button
          type="button"
          onClick={() => handleSelect('=')}
          className={`math-choice-card ${selectedSign === '=' ? 'selected' : ''}`}
          style={{ flex: 1, fontSize: 24, padding: '12px 0', cursor: 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          {'='}
        </button>
        <button
          type="button"
          onClick={() => handleSelect('<')}
          className={`math-choice-card ${selectedSign === '<' ? 'selected' : ''}`}
          style={{ flex: 1, fontSize: 24, padding: '12px 0', cursor: 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          {'<'}
        </button>
      </div>

      {feedback === 'CORRECT' && (
        <div
          style={{
            marginTop: 14,
            backgroundColor: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          🎉 آفرین! دهانه باز علامت همیشه به سمت عدد بزرگتر است.
        </div>
      )}
      {feedback === 'WRONG' && (
        <div
          style={{
            marginTop: 14,
            backgroundColor: '#ffedd5',
            color: '#c2410c',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          💡 دهانه باز علامت باید رو به دسته بزرگتر باشد، دوباره امتحان کن.
        </div>
      )}
    </div>
  );
}
