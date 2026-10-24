import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/AppText';
import { C, typeStyle } from '../ui/v1/tokens';

type Props = {
  /** `info` and `warning` report content state; `story` shows the chapter's story from the guide button. */
  tone: 'info' | 'warning' | 'story';
  text: string;
};

const LOOK = {
  info: { bg: C.primaryC, fg: C.onPrimaryC },
  warning: { bg: C.neutralC, fg: C.onNeutralC },
  story: { bg: C.surface, fg: C.ink },
} as const;

/** Slim strip between the chapter band and the trail. Not in the approved page (derived states). */
export function PathBanner({ tone, text }: Props) {
  const look = LOOK[tone];
  return (
    <View style={[styles.strip, { backgroundColor: look.bg }]} accessibilityLiveRegion="polite" accessibilityRole="text">
      <Text style={[typeStyle('caption'), { color: look.fg, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { minHeight: 40, paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
});
