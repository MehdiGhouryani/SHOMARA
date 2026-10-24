import { View } from 'react-native';
import { toFa } from '../../ui/digits';
import { Body, Button, Foot, H1, Note, Portrait, Screen, Sub, TextField, C } from '../../ui/v1';
import { StepBar } from './StepBar';

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

/** Page 02: phone number. */
export function PhoneView({ phone, error, busy, canSubmit, progress, onChangePhone, onSubmit, onBack, autoFocus = true, previewFocus }: Props) {
  return (
    <Screen>
      <StepBar percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body gap={12} paddingTop={16}>
        <Portrait pose="main-thinking" tone="main" size={132} borderColor={C.violet} label="شخصیت اصلی در حال فکر کردن" />
        <H1 style={{ marginTop: 8 }}>شماره‌ات را بنویس</H1>
        <Sub>کد تأیید را همین‌جا می‌فرستیم.</Sub>
        <View style={{ width: '100%', marginTop: 16 }}>
          <TextField
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
        <Note icon="lock">فقط برای ورود. شماره با کسی به اشتراک گذاشته نمی‌شود.</Note>
      </Body>
      <Foot>
        <Button label={busy ? 'در حال ارسال…' : 'ارسال کد'} onPress={onSubmit} disabled={!canSubmit} loading={busy} testID="onboarding-send-code" />
      </Foot>
    </Screen>
  );
}
