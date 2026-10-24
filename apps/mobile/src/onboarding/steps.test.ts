import { describe, expect, it } from 'vitest';
import { CHILD_AVATAR_PRESETS, type OnboardingStep } from '@math/contracts';
import tokens from '../../../../packages/design-system/src/tokens.json';
import { FLOW_STEP_TOTAL, formatCountdown, ltrRun, stepBack, stepNumber, stepProgress } from './steps';

const ALL: OnboardingStep[] = ['WELCOME', 'AUTH', 'OTP', 'GRADE', 'CHILD', 'PLACEMENT', 'RESULT', 'SYNC_LOADING'];

describe('onboarding step numbering (approved pages)', () => {
  it('counts six steps and merges grade into profile', () => {
    expect(FLOW_STEP_TOTAL).toBe(6);
    expect(stepNumber('GRADE')).toBe(stepNumber('CHILD'));
    for (const s of ALL) expect(stepNumber(s)).toBeGreaterThanOrEqual(1);
    for (const s of ALL) expect(stepNumber(s)).toBeLessThanOrEqual(6);
  });
  it('matches the percentages written on the pages', () => {
    expect(stepProgress('AUTH')).toEqual({ percent: 33, label: 'مرحلهٔ ۲ از ۶' });
    expect(stepProgress('OTP')).toEqual({ percent: 50, label: 'مرحلهٔ ۳ از ۶' });
    expect(stepProgress('CHILD')).toEqual({ percent: 67, label: 'مرحلهٔ ۴ از ۶' });
    expect(stepProgress('RESULT').percent).toBe(100);
  });
  it('never moves forward through back and skips GRADE', () => {
    for (const s of ALL) {
      const back = stepBack(s);
      if (back) expect(stepNumber(back)).toBeLessThan(stepNumber(s));
    }
    expect(stepBack('CHILD')).toBe('OTP');
    expect(stepBack('WELCOME')).toBeNull();
    expect(stepBack('SYNC_LOADING')).toBeNull();
  });
});

describe('countdown and bidi helpers', () => {
  it('formats m:ss in Persian digits', () => {
    expect(formatCountdown(45)).toBe('۰:۴۵');
    expect(formatCountdown(60)).toBe('۱:۰۰');
    expect(formatCountdown(5)).toBe('۰:۰۵');
    expect(formatCountdown(-3)).toBe('۰:۰۰');
  });
  it('wraps a run in left-to-right isolates', () => {
    expect(ltrRun('۰۹۱۲')).toBe('\u2066۰۹۱۲\u2069');
  });
});

describe('avatar presets', () => {
  it('keep the shared contract identical to the design tokens', () => {
    for (const preset of CHILD_AVATAR_PRESETS) {
      expect(preset.accent.toLowerCase()).toBe(tokens.ui.avatar[preset.id].toLowerCase());
    }
    expect(CHILD_AVATAR_PRESETS.map((p) => p.id)).toEqual(['sun', 'leaf', 'cloud', 'moon']);
  });
});
