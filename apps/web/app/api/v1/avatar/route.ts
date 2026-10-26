import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

export async function GET(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('AVATAR_BACKEND_REQUIRES_AUTH');
    const projection = await supabaseRpc(principal.accessToken, 'avatar_workshop_projection', {});
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json(
      { code: 'AVATAR_WORKSHOP_FAILED', message: publicErrorMessage(error) },
      { status: apiErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('AVATAR_BACKEND_REQUIRES_AUTH');
    const body = (await request.json().catch(() => ({}))) as {
      basePresetId?: string;
      outfitId?: string | null;
      hatId?: string | null;
      accessoryId?: string | null;
      backgroundId?: string | null;
    };
    if (!body.basePresetId) {
      return NextResponse.json({ code: 'BASE_PRESET_REQUIRED', message: 'basePresetId required' }, { status: 400 });
    }
    const projection = await supabaseRpc(principal.accessToken, 'avatar_save_appearance', {
      p_base_preset_id: body.basePresetId,
      p_outfit_id: body.outfitId ?? null,
      p_hat_id: body.hatId ?? null,
      p_accessory_id: body.accessoryId ?? null,
      p_background_id: body.backgroundId ?? null,
    });
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json(
      { code: 'AVATAR_SAVE_FAILED', message: publicErrorMessage(error) },
      { status: apiErrorStatus(error) },
    );
  }
}
