type FlowWindow = { __flow: { spoken: Array<{ text: string; language?: string }>; stops: number } };
const flow = () => (window as unknown as FlowWindow).__flow;

export function speak(text: string, options?: { language?: string }) {
  flow().spoken.push(options?.language ? { text, language: options.language } : { text });
}
export async function stop() {
  flow().stops += 1;
}
