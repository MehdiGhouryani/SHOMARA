import type { CacheClass } from './learning';

export interface ContentPackageRef {
  id: string;
  gradeId: string;
  stationId: string | null;
  packageCode: string;
  version: string;
  checksum: string;
  bytes: number;
  cacheClass: CacheClass;
  sequence: number;
  prefetchRank: number | null;
  downloadUrl: string;
}

export interface ContentManifest {
  manifestVersion: string;
  gradeId: string;
  generatedAt: string;
  current: ContentPackageRef[];
  next: ContentPackageRef[];
  recent: ContentPackageRef[];
  future: ContentPackageRef[];
}

export type EntitlementSource = 'SUBSCRIPTION' | 'CLASS_ACCESS' | 'DEV_GRANT' | 'OTHER';

export interface EntitlementCheck {
  packageId: string;
  entitled: boolean;
  source: EntitlementSource | null;
  expiresAt: string | null;
  reason: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'NOT_ENTITLED';
}

export interface ContentPackagePresentationQuestion {
  prompt: string;
  options: string[];
  visualCount?: number;
}

/** Child-safe, renderable content. Evaluator answer keys are deliberately absent. */
export interface ContentPackagePresentation {
  id: string;
  title: string;
  prompt: string;
  stationId: string;
  skillId: string;
  learningRole: string;
  experienceForm: string;
  interactionType: string;
  options: string[];
  questions: ContentPackagePresentationQuestion[];
  visualCount?: number;
}

export interface ContentPackageItem {
  contentVersionId: string;
  required: boolean;
  ordinal: number;
  presentation?: ContentPackagePresentation;
}

export interface ContentPackageDescriptor extends ContentPackageRef {
  items: ContentPackageItem[];
  minAppVersion: string | null;
  releaseChannel: 'STABLE' | 'BETA' | 'DEV';
  status: 'DRAFT' | 'ACTIVE' | 'RETIRED';
}

export interface AssignmentContentRequirement {
  assignmentId: string;
  packageIds: string[];
}
