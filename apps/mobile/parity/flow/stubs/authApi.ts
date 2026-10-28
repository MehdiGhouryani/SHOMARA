type Flow = { otpRequests: string[]; verifications: Array<[string, string]> };
const flow = () => (window as unknown as { __flow: Flow }).__flow;
export async function requestOtp(phone: string) {
  flow().otpRequests.push(phone);
  return { ok: true as const };
}
export async function verifyOtp(phone: string, code: string) {
  flow().verifications.push([phone, code]);
  return code === '123456' ? { ok: true as const } : { ok: false as const, message: 'کد نادرست است.' };
}
