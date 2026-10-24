import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

type Props = {
  icon: IconName;
  title: string;
  kicker: string;
  /** `off` = the resting/locked look (pages 13/14); `plain` = the ready look. */
  tone?: 'plain' | 'off';
  /** Trailing glyph (the lock on locked rows). */
  trailingIcon?: IconName | undefined;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPress?: (() => void) | undefined;
};

/** `.row` of the list pages: badge + title/kicker + a trailing glyph (or a chip through children). */
export function ListRow({ icon, title, kicker, tone = 'plain', trailingIcon, style, children, onPress }: Props) {
  const off = tone === 'off';
  const row = (
    <View style={[styles.row, off ? { opacity: 0.75, shadowOpacity: 0, elevation: 0 } : null, style]}>
      <View style={[styles.badge, off ? { backgroundColor: C.surfaceV } : null]}>
        <Icon name={icon} size={UI.result.rowGlyph} color={off ? C.outline : C.violet} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[typeStyle('caption'), { color: C.ink2 }]}>{kicker}</Text>
      </View>
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={24} color={C.outline} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.press}>
      {row}
    </Pressable>
  ) : (
    row
  );
}

const R = UI.result;
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: R.rowGap,
    width: '100%',
    paddingVertical: R.rowPadY,
    paddingHorizontal: R.rowPadX,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.rowRadius,
    shadowColor: C.line,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  badge: {
    width: R.rowIcon,
    height: R.rowIcon,
    borderRadius: R.rowIcon / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.violetC,
  },
  text: { flex: 1, alignItems: 'flex-start' },
  press: { minHeight: UI.result.rowMinHeight },
  title: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: C.ink },
});
