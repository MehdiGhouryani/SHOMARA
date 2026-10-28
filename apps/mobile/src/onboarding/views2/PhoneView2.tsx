import { View } from 'react-native';
import { Text } from '../../ui/AppText';
import { toFa } from '../../ui/digits';
import { Character } from '../../ui/v2/Character';
import { Button } from '../../ui/v2/core';
import { TextField2 } from '../../ui/v2/forms';
import { Body2, Foot2, Note2, Screen2, StepBar2 } from '../../ui/v2/shell';
import { C2, S2, type2 } from '../../ui/v2/tokens';

type Props = {
  /** Local 10-digit number without the leading zero (already normalized). */
  phone: string;
  error: string;
  busy: boolean;
  canSubmit: boolean;
  progress: { percent: number; label: string };
  onChangePhone: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  autoFocus?: boolean;
  /** Draws the focused look without real focus (visual-parity specimen). */
  previewFocus?: boolean;
};

/** Playbook 03 (phone): one calm form action; prefix + LTR digits; error near the field. */
export function PhoneView2({ phone, error, busy, canSubmit, progress, onChangePhone, onSubmit, onBack, autoFocus = true, previewFocus }: Props) {
  return (
    <Screen2>
      <StepBar2 percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body2 gap={S2.md} paddingTop={S2.lg}>
        <Character characterId="main" emotion="thinking" size={112} accessibilityLabel="شخصیت اصلی در حال فکر کردن" />
        <Text style={[type2('title'), { color: C2.ink, marginTop: S2.sm }]}>شماره‌ات را بنویس</Text>
        <Text style={[type2('body'), { color: C2.ink2 }]}>کد تأیید را همین‌جا می‌فرستیم.</Text>
        <View style={{ width: '100%', marginTop: S2.lg }}>
          <TextField2
            label="شماره موبایل"
            value={toFa(phone)}
            onChangeText={onChangePhone}
            placeholder="۹۱۲۳۴۵۶۷۸۹"
            prefix="+۹۸"
            ltr
            keyboardType="number-pad"
            maxLength={14}
            hint="۱۰ رقم بعد از ۰ را بنویس."
            error={error || undefined}
            autoFocus={autoFocus}
            focused={previewFocus}
            testID="onboarding-phone"
          />
        </View>
        <Note2 icon="lock-closed">فقط برای ورود. شماره با کسی به اشتراک گذاشته نمی‌شود.</Note2>
      </Body2>
      <Foot2>
        <Button label={busy ? 'در حال ارسال…' : 'ارسال کد'} onPress={onSubmit} disabled={!canSubmit} loading={busy} testID="onboarding-send-code" />
      </Foot2>
    </Screen2>
  );
}
