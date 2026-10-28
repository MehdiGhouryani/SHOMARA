'use client';

import { persistCompletedOnboarding } from '../../lib/complete-onboarding';

import { useRouter } from 'next/navigation';
import { AuthFlowScreen } from '../../components/AuthFlowScreen';

export default function AuthPage() {
  const router = useRouter();
  return <AuthFlowScreen initialStep="AUTH" onClose={() => router.back()} onCompleteAuth={(data) => { persistCompletedOnboarding(data); router.replace('/'); }} />;
}
