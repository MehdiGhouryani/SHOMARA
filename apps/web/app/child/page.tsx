'use client';

import { persistCompletedOnboarding } from '../../lib/complete-onboarding';

import { useRouter } from 'next/navigation';
import { AuthFlowScreen } from '../../components/AuthFlowScreen';

export default function ChildProfileOnboardingPage() {
  const router = useRouter();
  return <AuthFlowScreen initialStep="CHILD" onClose={() => router.back()} onCompleteAuth={(data) => { persistCompletedOnboarding(data); router.replace('/'); }} />;
}
