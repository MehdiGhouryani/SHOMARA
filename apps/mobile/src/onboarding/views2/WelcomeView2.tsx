import { StyleSheet, View } from 'react-native';
import { Text } from '../../ui/AppText';
import { Character } from '../../ui/v2/Character';
import { ClaySurface } from '../../ui/v2/clay';
import { Button } from '../../ui/v2/core';
import { Body2, Foot2, Screen2 } from '../../ui/v2/shell';
import { C2, S2, type2 } from '../../ui/v2/tokens';

type Props = {
  onStart: () => void;
  /** Consent line shown under the button. It is not in the approved page but the tap records consent. */
  legal?: string | undefined;
};

/** Playbook 01 (welcome): one warm hero, one clear next action — no dense text, no splash loop. */
export function WelcomeView2({ onStart, legal }: Props) {
  return (
    <Screen2>
      <Body2 gap={S2.lg} paddingTop={S2.xxxl} justify="center">
        <View style={styles.heroWrap}>
          <ClaySurface level="featured" tone="amberSoft" radius={150} style={styles.heroDisc} />
          <View style={styles.heroArt} pointerEvents="none">
            <Character characterId="main" emotion="guide" size={250} accessibilityLabel="شخصیت اصلی شمارا در حال سلام کردن" />
          </View>
        </View>
        <Text style={[type2('display'), styles.center, { color: C2.ink }]}>سلام!</Text>
        <Text style={[type2('body'), styles.center, { color: C2.ink2 }]}>بیا با هم بشماریم.</Text>
      </Body2>
      <Foot2>
        <Button label="بریم!" onPress={onStart} testID="onboarding-start" />
        {legal ? (
          <Text style={[type2('caption'), styles.center, { color: C2.muted }]}>{legal}</Text>
        ) : null}
      </Foot2>
    </Screen2>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  heroWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  heroDisc: { position: 'absolute', width: 290, height: 290, top: 5 },
  heroArt: { alignItems: 'center', justifyContent: 'center' },
});
