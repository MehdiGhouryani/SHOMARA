import type { ComponentProps } from 'react';
import { View } from 'react-native';
import type { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, TabBar, type TabItem } from '../ui/v1';

/** Props of the tab bar that expo-router's `Tabs` hands to a custom `tabBar` (derived, so no deep import of its vendored navigation). */
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** The three tabs of the child shell, in reading order (right to left): path, practice, me. */
const TAB_ITEMS: Record<string, TabItem> = {
  index: { key: 'index', label: 'مسیر', icon: 'route' },
  practice: { key: 'practice', label: 'تمرین', icon: 'bolt' },
  profile: { key: 'profile', label: 'من', icon: 'person' },
};

/** Adapter between expo-router's tab navigator and the approved tab bar (v1 `TabBar`, outlined). */
export function ChildTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => TAB_ITEMS[r.name]);
  const items = routes.map((r) => TAB_ITEMS[r.name]!);
  const activeKey = state.routes[state.index]?.name ?? 'index';

  function select(key: string) {
    const route = routes.find((r) => r.name === key);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented && state.routes[state.index]?.name !== route.name) navigation.navigate(route.name, route.params);
  }

  return (
    <View style={{ backgroundColor: C.surface, paddingBottom: insets.bottom }}>
      <TabBar items={items} activeKey={activeKey} onSelect={select} />
    </View>
  );
}
