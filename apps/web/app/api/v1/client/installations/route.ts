import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

export async function POST(request: Request) {
  try {
    const principal = await requireRequestPrincipal(request);
    const body = await request.json() as {
      installationId?: string;
      platform?: 'ANDROID' | 'IOS' | 'WEB';
      appVersion?: string;
      deviceModel?: string;
    };
    const installationId = body.installationId?.trim();
    const platform = body.platform ?? 'ANDROID';
    if (!installationId) return NextResponse.json({ code: 'CLIENT_INSTALLATION_ID_REQUIRED' }, { status: 400 });
    if (platform !== 'ANDROID' && platform !== 'IOS' && platform !== 'WEB') {
      return NextResponse.json({ code: 'CLIENT_INSTALLATION_PLATFORM_INVALID' }, { status: 400 });
    }
    if (!principal.accessToken) {
      return NextResponse.json({ id: installationId, learningIdentityId: principal.learningIdentityId, platform, status: 'ACTIVE', devOnly: true });
    }
    const installation = await supabaseRpc(principal.accessToken, 'runtime_register_client_installation', {
      p_installation_id: installationId,
      p_platform: platform,
      p_app_version: body.appVersion ?? null,
      p_device_model: body.deviceModel ?? null,
    });
    return NextResponse.json(installation, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { code: 'CLIENT_INSTALLATION_REGISTER_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: apiErrorStatus(error) },
    );
  }
}
