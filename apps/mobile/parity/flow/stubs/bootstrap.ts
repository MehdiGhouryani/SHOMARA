type Flow = { prepared: string[]; content: { ids: string[] } | null };
const flow = () => (window as unknown as { __flow: Flow }).__flow;
export async function prepareGradeContent(gradeId: string) {
  flow().prepared.push(gradeId);
}
/** `null` simulates a device with no downloaded content. */
export async function loadContentSnapshot() {
  return flow().content;
}
export const cachedStationIds = (snapshot: { ids: string[] }) => snapshot.ids;
