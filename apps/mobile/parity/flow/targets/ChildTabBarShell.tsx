import { View } from 'react-native';
import { ChildTabBar } from '../../../src/navigation/ChildTabBar';

/**
 * Flow target: the real V2 tab shell with a fake navigator state, so flow:tabs can exercise
 * labels, selected states and navigation of the actual bar (the router itself is stubbed).
 */
const pushes: string[] = [];
(globalThis as Record<string, unknown>).__nav = pushes;

const state = {
  index: 0,
  canGoBack: () => false,
  routes: [
    { key: 'index', name: 'index' },
    { key: 'practice', name: 'practice' },
    { key: 'profile', name: 'profile' },
  ],
} as unknown as Parameters<typeof ChildTabBar>[0]['state'];

const navigation = {
  emit: () => ({ defaultPrevented: false }),
  navigate: (name: string) => {
    pushes.push(name);
  },
} as unknown as Parameters<typeof ChildTabBar>[0]['navigation'];

export default function ChildTabBarShell() {
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <ChildTabBar state={state} navigation={navigation} />
    </View>
  );
}
