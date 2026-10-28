/**
 * Phase A — Grade experience profiles (age bands), independent of lesson content.
 *
 * One learning engine; three age-appropriate shells (G1–G2 / G3–G4 / G5–G6).
 * Content availability is separate from UX tone — a grade can be selectable later
 * while still having a defined experience profile.
 */

export const GRADE_IDS = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as const;
export type GradeId = (typeof GRADE_IDS)[number];

/** Coarse age bands — prefer this over six fully separate UIs. */
export type AgeBandId = 'EARLY' | 'MIDDLE' | 'UPPER';

export type UiCopyTone = 'VERY_SHORT' | 'SHORT' | 'STANDARD';
export type PathDensity = 'SPACIOUS' | 'BALANCED' | 'COMPACT';
export type CharacterPresence = 'HIGH' | 'MEDIUM' | 'LOW';
export type ParentEmphasis = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GradeExperienceProfile {
  gradeId: GradeId;
  ageBand: AgeBandId;
  /** Approximate ages for product/docs only — not shown as a hard gate. */
  ageRangeLabelFa: string;
  copyTone: UiCopyTone;
  pathDensity: PathDensity;
  /** Suggested session length for UI hints (not a hard lock). */
  sessionMinutesMin: number;
  sessionMinutesMax: number;
  characterPresence: CharacterPresence;
  parentEmphasis: ParentEmphasis;
  /**
   * Whether this grade currently has playable curriculum packages.
   * False → onboarding/path show «به‌زودی» without crashing.
   */
  contentAvailable: boolean;
}

const BAND_EARLY = {
  ageBand: 'EARLY' as const,
  copyTone: 'VERY_SHORT' as const,
  pathDensity: 'SPACIOUS' as const,
  sessionMinutesMin: 3,
  sessionMinutesMax: 7,
  characterPresence: 'HIGH' as const,
  parentEmphasis: 'HIGH' as const,
};

const BAND_MIDDLE = {
  ageBand: 'MIDDLE' as const,
  copyTone: 'SHORT' as const,
  pathDensity: 'BALANCED' as const,
  sessionMinutesMin: 5,
  sessionMinutesMax: 10,
  characterPresence: 'MEDIUM' as const,
  parentEmphasis: 'MEDIUM' as const,
};

const BAND_UPPER = {
  ageBand: 'UPPER' as const,
  copyTone: 'STANDARD' as const,
  pathDensity: 'COMPACT' as const,
  sessionMinutesMin: 8,
  sessionMinutesMax: 15,
  characterPresence: 'LOW' as const,
  parentEmphasis: 'LOW' as const,
};

/**
 * Canonical experience table. Only G1 is content-available today;
 * profiles for G2–G6 still drive future UI shell decisions.
 */
export const GRADE_EXPERIENCE_PROFILES: readonly GradeExperienceProfile[] = [
  { gradeId: 'G1', ageRangeLabelFa: '۶–۷ سال', contentAvailable: true, ...BAND_EARLY },
  { gradeId: 'G2', ageRangeLabelFa: '۷–۸ سال', contentAvailable: false, ...BAND_EARLY },
  { gradeId: 'G3', ageRangeLabelFa: '۸–۹ سال', contentAvailable: false, ...BAND_MIDDLE },
  { gradeId: 'G4', ageRangeLabelFa: '۹–۱۰ سال', contentAvailable: false, ...BAND_MIDDLE },
  { gradeId: 'G5', ageRangeLabelFa: '۱۰–۱۱ سال', contentAvailable: false, ...BAND_UPPER },
  { gradeId: 'G6', ageRangeLabelFa: '۱۱–۱۲ سال', contentAvailable: false, ...BAND_UPPER },
] as const;

const BY_ID: Record<GradeId, GradeExperienceProfile> = GRADE_EXPERIENCE_PROFILES.reduce(
  (acc, profile) => {
    acc[profile.gradeId] = profile;
    return acc;
  },
  {} as Record<GradeId, GradeExperienceProfile>,
);

export function isGradeId(value: string | null | undefined): value is GradeId {
  return value === 'G1' || value === 'G2' || value === 'G3' || value === 'G4' || value === 'G5' || value === 'G6';
}

/** Safe resolve — unknown grades fall back to G1 early shell. */
export function experienceForGrade(gradeId: string | null | undefined): GradeExperienceProfile {
  if (isGradeId(gradeId)) return BY_ID[gradeId]!;
  return BY_ID.G1!;
}

export function ageBandForGrade(gradeId: string | null | undefined): AgeBandId {
  return experienceForGrade(gradeId).ageBand;
}

export function isGradeContentAvailable(gradeId: string | null | undefined): boolean {
  return experienceForGrade(gradeId).contentAvailable;
}

