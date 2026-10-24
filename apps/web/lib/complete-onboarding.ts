import type { ChildAvatarPresetId, AuthMethod } from '@math/contracts';

export interface CompletedOnboarding {
  phoneNumber?: string;
  authMethod: AuthMethod;
  gradeId: string;
  characterId: string;
  childName: string;
  avatarPresetId: ChildAvatarPresetId;
  /** Timestamp of terms acceptance captured on onboarding start; not a parent-auth proof. */
  consentAt: string;
}

/** Persist the minimum child projection needed to enter the returning path. */
export function persistCompletedOnboarding(data: CompletedOnboarding) {
  if (typeof window === 'undefined') return;
  const previousProgress = window.localStorage.getItem('math_app_completed_node_ids');
  window.localStorage.setItem('math_app_child_profile', JSON.stringify({
    childName: data.childName,
    gradeId: data.gradeId,
    avatarPresetId: data.avatarPresetId,
    authMethod: data.authMethod,
    consentAt: data.consentAt,
  }));
  if (previousProgress === null) window.localStorage.setItem('math_app_completed_node_ids', JSON.stringify([]));
}
