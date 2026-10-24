import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'mathlearning.auth.access-token.v1';
let accessToken: string | null = null;

export async function hydrateAccessToken(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    accessToken = stored?.trim() || null;
    return true;
  } catch {
    accessToken = null;
    return false;
  }
}

export async function setAccessToken(token: string | null): Promise<boolean> {
  accessToken = token?.trim() || null;
  try {
    if (accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
    else await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAuthHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function clearAccessToken(): Promise<boolean> {
  return setAccessToken(null);
}
