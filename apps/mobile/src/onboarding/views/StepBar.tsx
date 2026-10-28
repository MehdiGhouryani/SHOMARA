import { ProgressBar, TopBar } from '../../ui/v1';

type Props = { percent: number; label: string; onBack: () => void };

/** Back chevron plus the step progress bar (`.top`), shared by every onboarding page except the welcome. */
export function StepBar({ percent, label, onBack }: Props) {
  return (
    <TopBar action={{ icon: 'chevronBack', label: 'برگشت', onPress: onBack }}>
      <ProgressBar value={percent / 100} label={label} />
    </TopBar>
  );
}
