import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

type Props = {
  /** Small line above the title (`.rt small`). */
  kicker: string;
  title: string;
  icon?: IconName;
  /** `highlight` = the earned look of page 11 (violet); `plain` = the resting `.row` of pages 13/14. */
  tone?: 'highlight' | 'plain';
  style?: StyleProp<ViewStyle>;
};

/** `.row`: full-width list row with a round glyph badge; the achievement card of the result and me pages. */
export function AchievementRow({ kicker, title, icon = 'medal', tone = 'plain', style }: Props) {
  const R = UI.result;
  const highlight = tone === 'highlight';
  return (
    <View
      style={[
        styles.row,
        highlight
          ? { backgroundColor: C.violetC, borderColor: C.violetC, shadowColor: R.rowShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }
          : null,
        style,
      ]}
    >
      <View style={[styles.badge, highlight ? { backgroundColor: C.violet } : null]}>
        <Icon name={icon} size={R.rowGlyph} color={highlight ? C.surface : C.violet} />
      </View>
      <View style={styles.text}>
        <Text style={[typeStyle('caption'), { color: highlight ? R.rowLabel : C.ink2 }]}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
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
  title: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: C.onVioletC },
});
