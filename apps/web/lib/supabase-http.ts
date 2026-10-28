export class SupabaseConfigError extends Error {
  constructor(message = 'SUPABASE_CONFIG_MISSING') {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new SupabaseConfigError();
  return { url, anonKey };
}

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
};

export async function getSupabaseAuthUser(accessToken: string): Promise<SupabaseAuthUser> {
  const { url, anonKey } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'AUTH_INVALID_TOKEN' : 'AUTH_PROVIDER_ERROR');
  }
  const user = await response.json() as SupabaseAuthUser;
  if (!user.id) throw new Error('AUTH_USER_ID_MISSING');
  return user;
}

export async function supabaseRestSelect<T>(
  accessToken: string,
  table: string,
  query: Record<string, string>,
): Promise<T[]> {
  const { url, anonKey } = config();
  const params = new URLSearchParams(query);
  const response = await fetch(`${url}/rest/v1/${table}?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`SUPABASE_REST_${response.status}`);
  }
  return await response.json() as T[];
}

export async function supabaseRpc<T>(
  accessToken: string,
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { url, anonKey } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) {
    // Never put the raw backend body in the thrown message: routes return error.message to clients.
    // Log only status, function name and the PostgreSQL error code (no message text, no PII, no tokens).
    let pgCode = '';
    try {
      const parsed = JSON.parse(await response.text()) as { code?: unknown };
      if (typeof parsed.code === 'string' && /^[A-Z0-9]{5}$/.test(parsed.code)) pgCode = parsed.code;
    } catch { /* status-only */ }
    console.error(`[supabaseRpc] ${functionName} failed status=${response.status}${pgCode ? ` pg=${pgCode}` : ''}`);
    throw new Error(`SUPABASE_RPC_${response.status}`);
  }
  return await response.json() as T;
}
