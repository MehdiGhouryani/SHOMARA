import { View } from 'react-native';
import { Text } from '../../ui/AppText';
import { Button } from '../../ui/v2/core';
import { CodeInput2, TextLink2 } from '../../ui/v2/forms';
import { Body2, Foot2, IconBadge2, Screen2, StepBar2 } from '../../ui/v2/shell';
import { C2, S2, type2 } from '../../ui/v2/tokens';
import { formatCountdown, ltrRun } from '../steps';

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

/** Playbook 03 (code): six cells per the auth contract, resend cooldown, change number. */
export function CodeView2({ maskedPhone, code, error, busy, canSubmit, cooldown, progress, onChangeCode, onSubmit, onResend, onChangeNumber, onBack, autoFocus = true }: Props) {
  return (
    <Screen2>
      <StepBar2 percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body2 gap={S2.md} paddingTop={S2.xl}>
        <IconBadge2 icon="chatbubble-ellipses" />
        <Text style={[type2('title'), { color: C2.ink, marginTop: S2.sm }]}>کد را وارد کن</Text>
        <Text style={[type2('body'), { color: C2.ink2 }]}>{`به ${ltrRun(maskedPhone)} پیامک شد.`}</Text>
        <View style={{ width: '100%', marginTop: S2.xl }}>
          <CodeInput2 value={code} onChangeText={onChangeCode} onSubmit={onSubmit} autoFocus={autoFocus} label="کد تأیید شش رقمی" invalid={Boolean(error)} testID="onboarding-code" />
        </View>
        {error ? <Text style={[type2('caption'), { color: C2.danger, width: '100%' }]}>{error}</Text> : null}
        <View style={styles.resendRow}>
          {cooldown > 0 ? (
            <Text style={[type2('body'), { color: C2.muted }]}>{`ارسال دوباره تا ${ltrRun(formatCountdown(cooldown))}`}</Text>
          ) : (
            <TextLink2 label="ارسال دوباره کد" onPress={onResend} disabled={busy} />
          )}
          <TextLink2 label="شماره را عوض کن" onPress={onChangeNumber} />
        </View>
      </Body2>
      <Foot2>
        <Button label={busy ? 'در حال بررسی…' : 'تأیید'} onPress={onSubmit} disabled={!canSubmit} loading={busy} testID="onboarding-verify" />
      </Foot2>
    </Screen2>
  );
}

const styles = {
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: S2.sm },
} as const;
