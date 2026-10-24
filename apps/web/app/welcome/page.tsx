'use client';

import { persistCompletedOnboarding } from '../../lib/complete-onboarding';

import { useRouter } from 'next/navigation';
import { AuthFlowScreen } from '../../components/AuthFlowScreen';

export default function WelcomePage() {
  const router = useRouter();
  return (
    <AuthFlowScreen
      initialStep="WELCOME"
      onClose={() => router.replace('/')}
      onCompleteAuth={(data) => { persistCompletedOnboarding(data); router.replace('/'); }}
    />
  );
}
