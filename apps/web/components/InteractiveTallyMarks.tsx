'use client';

import React from 'react';
import { toPersianDigits } from '../lib/persian';
import { soundFx } from '../lib/sound';

interface InteractiveTallyMarksProps {
  count: number;
  maxCount?: number;
  onChangeCount: (newCount: number) => void;
}

export function InteractiveTallyMarks({
  count,
  maxCount = 10,
  onChangeCount,
}: InteractiveTallyMarksProps) {
  // Break into bundles of 5
  const fullBundles = Math.floor(count / 5);
  const remainder = count % 5;

  function handleAdd() {
    if (count < maxCount) {
      soundFx.playBubblePop();
      onChangeCount(count + 1);
    }
  }

  function handleRemove() {
    if (count > 0) {
      soundFx.playTap();
      onChangeCount(count - 1);
    }
  }

  function handleReset() {
    soundFx.playTap();
    onChangeCount(0);
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
      {/* Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>✏️</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
            چوب‌خط‌های من:
          </span>
        </div>
        <div
          style={{
            backgroundColor: '#eef2ff',
            color: '#3b52d4',
            fontWeight: 800,
            fontSize: 14,
            padding: '3px 10px',
            borderRadius: 12,
          }}
        >
          {toPersianDigits(count)} چوب‌خط
        </div>
      </div>

      {/* Visual Tally Canvas */}
      <div
        style={{
          minHeight: 80,
          backgroundColor: '#faf8f5',
          border: '2px dashed var(--border-subtle)',
          borderRadius: 16,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 14,
        }}
      >
        {count === 0 ? (
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            با دکمه‌های زیر، چوب‌خط اضافه کنید...
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, direction: 'ltr' }}>
            {/* Full 5-bundles */}
            {Array.from({ length: fullBundles }).map((_, bIdx) => (
              <div
                key={`b-${bIdx}`}
                style={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* 4 vertical lines */}
                {[0, 1, 2, 3].map((lineIdx) => (
                  <div
                    key={lineIdx}
                    style={{
                      width: 5,
                      height: 48,
                      backgroundColor: '#2563eb',
                      borderRadius: 4,
                    }}
                  />
                ))}
                {/* 5th diagonal strike */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: -4,
                    width: 60,
                    height: 5,
                    backgroundColor: '#dc2626',
                    borderRadius: 4,
                    transform: 'translateY(-50%) rotate(-38deg)',
                    transformOrigin: 'center center',
                    boxShadow: '0 2px 4px rgba(220,38,38,0.3)',
                  }}
                />
              </div>
            ))}

            {/* Remainder vertical lines (1 to 4) */}
            {remainder > 0 && (
              <div
                style={{
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {Array.from({ length: remainder }).map((_, rIdx) => (
                  <div
                    key={`r-${rIdx}`}
                    style={{
                      width: 5,
                      height: 48,
                      backgroundColor: '#2563eb',
                      borderRadius: 4,
                      animation: 'victorySparkle 0.2s ease-out',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={count >= maxCount}
          className={count >= maxCount ? 'math-btn-disabled' : 'math-btn-primary'}
          style={{ flex: 2, padding: '10px 0', fontSize: 15, cursor: count >= maxCount ? 'not-allowed' : 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          <span>➕ یک چوب‌خط بکش</span>
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={count <= 0}
          className="math-btn-outline"
          style={{ flex: 1, padding: '10px 0', fontSize: 13, cursor: count <= 0 ? 'not-allowed' : 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          <span>پاک کن</span>
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={count <= 0}
          className="math-btn-outline"
          style={{ padding: '10px 14px', fontSize: 13, color: '#dc2626', cursor: count <= 0 ? 'not-allowed' : 'pointer', touchAction: 'manipulation', pointerEvents: 'auto' }}
          title="شروع مجدد"
        >
          <span>↺</span>
        </button>
      </div>
    </div>
  );
}
