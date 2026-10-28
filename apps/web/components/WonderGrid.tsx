'use client';

import React, { useState } from 'react';
import { soundFx } from '../lib/sound';

interface WonderGridProps {
  onSuccess: () => void;
}

type ColorType = 'red' | 'blue' | 'yellow' | 'green' | null;

interface ColorMeta {
  id: ColorType;
  label: string;
  bg: string;
  border: string;
  dot: string;
}

const COLORS: Record<string, ColorMeta> = {
  red: { id: 'red', label: 'قرمز', bg: '#fee2e2', border: '#ef4444', dot: '🔴' },
  blue: { id: 'blue', label: 'آبی', bg: '#dbeafe', border: '#3b82f6', dot: '🔵' },
  yellow: { id: 'yellow', label: 'زرد', bg: '#fef3c7', border: '#f59e0b', dot: '🟡' },
  green: { id: 'green', label: 'سبز', bg: '#d1fae5', border: '#10b981', dot: '🟢' },
};

export function WonderGrid({ onSuccess }: WonderGridProps) {
  // 2x2 grid initial state with pre-filled clues
  // [row0_col0, row0_col1]
  // [row1_col0, row1_col1]
  // Target:
  // [red,   blue]
  // [blue,  red]
  const [grid, setGrid] = useState<[ColorType, ColorType, ColorType, ColorType]>([
    'red',
    null,
    'blue',
    null,
  ]);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(1); // default target empty cell
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCellClick(index: number) {
    // Only cells 1 and 3 are playable (0 and 2 are pre-filled clues)
    if (index === 0 || index === 2) return;
    soundFx.playTap();
    setSelectedCellIndex(index);
    setFeedback(null);
  }

  function handleColorSelect(color: ColorType) {
    if (selectedCellIndex === null) return;
    soundFx.playBubblePop();
    const nextGrid = [...grid] as [ColorType, ColorType, ColorType, ColorType];
    nextGrid[selectedCellIndex] = color;
    setGrid(nextGrid);

    // Check solution
    // Row 0: grid[0] != grid[1]
    // Row 1: grid[2] != grid[3]
    // Col 0: grid[0] != grid[2]
    // Col 1: grid[1] != grid[3]
    const [c0, c1, c2, c3] = nextGrid;
    if (c1 !== null && c3 !== null) {
      const isCorrect = c1 === 'blue' && c3 === 'red';
      if (isCorrect) {
        soundFx.playSuccess();
        setFeedback('correct');
        onSuccess();
      } else {
        soundFx.playTryAgain();
        setFeedback('duplicate');
      }
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22 }}>🧩</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
            جدول شگفت‌انگیز (سودوکوی ۲×۲):
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          صفحه ۹ و ۱۵ کتاب درسی
        </span>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
        در هر سطر و در هر ستون، هر رنگ باید <b>فقط یک‌بار</b> بیاید. جای خانه‌های خالی را با رنگ درست کامل کن:
      </p>

      {/* 2x2 Grid Display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          backgroundColor: '#faf8f5',
          border: '2px solid var(--border-subtle)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
          width: 220,
          margin: '0 auto 16px',
        }}
      >
        {grid.map((cellColor, idx) => {
          const isFixed = idx === 0 || idx === 2;
          const isSelected = selectedCellIndex === idx;
          const meta = cellColor ? COLORS[cellColor] : null;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              style={{
                width: 90,
                height: 90,
                borderRadius: 16,
                border: isSelected
                  ? '3px solid #3b52d4'
                  : meta
                  ? `2px solid ${meta.border}`
                  : '2px dashed #94a3b8',
                backgroundColor: meta ? meta.bg : isSelected ? '#eef2ff' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isFixed ? 'default' : 'pointer',
                fontSize: 34,
                boxShadow: isSelected ? '0 4px 12px rgba(59,82,212,0.25)' : 'none',
                position: 'relative',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
              }}
            >
              {meta ? (
                meta.dot
              ) : (
                <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 800 }}>❓</span>
              )}
              {isFixed && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 6,
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 700,
                  }}
                >
                  الگو
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Color Selection Palette */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => handleColorSelect('blue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 14,
            border: '2px solid #3b82f6',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
          }}
        >
          <span>🔵</span>
          <span>آبی</span>
        </button>

        <button
          type="button"
          onClick={() => handleColorSelect('red')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 14,
            border: '2px solid #ef4444',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
          }}
        >
          <span>🔴</span>
          <span>قرمز</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback === 'duplicate' && (
        <div
          style={{
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
          ⚠️ در یک سطر یا ستون رنگ تکراری قرار گرفت! دوباره دقت کن.
        </div>
      )}
      {feedback === 'correct' && (
        <div
          style={{
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
          🎉 آفرین! قانون جدول شگفت‌انگیز را کاملاً رعایت کردی!
        </div>
      )}
    </div>
  );
}
