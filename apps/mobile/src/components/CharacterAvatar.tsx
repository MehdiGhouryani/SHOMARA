import { Image, StyleSheet, View } from 'react-native';
import type { CharacterVisualState } from '@math/contracts';
import { Text } from '../ui/AppText';
import { DS } from '../ui/design-system';
import { CHARACTERS, type CharacterId } from '../characters/characters';
import { artFor } from '../characters/art';
import { AnimatedCharacter } from './AnimatedCharacter';

/**
 * v2: packaged cast art (bust under 72dp, full idle pose above). No emoji.
 * Under 40dp the bust is still used; never full body at tiny sizes (bible §7).
 */
export function CharacterAvatar({ id, size = 64 }: { id: CharacterId; size?: number }) {
  const c = CHARACTERS[id];
  const full = size >= 96;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${c.name}، ${c.role}`}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg, borderColor: c.color + '33' }]}
    >
      <Image
        source={artFor(id, full ? 'IDLE' : 'BUST')}
        style={full ? { width: size * 0.82, height: size * 0.82 * (256 / 224), marginTop: size * 0.06 } : { width: size * 0.92, height: size * 0.92 }}
        resizeMode="contain"
      />
    </View>
  );
}

/** Character + speech bubble; the bubble text is the ONLY place a character "talks". */
export function CharacterSays({ id, text, size = 56, visualState = 'IDLE' }: { id: CharacterId; text: string; size?: number; visualState?: CharacterVisualState }) {
  const c = CHARACTERS[id];
  return (
    <View style={styles.row}>
      {visualState === 'IDLE' ? <CharacterAvatar id={id} size={size} /> : <AnimatedCharacter characterId={id} state={visualState} size={Math.max(64, size + 12)} staticIdle />}
      <View style={[styles.bubble, { borderColor: c.color }]}>
        <Text style={[styles.name, { color: c.color }]}>{c.name}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubble: { flex: 1, backgroundColor: DS.color.bg.surface, borderWidth: 1.5, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  name: { fontSize: 12, fontWeight: '800', marginBottom: 2 },
  text: { fontSize: 14, fontWeight: '600', color: DS.color.text.primary, lineHeight: 22 },
});
