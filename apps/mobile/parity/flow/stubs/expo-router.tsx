import { useEffect } from 'react';

type FlowWindow = { __flow: { replaced: string[]; pushed: string[]; backed: number } };
const flow = () => (window as unknown as FlowWindow).__flow;

export function useRouter() {
  return {
    replace: (href: string) => flow().replaced.push(href),
    push: (href: string) => flow().pushed.push(href),
    back: () => {
      flow().backed += 1;
    },
    canGoBack: () => true,
  };
}
export function useLocalSearchParams() {
  return { stationId: 'ST01' };
}
/** Runs the focus callback once on mount (the harness never blurs the screen). */
export function useFocusEffect(callback: () => void | (() => void)) {
  useEffect(() => callback(), []); // eslint-disable-line react-hooks/exhaustive-deps
}
export function Redirect() {
  return null;
}
