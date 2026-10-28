import { View } from 'react-native';
import { Body, Button, C, Cap, Character, Foot, H1, Screen, Sub } from '../../ui/v1';

type Props = {
  onStart: () => void;
  /** Consent line shown under the button. It is not in the approved page but the tap records consent. */
  legal?: string | undefined;
};

/** Page 01: welcome. */
export function WelcomeView({ onStart, legal }: Props) {
  return (
    <Screen>
      <Body gap={24} paddingTop={48} justify="center">
        <View style={{ width: 300, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', top: 20, start: 10, end: 10, bottom: 0, borderRadius: 150, backgroundColor: C.violetC }} />
          <Character pose="main-wave" height={270} label="شخصیت اصلی شمارا در حال سلام کردن" />
        </View>
        <H1 style={{ fontSize: 36, lineHeight: 48 }}>سلام!</H1>
        <Sub>بیا با هم بشماریم.</Sub>
      </Body>
      <Foot>
        <Button label="بریم!" onPress={onStart} testID="onboarding-start" />
        {legal ? <Cap style={{ textAlign: 'center' }}>{legal}</Cap> : null}
      </Foot>
    </Screen>
  );
}
