/** Rive is native-only and only used when a `.riv` source exists; the packaged art is what the harness shows. */
export const RiveView = () => null;
export const useRive = () => ({ setHybridRef: () => undefined });
export const useRiveFile = () => ({ riveFile: null, error: null });
export const Fit = { Layout: 'layout' };
