'use client';

import React, { useState } from 'react';
import { CharacterArt } from './CharacterArt';
import { PLACEMENT_ITEMS, scorePlacement } from '@math/contracts';
import { DESIGN_TOKENS } from '../lib/theme/tokens';

interface PlacementFlowProps {
  childName: string;
  onDone: (allCorrect: boolean) => void;
}

export function PlacementFlow({ childName, onDone }: PlacementFlowProps) {
  const [stage, setStage] = useState<'INTRO' | number | 'RESULT'>('INTRO');
  const [answers, setAnswers] = useState<Array<string | undefined>>([undefined, undefined]);

  function answer(choice: string) {
    if (typeof stage !== 'number') return;
    const next = [...answers];
    next[stage] = choice;
    setAnswers(next);
    if (stage + 1 < PLACEMENT_ITEMS.length) setStage(stage + 1);
    else setStage('RESULT');
  }

  function skip() { onDone(false); }
  const score = scorePlacement(answers).correct;

  return (
    <div role="dialog" aria-modal="true" aria-label="پیدا کردن نقطه شروع" dir="rtl" style={{ position: 'fixed', inset: 0, zIndex: 90, backgroundColor: DESIGN_TOKENS.colors.neutral.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#ffffff', textAlign: 'center', fontFamily: DESIGN_TOKENS.typography.fonts.body }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {stage === 'INTRO' && <>
          <CharacterArt id="aria" state="idle" size={96} label="آریا" reducedMotion />
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>{childName ? `${childName} جان، ` : ''}نقطه شروع را پیدا کنیم</h2>
          <p style={{ fontSize: 14, color: '#dbe4ef', lineHeight: 1.9 }}>این امتحان نیست. فقط کمک می‌کند از جای مناسب شروع کنیم و جواب اشتباه هیچ پاداش یا تنبیهی ندارد.</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => setStage(0)} style={{ minHeight: 56, border: 0, borderRadius: 18, backgroundColor: DESIGN_TOKENS.colors.brand.primary, color: '#fff', fontWeight: 900, fontSize: 16 }}>شروع</button>
            <button type="button" onClick={skip} style={{ minHeight: 52, border: '1px solid #475569', borderRadius: 18, backgroundColor: 'transparent', color: '#fff', fontWeight: 800, fontSize: 14 }}>فعلاً رد می‌کنم</button>
          </div>
        </>}

        {typeof stage === 'number' && <>
          <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700 }}>سؤال {stage + 1} از {PLACEMENT_ITEMS.length}</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, margin: '10px 0 16px' }}>{PLACEMENT_ITEMS[stage]!.prompt}</h3>
          <div style={{ minHeight: 84, display: 'grid', placeItems: 'center', padding: 14, borderRadius: 18, backgroundColor: '#1e293b', fontSize: 20, fontWeight: 900 }}>{PLACEMENT_ITEMS[stage]!.display}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            {PLACEMENT_ITEMS[stage]!.options.map((option) => <button key={option} type="button" onClick={() => answer(option)} style={{ minHeight: 72, borderRadius: 16, border: '2px solid #475569', backgroundColor: '#ffffff', color: '#172033', fontWeight: 900, fontSize: 18 }}>{option}</button>)}
          </div>
          <button type="button" onClick={skip} style={{ marginTop: 16, border: 0, background: 'transparent', color: '#bfdbfe', textDecoration: 'underline', fontWeight: 800 }}>فعلاً رد می‌کنم</button>
        </>}

        {stage === 'RESULT' && <>
          <CharacterArt id={score === PLACEMENT_ITEMS.length ? 'jiko' : 'aria'} state={score === PLACEMENT_ITEMS.length ? 'celebrate' : 'encourage'} size={96} label="راهنما" reducedMotion />
          <h2 style={{ fontSize: 21, fontWeight: 900 }}>نقطه شروع مشخص شد</h2>
          <p style={{ fontSize: 14, color: '#dbe4ef', lineHeight: 1.9 }}>{score === PLACEMENT_ITEMS.length ? 'می‌توانیم سریع‌تر وارد تمرین مستقل شویم.' : 'از پایه شروع می‌کنیم و هرجا لازم باشد بیشتر تمرین می‌کنیم.'} این نتیجه فقط یک پیشنهاد است.</p>
          <button type="button" onClick={() => onDone(score === PLACEMENT_ITEMS.length)} style={{ marginTop: 12, minHeight: 56, border: 0, borderRadius: 18, backgroundColor: DESIGN_TOKENS.colors.brand.primary, color: '#fff', fontWeight: 900, fontSize: 16 }}>ادامه به یادگیری</button>
        </>}
      </div>
    </div>
  );
}
