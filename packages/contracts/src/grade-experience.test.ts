import { describe, expect, it } from 'vitest';
import {
  GRADE_EXPERIENCE_PROFILES,
  ageBandForGrade,
  experienceForGrade,
  gradeExperienceViolations,
  gradeUnavailableCopyFa,
  isGradeContentAvailable,
  pathNodeSize,
  playableGradeIds,
  practiceListLimit,
  primaryContinueLabelFa,
  sessionLengthHintFa,
  shouldEmphasizeCharacters,
  shouldShowParentGuidance,
} from './grade-experience';

describe('grade experience (Phase A deep)', () => {
  it('has no structural violations', () => {
    expect(gradeExperienceViolations()).toEqual([]);
  });

  it('maps six grades into three age bands', () => {
    expect(ageBandForGrade('G1')).toBe('EARLY');
    expect(ageBandForGrade('G2')).toBe('EARLY');
    expect(ageBandForGrade('G3')).toBe('MIDDLE');
    expect(ageBandForGrade('G4')).toBe('MIDDLE');
    expect(ageBandForGrade('G5')).toBe('UPPER');
    expect(ageBandForGrade('G6')).toBe('UPPER');
  });

  it('only G1 is content-available today', () => {
    expect(isGradeContentAvailable('G1')).toBe(true);
    expect(isGradeContentAvailable('G2')).toBe(false);
    expect(playableGradeIds()).toEqual(['G1']);
  });

  it('falls back safely for unknown grade', () => {
    expect(experienceForGrade('G99').gradeId).toBe('G1');
    expect(experienceForGrade(undefined).ageBand).toBe('EARLY');
  });

  it('exposes session length hints', () => {
    expect(sessionLengthHintFa('G1')).toContain('3');
    expect(sessionLengthHintFa('G6')).toContain('15');
  });

  it('keeps early band more spacious and character-heavy', () => {
    const g1 = experienceForGrade('G1');
    const g6 = experienceForGrade('G6');
    expect(g1.pathDensity).toBe('SPACIOUS');
    expect(g1.characterPresence).toBe('HIGH');
    expect(g6.pathDensity).toBe('COMPACT');
    expect(g6.characterPresence).toBe('LOW');
    expect(GRADE_EXPERIENCE_PROFILES).toHaveLength(6);
  });

  it('derives practice list limits by band', () => {
    expect(practiceListLimit('G1')).toBe(2);
    expect(practiceListLimit('G3')).toBe(4);
    expect(practiceListLimit('G6')).toBe(6);
  });

  it('derives larger path nodes for early grades', () => {
    expect(pathNodeSize('G1')).toBeGreaterThan(pathNodeSize('G6'));
  });

  it('emphasizes characters and parent guidance for G1', () => {
    expect(shouldEmphasizeCharacters('G1')).toBe(true);
    expect(shouldShowParentGuidance('G1')).toBe(true);
    expect(shouldEmphasizeCharacters('G6')).toBe(false);
    expect(shouldShowParentGuidance('G6')).toBe(false);
  });

  it('uses shorter CTA for early copy tone', () => {
    expect(primaryContinueLabelFa('G1')).toBe('ادامه');
    expect(primaryContinueLabelFa('G6').length).toBeGreaterThan(primaryContinueLabelFa('G1').length);
  });

  it('gives coming-soon copy only when content unavailable', () => {
    expect(gradeUnavailableCopyFa('G1')).toBe('');
    expect(gradeUnavailableCopyFa('G2').length).toBeGreaterThan(0);
  });
});
