import { StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { Portrait, type PortraitTone } from './Portrait';
import type { CharacterPose } from './characters';
import { C, UI, typeStyle } from './tokens';

type Props = {
  pose: CharacterPose;
  portraitLabel: string;
  tone?: PortraitTone | undefined;
  cover?: boolean | undefined;
  text: string;
};

/** `.guide`: portrait at the reading start and a speech bubble whose tail points at it. */
export function GuideBubble({ pose, portraitLabel, tone, cover, text }: Props) {
  return (
    <View style={styles.row}>
      <Portrait pose={pose} label={portraitLabel} tone={tone} cover={cover} />
      <View style={styles.bubble}>
        <View pointerEvents="none" style={styles.tail} />
        <Text style={typeStyle('bubble')}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%' },
  bubble: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: UI.surface.bubbleBorder,
    borderColor: C.line,
    borderRadius: UI.surface.bubbleRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tail: {
    position: 'absolute',
    start: -9,
    top: '50%',
    width: 14,
    height: 14,
    marginTop: -7,
    backgroundColor: C.surface,
    borderTopWidth: 2,
    borderStartWidth: 2,
    borderColor: C.line,
    transform: [{ rotate: '45deg' }],
  },
});
