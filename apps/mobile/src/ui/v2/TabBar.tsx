import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../AppText';
import { C2, K2, R2, S2, type2 } from './tokens';

export type TabItem2 = { key: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] };

type Props = { items: readonly TabItem2[]; activeKey: string; onSelect?: ((key: string) => void) | undefined };

/**
 * V2 tab shell (DESIGN pages/SYSTEM_SCREENS.md): icons + visible Persian labels, active state read
 * beyond color (soft pill + strong stroke), 48dp+ targets, safe-area padding applied by the adapter.
 */
export function TabBar({ items, activeKey, onSelect }: Props) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {items.map((item) => {
        const on = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect?.(item.key)}
            style={styles.tab}
          >
            <View style={[styles.pill, on ? styles.pillOn : null]}>
              <Ionicons name={item.icon} size={24} color={on ? C2.primary : C2.ink2} />
            </View>
            <Text style={[type2('caption'), { color: on ? C2.primaryDark : C2.ink2 }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C2.surface,
    borderTopWidth: 2,
    borderTopColor: C2.line,
    paddingTop: S2.sm,
    paddingHorizontal: S2.sm,
    paddingBottom: S2.sm,
  },
  tab: { flex: 1, minHeight: K2.touchMin + 8, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pill: {
    width: K2.touchMin - 4,
    height: K2.touchMin - 4,
    borderRadius: R2.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C2.surface, // reserves the active stroke's 2dp so the icon never shifts
  },
  pillOn: { backgroundColor: C2.primarySoft, borderColor: C2.primary },
});
