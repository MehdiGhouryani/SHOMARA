import { describe, expect, it } from 'vitest';
import { CURRENT_ONBOARDING_GRADE_IDS, GRADES_FOR_ONBOARDING } from './catalog';
import { PLACEMENT_ITEMS, STEPS, isValidName, nextStep, prevStep, progressFraction, scorePlacement } from './flow';

describe('canonical onboarding order', () => {
  it('uses WELCOME → PHONE → OTP → GRADE → CHILD → optional placement → sync', () => {
    expect(STEPS).toEqual(['WELCOME', 'AUTH', 'OTP', 'GRADE', 'CHILD', 'PLACEMENT', 'RESULT', 'SYNC_LOADING']);
  });

  it('has no separate parent authentication step', () => {
    expect(STEPS).not.toContain('PARENT_GATE');
  });

  it('next/prev stop at the ends', () => {
    expect(nextStep('WELCOME')).toBe('AUTH');
    expect(nextStep('AUTH')).toBe('OTP');
    expect(nextStep('OTP')).toBe('GRADE');
    expect(prevStep('WELCOME')).toBeNull();
    expect(prevStep('OTP')).toBe('AUTH');
    expect(prevStep('SYNC_LOADING')).toBeNull();
  });

  it('progress goes 0 -> 1', () => {
    expect(progressFraction('WELCOME')).toBeGreaterThan(0);
    expect(progressFraction('SYNC_LOADING')).toBe(1);
  });
});

describe('grade catalog', () => {
  it('only published grades are actionable', () => {
    expect(CURRENT_ONBOARDING_GRADE_IDS).toEqual(['G1']);
    expect(GRADES_FOR_ONBOARDING.find((grade) => grade.id === 'G1')?.available).toBe(true);
    expect(GRADES_FOR_ONBOARDING.filter((grade) => grade.available).map((grade) => grade.id)).toEqual(['G1']);
  });
});

describe('placement scoring', () => {
  const right = PLACEMENT_ITEMS.map((i) => i.correct);
  it('both correct => fast-track', () => expect(scorePlacement(right)).toEqual({ correct: 2, fastTrack: true }));
  it('one wrong => no fast-track', () => expect(scorePlacement([right[0], 'سبز'])).toEqual({ correct: 1, fastTrack: false }));
  it('unanswered => 0', () => expect(scorePlacement([undefined, undefined])).toEqual({ correct: 0, fastTrack: false }));
});

describe('name validation', () => {
  it('accepts 1..20 trimmed chars only', () => {
    expect(isValidName('آرش')).toBe(true);
    expect(isValidName('   ')).toBe(false);
    expect(isValidName('x'.repeat(21))).toBe(false);
  });
});
