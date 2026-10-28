'use client';

import { persistCompletedOnboarding } from '../../../lib/complete-onboarding';

import { useRouter } from 'next/navigation';
import { AuthFlowScreen } from '../../../components/AuthFlowScreen';

export default function AuthCodePage() {
  const router = useRouter();
  return <AuthFlowScreen initialStep="OTP" onClose={() => router.back()} onCompleteAuth={(data) => { persistCompletedOnboarding(data); router.replace('/'); }} />;
}
