'use client';

import React, { useState } from 'react';
import { soundFx } from '../lib/sound';

interface SymmetryMirrorProps {
  onSuccess: () => void;
}

export function SymmetryMirror({ onSuccess }: SymmetryMirrorProps) {
  // 3x2 grid on the right side to mirror the left side
  // Target left side:
  // [row0_col0: teal,   row0_col1: empty]
  // [row1_col0: orange, row1_col1: orange]
  // [row2_col0: empty,  row2_col1: purple]
  //
  // Expected right side (mirrored across center vertical axis):
  // [row0_col0: empty,  row0_col1: teal]
  // [row1_col0: orange, row1_col1: orange]
  // [row2_col0: purple, row2_col1: empty]
  const [rightGrid, setRightGrid] = useState<[string | null, string | null, string | null, string | null, string | null, string | null]>([
    null, null,
    null, null,
    null, null,
  ]);

  const [activeColor, setActiveColor] = useState<string>('#0d9488'); // teal default
  const [solved, setSolved] = useState<boolean>(false);

  function handleCellClick(index: number) {
    if (solved) return;
    soundFx.playBubblePop();
    const next = [...rightGrid] as [string | null, string | null, string | null, string | null, string | null, string | null];
    // toggle or set color
    next[index] = next[index] === activeColor ? null : activeColor;
    setRightGrid(next);

    // Check symmetry:
    // idx 1 should be '#0d9488'
    // idx 2 should be '#f97316'
    // idx 3 should be '#f97316'
    // idx 4 should be '#8b5cf6'
    // others null
    const isCorrect =
      next[0] === null &&
      next[1] === '#0d9488' &&
      next[2] === '#f97316' &&
      next[3] === '#f97316' &&
      next[4] === '#8b5cf6' &&
      next[5] === null;

    if (isCorrect) {
      soundFx.playSuccess();
      setSolved(true);
      onSuccess();
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
          <span style={{ fontSize: 22 }}>🪞</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
            آینه تقارن و خط‌کش (صفحه ۲۳ و ۴۲ کتاب):
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 800 }}>
          با ابزار کار کن 🐸
        </span>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
        نیمه سمت راست فرش را طوری رنگ کن که <b>قرینه</b> نیمه سمت چپ نسبت به خط قرمز تقارن باشد:
      </p>

      {/* The Mirrored Canvas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#faf8f5',
          border: '2px solid var(--border-subtle)',
          borderRadius: 18,
          padding: '16px 12px',
          marginBottom: 16,
        }}
      >
        {/* Left Grid (Fixed Clue) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 40px)',
            gap: 6,
          }}
        >
          {/* Row 0 */}
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#0d9488', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1' }} />
          {/* Row 1 */}
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f97316', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f97316', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
          {/* Row 2 */}
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1' }} />
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#8b5cf6', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
        </div>

        {/* Symmetry Line (Red Vertical Axis) */}
        <div
          style={{
            width: 4,
            height: 140,
            backgroundColor: '#ef4444',
            margin: '0 12px',
            borderRadius: 999,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: '#ef4444',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            خط تقارن
          </span>
        </div>

        {/* Right Grid (Child Interacts) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 40px)',
            gap: 6,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const cellColor = rightGrid[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: cellColor ?? '#ffffff',
                  border: cellColor ? 'none' : '2px dashed #94a3b8',
                  boxShadow: cellColor ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  touchAction: 'manipulation',
                  pointerEvents: 'auto',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>انتخاب رنگ مداد:</span>
        <button
          type="button"
          onClick={() => {
            soundFx.playTap();
            setActiveColor('#0d9488');
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#0d9488',
            border: activeColor === '#0d9488' ? '3px solid #1e293b' : '2px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
          }}
        />
        <button
          type="button"
          onClick={() => {
            soundFx.playTap();
            setActiveColor('#f97316');
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#f97316',
            border: activeColor === '#f97316' ? '3px solid #1e293b' : '2px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
          }}
        />
        <button
          type="button"
          onClick={() => {
            soundFx.playTap();
            setActiveColor('#8b5cf6');
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            border: activeColor === '#8b5cf6' ? '3px solid #1e293b' : '2px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
          }}
        />
      </div>

      {solved && (
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
          🎉 آفرین! شکل کاملاً متقارن شد!
        </div>
      )}
    </div>
  );
}