/** Grades the child may enter for learning right now. */
export function playableGradeIds(): readonly GradeId[] {
  return GRADE_EXPERIENCE_PROFILES.filter((p) => p.contentAvailable).map((p) => p.gradeId);
}

/** Short UI hint for suggested session length, Persian digits optional at call site. */
export function sessionLengthHintFa(gradeId: string | null | undefined): string {
  const p = experienceForGrade(gradeId);
  return `${p.sessionMinutesMin} تا ${p.sessionMinutesMax} دقیقه`;
}

/** How many secondary practice cards to show under the daily recommendation. */
export function practiceListLimit(gradeId: string | null | undefined): number {
  const band = ageBandForGrade(gradeId);
  if (band === 'EARLY') return 2;
  if (band === 'MIDDLE') return 4;
  return 6;
}

/** Path node touch target bias (px guidance for UI). */
export function pathNodeSize(gradeId: string | null | undefined): number {
  const density = experienceForGrade(gradeId).pathDensity;
  if (density === 'SPACIOUS') return 72;
  if (density === 'COMPACT') return 56;
  return 64;
}

/** Whether path/lesson chrome should surface companion characters prominently. */
export function shouldEmphasizeCharacters(gradeId: string | null | undefined): boolean {
  return experienceForGrade(gradeId).characterPresence !== 'LOW';
}

/** Parent screen: show extra guidance when emphasis is high. */
export function shouldShowParentGuidance(gradeId: string | null | undefined): boolean {
  return experienceForGrade(gradeId).parentEmphasis === 'HIGH';
}

/** Primary CTA label tone for continue/start actions. */
export function primaryContinueLabelFa(gradeId: string | null | undefined): string {
  const tone = experienceForGrade(gradeId).copyTone;
  if (tone === 'VERY_SHORT') return 'ادامه';
  if (tone === 'SHORT') return 'ادامه بده';
  return 'ادامه از اینجا';
}

/** Coming-soon copy when grade has no packages yet. */
export function gradeUnavailableCopyFa(gradeId: string | null | undefined): string {
  const p = experienceForGrade(gradeId);
  if (p.contentAvailable) return '';
  if (p.ageBand === 'EARLY') return 'این پایه به‌زودی آماده می‌شود.';
  return 'محتوای این پایه هنوز فعال نیست؛ فعلاً پایهٔ اول را ادامه بده.';
}

export function gradeExperienceViolations(
  profiles: readonly GradeExperienceProfile[] = GRADE_EXPERIENCE_PROFILES,
): string[] {
  const v: string[] = [];
  if (profiles.length !== 6) v.push(`EXPECTED_6_PROFILES_GOT_${profiles.length}`);
  const seen = new Set<string>();
  for (const p of profiles) {
    if (seen.has(p.gradeId)) v.push(`DUPLICATE_GRADE:${p.gradeId}`);
    seen.add(p.gradeId);
    if (p.sessionMinutesMin > p.sessionMinutesMax) v.push(`BAD_SESSION_RANGE:${p.gradeId}`);
    if (p.sessionMinutesMin < 1) v.push(`SESSION_TOO_SHORT:${p.gradeId}`);
    if (p.sessionMinutesMax > 30) v.push(`SESSION_TOO_LONG:${p.gradeId}`);
  }
  for (const id of GRADE_IDS) {
    if (!seen.has(id)) v.push(`MISSING_GRADE:${id}`);
  }
  if (!profiles.some((p) => p.gradeId === 'G1' && p.contentAvailable)) {
    v.push('G1_MUST_BE_CONTENT_AVAILABLE');
  }
  // Band coherence: G1–G2 early, G3–G4 middle, G5–G6 upper
  const expect: Record<string, AgeBandId> = {
    G1: 'EARLY', G2: 'EARLY', G3: 'MIDDLE', G4: 'MIDDLE', G5: 'UPPER', G6: 'UPPER',
  };
  for (const p of profiles) {
    if (expect[p.gradeId] && p.ageBand !== expect[p.gradeId]) {
      v.push(`BAND_MISMATCH:${p.gradeId}:${p.ageBand}`);
    }
  }
  // Early must be more spacious / character-heavy than upper
  const g1 = profiles.find((p) => p.gradeId === 'G1');
  const g6 = profiles.find((p) => p.gradeId === 'G6');
  if (g1 && g6) {
    if (g1.pathDensity === 'COMPACT') v.push('G1_SHOULD_NOT_BE_COMPACT');
    if (g6.characterPresence === 'HIGH') v.push('G6_SHOULD_NOT_BE_HIGH_CHARACTER');
    if (g1.sessionMinutesMax > g6.sessionMinutesMax) v.push('EARLY_SESSION_LONGER_THAN_UPPER');
  }
  return v;
}
