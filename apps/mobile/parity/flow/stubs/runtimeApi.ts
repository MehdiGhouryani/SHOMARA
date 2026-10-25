export const shouldUseRemoteRuntime = () => false;
export const getAuthoritativeProgression = async () => ({});

// Avatar workshop edges (settings/avatar flow targets): the shape matches runtimeApi.ts:539-553; saves are recorded.
type Flow = { avatarSaves: unknown[] };
const flow = () => (window as unknown as { __flow: Flow }).__flow;
const workshopView = (appearance: { basePresetId: string }) => ({
  engineVersion: 'test',
  appearance: { basePresetId: appearance.basePresetId, outfitId: null, hatId: null, accessoryId: null, backgroundId: null, updatedAt: null },
  ownedRewardCodes: [],
  companionCastExcluded: true as const,
  setsMastery: false as const,
});
export const getAvatarWorkshop = async () => workshopView({ basePresetId: 'sun' });
export const saveAvatarAppearance = async (body: Record<string, unknown>) => {
  flow().avatarSaves.push(body);
  return workshopView({ basePresetId: String(body.basePresetId ?? 'sun') });
};
