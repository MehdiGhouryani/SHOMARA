import { StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI, typeStyle } from './tokens';

type Props = { label: string; icon?: IconName | undefined; tone?: 'plain' | 'violet' | undefined };

/** `.chip`: 32px pill with an optional 16px icon; `violet` is the achievement chip. */
export function Chip({ label, icon, tone = 'plain' }: Props) {
  const violet = tone === 'violet';
  const color = violet ? C.onVioletC : C.ink2;
  return (
    <View style={[styles.chip, violet ? { backgroundColor: C.violetC, borderColor: C.violetC } : null]}>
      {icon ? <Icon name={icon} size={16} color={color} /> : null}
      <Text style={[typeStyle('caption'), { color, fontWeight: violet ? '600' : '400' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: UI.control.chipMinHeight,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.line,
  },
});
