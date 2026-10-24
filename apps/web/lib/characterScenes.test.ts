import { describe, it, expect } from 'vitest';
import { lessonGuideFor } from './characterScenes';
import { resolveGuide, isGuideAllowed } from '@math/contracts';
import { characterMarkup, characterArtAttrs, safeInstanceKey } from './characterArtMarkup';
describe('allowedScenes', () => {
  it('no guide on CHECK', () => { for (const c of ['aria','qbo','dana','jiko']) expect(lessonGuideFor(c, 'CHECK')).toBe(null); });
  it('jiko only rewards', () => { expect(lessonGuideFor('jiko','COUNT')).toBe('qbo'); expect(lessonGuideFor('jiko','PATTERN')).toBe('dana'); expect(lessonGuideFor('aria','CHEST')).toBe('jiko'); expect(isGuideAllowed('jiko','hint')).toBe(false); });
  it('keeps companion when allowed', () => { expect(lessonGuideFor('qbo','COUNT')).toBe('qbo'); expect(lessonGuideFor('dana','SYMMETRY')).toBe('dana'); expect(resolveGuide('jiko','lesson-intro')).toBe('aria'); });
});
describe('CharacterArt markup', () => {
  it('instance-scoped ids, no layer ids', () => { const a = characterMarkup('aria','idle',false,':r1:'), b = characterMarkup('aria','idle',false,':r2:');
    const ids = (s: string) => [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]); const all = [...ids(a), ...ids(b)];
    expect(new Set(all).size).toBe(all.length); expect(a.includes('__SHU__')).toBe(false); expect(a.includes('class="sh-head"')).toBe(true); expect(safeInstanceKey(':r1:')).toBe('shr1'); });
  it('attrs: bust/static/reduced', () => { const x = characterArtAttrs({ id: 'nope', state: 'think', bust: true, size: 40, staticIdle: true, reducedMotion: true });
    expect(x.cid).toBe('aria'); expect(x.dataState).toBe('idle'); expect(x.height).toBe(40); expect(x.dataStatic).toBe('true'); expect(x.dataReduced).toBe('true');
    expect(characterArtAttrs({ id: 'qbo', size: 112 }).height).toBe(128); });
});
