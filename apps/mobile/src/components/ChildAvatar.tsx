import { Pressable, StyleSheet, View } from 'react-native';
import { CHILD_AVATAR_PRESETS, type ChildAvatarPresetId } from '@math/contracts';
import { Text } from '../ui/AppText';
import { DS } from '../ui/design-system/theme';

export function ChildAvatar({ presetId, name = '', size = 88, selected = false, onPress }: {
  presetId: ChildAvatarPresetId;
  name?: string;
  size?: number;
  selected?: boolean;
  onPress?: () => void;
}) {
  const preset = CHILD_AVATAR_PRESETS.find((item) => item.id === presetId) ?? CHILD_AVATAR_PRESETS[0]!;
  const initial = name.trim().slice(0, 1) || '؟';
  const content = (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`آواتار ${preset.label}`}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: preset.soft, borderColor: selected ? DS.color.brand.primary : preset.accent },
      ]}
    >
      <View style={[styles.shape, { width: size * 0.62, height: size * 0.62, borderRadius: size * 0.22, backgroundColor: preset.accent }]} />
      <Text style={[styles.initial, { fontSize: Math.max(18, size * 0.32) }]}>{initial}</Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={styles.target}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: { minHeight: DS.size.touchMin, minWidth: DS.size.touchMin, alignItems: 'center', justifyContent: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, overflow: 'hidden' },
  shape: { position: 'absolute', top: '18%', opacity: 0.88 },
  initial: { color: DS.color.text.inverse, fontWeight: '900', zIndex: 1 },
});
