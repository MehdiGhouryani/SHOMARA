/**
 * Phase A — resolve age-band experience for the signed-in child.
 */
import { useMemo } from 'react';
import {
  experienceForGrade,
  sessionLengthHintFa,
  type GradeExperienceProfile,
} from '@math/contracts';
import { useAppState } from './AppStateContext';

export function useGradeExperience(): GradeExperienceProfile {
  const { state } = useAppState();
  const gradeId = state?.profile.gradeId;
  return useMemo(() => experienceForGrade(gradeId), [gradeId]);
}

export function useSessionLengthHint(): string {
  const { state } = useAppState();
  return useMemo(() => sessionLengthHintFa(state?.profile.gradeId), [state?.profile.gradeId]);
}
