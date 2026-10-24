import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const INSTALLATION_ID_KEY = 'mathlearning.client-installation-id.v1';
let cachedInstallationId: string | null = null;

function isUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function ensureClientInstallationId(): Promise<string> {
  if (isUuid(cachedInstallationId)) return cachedInstallationId;
  try {
    const stored = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
    if (isUuid(stored)) {
      cachedInstallationId = stored;
      return stored;
    }
  } catch {
    // Generate a fresh id below. A persistence failure is surfaced only when the
    // write also fails; the caller may still use the id for this process lifetime.
  }

  const generated = Crypto.randomUUID();
  cachedInstallationId = generated;
  try {
    await SecureStore.setItemAsync(INSTALLATION_ID_KEY, generated, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch {
    // Keep the in-memory id. The next cold start will regenerate and therefore
    // cannot silently impersonate another persisted installation.
  }
  return generated;
}

export async function clearClientInstallationId(): Promise<boolean> {
  cachedInstallationId = null;
  try {
    await SecureStore.deleteItemAsync(INSTALLATION_ID_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getClientInstallationId(): string | null {
  return cachedInstallationId;
}
