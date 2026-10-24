import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

export type TabItem = { key: string; label: string; icon: IconName };

/**
 * `soft`: pages 13 and 14 (84px bar, 64x36 pill, no border).
 * `outlined`: the newer path page, as it renders (106px bar, 68x44 pill with a 2px primary border; its CSS is
 * content-box). The app uses `outlined` on every tab so the bar does not change shape between tabs.
 */
export type TabBarVariant = 'soft' | 'outlined';

type Props = { items: readonly TabItem[]; activeKey: string; onSelect?: ((key: string) => void) | undefined; variant?: TabBarVariant };

/** `.tabs`: 84px bar; the active item gets a 64x36 primary-container pill behind its icon. */
export function TabBar({ items, activeKey, onSelect, variant = 'outlined' }: Props) {
  const outlined = variant === 'outlined';
  const T = UI.path.tabOutlined;
  return (
    <View style={[styles.bar, outlined ? { height: T.barHeight } : null]} accessibilityRole="tablist">
      {items.map((item) => {
        const on = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect?.(item.key)}
            style={[styles.tab, outlined ? { minHeight: T.itemHeight } : null]}
          >
            <View
              style={[
                styles.pill,
                outlined ? { width: T.width, height: T.height, borderRadius: T.radius, borderWidth: T.border, borderColor: 'transparent' } : null,
                on ? { backgroundColor: C.primaryC } : null,
                on && outlined ? { borderColor: C.primary } : null,
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
