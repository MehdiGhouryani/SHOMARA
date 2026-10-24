// `onboarding-under-test` is a virtual module: scripts/parity-build.mjs resolves it to the onboarding screen.
declare module 'onboarding-under-test' {
  import type { ComponentType } from 'react';
  const Onboarding: ComponentType;
  export default Onboarding;
}
