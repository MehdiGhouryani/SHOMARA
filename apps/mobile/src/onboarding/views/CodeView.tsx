import { View } from 'react-native';
import { Text } from '../../ui/AppText';
import { Body, Button, Cap, CodeInput, Foot, H1, IconBadge, Screen, Sub, TextButton, C, typeStyle } from '../../ui/v1';
import { formatCountdown, ltrRun } from '../steps';
import { StepBar } from './StepBar';

type Props = {
  /** Already masked and in Persian digits, e.g. ۰۹۱۲***۶۷۸۹. */
  maskedPhone: string;
  code: string;
  error: string;
  busy: boolean;
  canSubmit: boolean;
  cooldown: number;
  progress: { percent: number; label: string };
  onChangeCode: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onChangeNumber: () => void;
  onBack: () => void;
  autoFocus?: boolean;
};

/** Page 03: six-digit code. */
export function CodeView({ maskedPhone, code, error, busy, canSubmit, cooldown, progress, onChangeCode, onSubmit, onResend, onChangeNumber, onBack, autoFocus = true }: Props) {
  return (
    <Screen>
      <StepBar percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body gap={12} paddingTop={24}>
        <IconBadge icon="message" />
        <H1 style={{ marginTop: 8 }}>کد را وارد کن</H1>
        <Sub>{`به ${ltrRun(maskedPhone)} پیامک شد.`}</Sub>
        <View style={{ width: '100%', marginTop: 24 }}>
          <CodeInput value={code} onChangeText={onChangeCode} onSubmit={onSubmit} autoFocus={autoFocus} label="کد تأیید شش رقمی" invalid={Boolean(error)} testID="onboarding-code" />
        </View>
        {error ? <Text style={[typeStyle('caption'), { color: C.error, width: '100%' }]}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 8 }}>
          {cooldown > 0 ? (
            <Cap style={{ fontSize: 16 }}>{`ارسال دوباره تا ${ltrRun(formatCountdown(cooldown))}`}</Cap>
          ) : (
            <TextButton label="ارسال دوباره کد" onPress={onResend} disabled={busy} />
          )}
          <TextButton label="شماره را عوض کن" onPress={onChangeNumber} />
        </View>
      </Body>
      <Foot>
        <Button label={busy ? 'در حال بررسی…' : 'تأیید'} onPress={onSubmit} disabled={!canSubmit} loading={busy} testID="onboarding-verify" />
      </Foot>
    </Screen>
  );
}
