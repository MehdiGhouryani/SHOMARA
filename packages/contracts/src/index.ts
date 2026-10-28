export * from './learning';
export * from './content';
export * from './animation';
export * from './game-feel';
export * from './teacher';
export * from './characters';
export * from './navigation';
export * from './grade-experience';
export * from './session-feel';
export * from './practice-habit';
export * from './me-surface';
export * from './ux-a11y';
export * from './onboarding';

export * from './progression';
export * from './jump';

export * from './lesson';
export * from './practice';

export * from './product-surface';

export * from './profile';
export * from './path2';

export * from './adult';

export * from './engagement';
export * from './engagement-policy';
export * from './challenge';
export * from './challenge-presentation';
export * from './st01-slice';
export * from './missions';
export * from './collection';
export * from './avatar-customization';
export * from './worlds';
export * from './p10-batch-a';
export * from './p10-batch-b';
export * from './p10-batch-c';
export * from './p10-batch-d';
export * from './p10-batch-e';
export * from './learning-rhythm';
// Depth* types (DepthLevel, DepthVariantPresentation, DepthRoundSeed, DepthChallengeSeed) are declared in every
// depth module (they differ only by the stationId union). Only batch A is re-exported with `export *`; batches B-E
// are re-exported by explicit name to avoid TS2308 ambiguity. Batch-specific seed types stay importable from their module.
export * from './p10-batch-a-depth';
export { P10_BATCH_B_DEPTH_VERSION, P10_BATCH_B_DEPTH, p10BatchBDepthViolations } from './p10-batch-b-depth';
export { P10_BATCH_C_DEPTH_VERSION, P10_BATCH_C_DEPTH, p10BatchCDepthViolations } from './p10-batch-c-depth';
export { P10_BATCH_D_DEPTH_VERSION, P10_BATCH_D_DEPTH, p10BatchDDepthViolations } from './p10-batch-d-depth';
export { P10_BATCH_E_DEPTH_VERSION, P10_BATCH_E_DEPTH, p10BatchEDepthViolations, p10PlayableCoverageSummary } from './p10-batch-e-depth';
