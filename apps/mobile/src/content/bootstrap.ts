import type { ContentManifest, EntitlementCheck } from '@math/contracts';
import { getAuthHeaders } from '../auth/AuthSession';
import { API_BASE_URL, productionConfigError } from '../config/runtime';
import { MobileContentManager, type CacheEntry, type ContentApi } from './ContentManager';

export interface ContentSnapshot {
  manifest: ContentManifest;
  cacheEntries: CacheEntry[];
}

function createApi(): ContentApi {
  const authHeaders = getAuthHeaders();
  return {
    getManifest: async (gradeId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/content/manifest?gradeId=${encodeURIComponent(gradeId)}`, {
        headers: { Accept: 'application/json', ...authHeaders },
      });
      if (!response.ok) throw new Error(`MANIFEST_${response.status}`);
      return (await response.json()) as ContentManifest;
    },
    getEntitlement: async (packageId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/content/entitlements/${encodeURIComponent(packageId)}`, {
        headers: { Accept: 'application/json', ...authHeaders },
      });
      if (!response.ok) throw new Error(`ENTITLEMENT_${response.status}`);
      return (await response.json()) as EntitlementCheck;
    },
  };
}

function createManager() {
  return new MobileContentManager(createApi(), API_BASE_URL);
}

export async function prepareGradeContent(gradeId: string): Promise<ContentSnapshot> {
  const configError = productionConfigError();
  if (configError) throw new Error('CONTENT_CONFIG_ERROR');
  const manager = createManager();
  const manifest = await manager.prepareGrade(gradeId);
  return { manifest, cacheEntries: await manager.getCacheEntries() };
}

export async function loadContentSnapshot(gradeId: string): Promise<ContentSnapshot | null> {
  const manager = createManager();
  try {
    const manifest = await manager.getManifest(gradeId);
    return { manifest, cacheEntries: await manager.getCacheEntries() };
  } catch {
    const cachedManifest = await manager.getCachedManifest();
    const cacheEntries = await manager.getCacheEntries();
    if (!cachedManifest || cachedManifest.gradeId !== gradeId) return null;
    return { manifest: cachedManifest, cacheEntries };
  }
}

export function cachedStationIds(snapshot: ContentSnapshot | null): string[] {
  if (!snapshot) return [];
  const cached = new Set(snapshot.cacheEntries.map((entry) => `${entry.packageId}:${entry.version}`));
  return [...snapshot.manifest.current, ...snapshot.manifest.next, ...snapshot.manifest.recent, ...snapshot.manifest.future]
    .filter((pkg) => cached.has(`${pkg.id}:${pkg.version}`) && pkg.stationId)
    .map((pkg) => pkg.stationId!.replace(/^G1-/, ''));
}
