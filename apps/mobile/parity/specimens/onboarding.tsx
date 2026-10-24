import { CodeView } from '../../src/onboarding/views/CodeView';
import { PhoneView } from '../../src/onboarding/views/PhoneView';
import { ProfileView } from '../../src/onboarding/views/ProfileView';
import { WelcomeView } from '../../src/onboarding/views/WelcomeView';

/**
 * The real onboarding views with the data the approved pages illustrate. The app renders these same
 * components, so a pass here is a pass for the screens themselves (not for a lookalike).
 */
const noop = () => undefined;
const bar = (percent: number, n: number) => ({ percent, label: `مرحلهٔ ${'۰۱۲۳۴۵۶۷۸۹'[n]} از ۶` });

export const Welcome = () => <WelcomeView onStart={noop} />;

export const Phone = () => (
  <PhoneView phone="" error="" busy={false} canSubmit={false} progress={bar(33, 2)} onChangePhone={noop} onSubmit={noop} onBack={noop} autoFocus={false} previewFocus />
);

export const Code = () => (
  <CodeView
    maskedPhone="۰۹۱۲***۶۷۸۹"
    code="4271"
    error=""
    busy={false}
    canSubmit={false}
    cooldown={45}
    progress={bar(50, 3)}
    onChangeCode={noop}
    onSubmit={noop}
    onResend={noop}
    onChangeNumber={noop}
    onBack={noop}
    autoFocus={false}
  />
);

export const Profile = () => (
  <ProfileView
    name=""
    error=""
    avatarId="sun"
    gradeId="G1"
    avatars={[
      { id: 'sun', label: 'خورشیدی' },
      { id: 'leaf', label: 'برگ' },
      { id: 'cloud', label: 'ابری' },
      { id: 'moon', label: 'ماه' },
    ]}
    grades={[
      { id: 'G1', available: true },
      { id: 'G2', available: false },
      { id: 'G3', available: false },
      { id: 'G4', available: false },
      { id: 'G5', available: false },
      { id: 'G6', available: false },
    ]}
    canSubmit={false}
    progress={bar(67, 4)}
    onChangeName={noop}
    onSelectAvatar={noop}
    onSelectGrade={noop}
    onSubmit={noop}
    onBack={noop}
    autoFocus={false}
    previewFocus
  />
);
