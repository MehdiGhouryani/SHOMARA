import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

export type TabItem = { key: string; label: string; icon: IconName };

/**
 * The outlined bar of the newer path page (106px bar, 68x44 pill with a 2px primary border; its CSS is
 * content-box). One bar on every tab so it never changes shape between tabs (D-011); the soft variant of
 * pages 13/14 was removed in U8 as planned.
 */
type Props = { items: readonly TabItem[]; activeKey: string; onSelect?: ((key: string) => void) | undefined };

export function TabBar({ items, activeKey, onSelect }: Props) {
  const T = UI.path.tabOutlined;
  return (
    <View style={[styles.bar, { height: T.barHeight }]} accessibilityRole="tablist">
      {items.map((item) => {
        const on = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect?.(item.key)}
            style={[styles.tab, { minHeight: T.itemHeight }]}
          >
            <View
              style={[
                styles.pill,
                { width: T.width, height: T.height, borderRadius: T.radius, borderWidth: T.border, borderColor: 'transparent' },
                on ? { backgroundColor: C.primaryC } : null,
                on ? { borderColor: C.primary } : null,
              ]}
            >
              <Icon name={item.icon} size={26} color={on ? C.primary : C.ink2} />
            </View>
            <Text style={[typeStyle('caption'), { color: on ? C.primary : C.ink2, fontWeight: on ? '600' : '400' }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: UI.control.tabBarHeight,
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 2,
    borderTopColor: C.line,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  tab: { flex: 1, minHeight: UI.control.tabItemHeight, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pill: { width: UI.control.tabIconWidth, height: UI.control.tabIconHeight, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
