'use client';

import { persistCompletedOnboarding } from '../../lib/complete-onboarding';

import { useRouter } from 'next/navigation';
import { AuthFlowScreen } from '../../components/AuthFlowScreen';

export default function GradePage() {
  const router = useRouter();
  return <AuthFlowScreen initialStep="GRADE" onClose={() => router.back()} onCompleteAuth={(data) => { persistCompletedOnboarding(data); router.replace('/'); }} />;
}
