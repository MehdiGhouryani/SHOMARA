import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

/** `.scr`: full-screen column on the page canvas. */
export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

type BodyProps = {
  children?: React.ReactNode;
  gap?: number;
  paddingTop?: number;
  paddingBottom?: number;
  justify?: ViewStyle['justifyContent'];
  align?: 'center' | 'stretch';
};

/**
 * `.body`: column with 24px side margins and a 16px default gap. It scrolls when the content is taller than
 * the screen (small phones, keyboard open) and otherwise fills the space exactly like the page.
 */
export function Body({ children, gap = 16, paddingTop = 8, paddingBottom = 0, justify, align = 'center' }: BodyProps) {
  return (
    <ScrollView
      style={styles.bodyScroll}
      contentContainerStyle={[styles.body, { gap, paddingTop, paddingBottom, alignItems: align }, justify ? { justifyContent: justify } : null]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** Circle with a centered icon (the code page's message badge). */
export function IconBadge({ icon, size = UI.control.codeBadge, iconSize = UI.control.codeBadgeIcon }: { icon: IconName; size?: number; iconSize?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.primaryC, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={iconSize} color={C.onPrimaryC} />
    </View>
  );
}

/** `.foot`: bottom action area (16px top, 32px bottom). */
export function Foot({ children }: { children?: React.ReactNode }) {
  return <View style={styles.foot}>{children}</View>;
}

type TextProps = { children: React.ReactNode; style?: object };

/** `.h1`: page title. */
export function H1({ children, style }: TextProps) {
  return <Text style={[typeStyle('h1'), styles.center, style]}>{children}</Text>;
}
/** `.sub`: supporting line under a title. */
export function Sub({ children, style }: TextProps) {
  return <Text style={[typeStyle('body'), { color: C.ink2 }, styles.center, style]}>{children}</Text>;
}
/** `.cap`: smallest text (14/20). */
export function Cap({ children, style }: TextProps) {
  return <Text style={[typeStyle('caption'), { color: C.ink2 }, style]}>{children}</Text>;
}

/** Inline information strip with an icon (e.g. the privacy note under the phone field). */
export function Note({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.note}>
      <Icon name={icon} size={24} color={C.primary} />
      <Text style={[typeStyle('label'), { fontWeight: '400', color: C.ink2, flex: 1 }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  bodyScroll: { flex: 1, minHeight: 0 },
  body: { flexGrow: 1, paddingHorizontal: UI.screen.margin },
  foot: { paddingTop: 16, paddingBottom: 32, paddingHorizontal: UI.screen.margin, gap: 8 },
  center: { textAlign: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: C.surfaceV },
});
