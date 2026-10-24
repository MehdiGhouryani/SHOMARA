import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import type { CacheClass, ContentManifest, ContentPackageItem, ContentPackageRef, ContentPackagePresentation, EntitlementCheck } from '@math/contracts';
import { backoffMs } from '@math/content-delivery';
import { getAuthHeaders } from '../auth/AuthSession';

export type DownloadResult = { packageId: string; uri: string; checksum: string; bytes: number };

export interface ContentApi {
  getManifest(gradeId: string): Promise<ContentManifest>;
  getEntitlement(packageId: string): Promise<EntitlementCheck>;
}


export interface CachedContentPackage {
  schema: string;
  environment: 'PRODUCTION' | 'STAGING_ONLY';
  gradeId: string;
  stationId: string;
  packageVersion: string;
  items: ContentPackageItem[];
}

export interface CacheEntry {
  packageId: string;
  version: string;
  cacheClass: CacheClass;
  bytes: number;
  checksum: string;
  uri: string;
  lastAccessedAt: string;
}

export class MobileContentManager {
  private readonly root = new Directory(Paths.document, 'content-packages');
  private readonly metadata = new File(Paths.document, 'content-manifest.json');
  private readonly cacheIndex = new File(Paths.document, 'content-cache-index.json');

  constructor(private readonly api: ContentApi, private readonly baseUrl: string) {}

  /** Fetch the manifest for a grade without downloading packages (callers must not reach into the private api). */
  getManifest(gradeId: string): Promise<ContentManifest> {
    return this.api.getManifest(gradeId);
  }

  async prepareGrade(gradeId: string): Promise<ContentManifest> {
    const manifest = await this.api.getManifest(gradeId);
    await this.ensureDirectory();
    await this.persistManifest(manifest);
    for (const pkg of [...manifest.current, ...manifest.next]) {
      const entitlement = await this.api.getEntitlement(pkg.id);
      if (entitlement.entitled) await this.downloadPackage(pkg, 3);
      else await this.removePackage(pkg.id, pkg.version);
    }
    await this.evictToBudget();
    return manifest;
  }

  async downloadPackage(pkg: ContentPackageRef, maxAttempts = 3): Promise<DownloadResult> {
    await this.ensureDirectory();
    const destination = new File(this.root, `${safeName(pkg.id)}-${safeName(pkg.version)}.json`);
    const existing = await this.readCacheIndex();
    const existingEntry = existing.find((x) => x.packageId === pkg.id && x.version === pkg.version);
    if (destination.exists && existingEntry?.bytes === pkg.bytes && existingEntry?.checksum === pkg.checksum) {
      try {
        const existingBytes = await destination.bytes();
        const existingDigest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, existingBytes);
        const existingChecksum = Array.from(new Uint8Array(existingDigest)).map((x) => x.toString(16).padStart(2, '0')).join('');
        if (existingBytes.byteLength === pkg.bytes && existingChecksum === pkg.checksum) {
          existingEntry.lastAccessedAt = new Date().toISOString();
          await this.writeCacheIndex(existing);
          return { packageId: pkg.id, uri: destination.uri, checksum: existingChecksum, bytes: existingBytes.byteLength };
        }
      } catch {
        // Fall through to a clean redownload.
      }
    }
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const authHeaders = getAuthHeaders();
        const headers: HeadersInit = { Accept: 'application/json', ...authHeaders };

        const response = await fetch(`${this.baseUrl}${pkg.downloadUrl}`, { headers });
        if (!response.ok) throw new Error(`PACKAGE_HTTP_${response.status}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (destination.exists) destination.delete();
        destination.create({ intermediates: true, overwrite: true });
        destination.write(bytes);
        const file = destination;
        const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
        const checksum = Array.from(new Uint8Array(digest)).map((x) => x.toString(16).padStart(2, '0')).join('');
        if (checksum !== pkg.checksum) {
          file.delete();
          throw new Error(`CHECKSUM_MISMATCH:${pkg.id}`);
        }
        await this.upsertCacheEntry({ packageId: pkg.id, version: pkg.version, cacheClass: pkg.cacheClass, bytes: bytes.byteLength, checksum, uri: file.uri, lastAccessedAt: new Date().toISOString() });
        return { packageId: pkg.id, uri: file.uri, checksum, bytes: bytes.byteLength };
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts - 1) await delay(backoffMs(attempt));
      }
    }
    throw lastError instanceof Error ? lastError : new Error('PACKAGE_DOWNLOAD_FAILED');
  }

  async getLocalUri(packageId: string, version: string): Promise<string | null> {
    const file = new File(this.root, `${safeName(packageId)}-${safeName(version)}.json`);
    if (!file.exists) return null;
    const entries = await this.readCacheIndex();
    const entry = entries.find((x) => x.packageId === packageId && x.version === version);
    if (entry) {
      entry.lastAccessedAt = new Date().toISOString();
      await this.writeCacheIndex(entries);
    }
    return file.uri;
  }

  async evictToBudget(maxBytes = 80 * 1024 * 1024): Promise<CacheEntry[]> {
    const entries = await this.readCacheIndex();
    let total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
    const victims = entries
      .filter((entry) => entry.cacheClass !== 'CURRENT')
      .sort((a, b) => evictionRank(b.cacheClass) - evictionRank(a.cacheClass) || a.lastAccessedAt.localeCompare(b.lastAccessedAt));
    const removed: CacheEntry[] = [];
    for (const entry of victims) {
      if (total <= maxBytes) break;
      const file = new File(this.root, `${safeName(entry.packageId)}-${safeName(entry.version)}.json`);
      if (file.exists) file.delete();
      total -= entry.bytes;
      removed.push(entry);
    }
    const removedKeys = new Set(removed.map((x) => `${x.packageId}:${x.version}`));
    await this.writeCacheIndex(entries.filter((entry) => !removedKeys.has(`${entry.packageId}:${entry.version}`)));
    if (total > maxBytes) throw new Error('CACHE_BUDGET_EXCEEDED_BY_PROTECTED_CURRENT');
    return removed;
  }

  async removePackage(packageId: string, version: string): Promise<void> {
    const file = new File(this.root, `${safeName(packageId)}-${safeName(version)}.json`);
    if (file.exists) file.delete();
    const entries = await this.readCacheIndex();
    await this.writeCacheIndex(entries.filter((x) => !(x.packageId === packageId && x.version === version)));
  }

  async getCacheEntries(): Promise<CacheEntry[]> { return this.readCacheIndex(); }

  async getCachedPackage(packageId: string, version: string): Promise<CachedContentPackage | null> {
    const uri = await this.getLocalUri(packageId, version);
    if (!uri) return null;
    try {
      const file = new File(uri);
      const bytes = await file.bytes();
      if (bytes.byteLength === 0) return null;
      const value = JSON.parse(new TextDecoder().decode(bytes)) as CachedContentPackage;
      if (!value || value.schema !== 'math-content-package/v1' || !Array.isArray(value.items)) return null;
      if (__DEV__) return value;
      const manifest = await this.getCachedManifest();
      const expected = manifest
        ? [...manifest.current, ...manifest.next, ...manifest.recent, ...manifest.future].find((pkg) => pkg.id === packageId && pkg.version === version)
        : null;
      if (!expected || expected.checksum !== await sha256(bytes) || expected.bytes !== bytes.byteLength) return null;
      if (value.environment !== 'PRODUCTION') return null;
      if (value.gradeId !== expected.gradeId) return null;
      if (value.packageVersion !== expected.version) return null;
      if (value.stationId !== expected.stationId) return null;
      return value;
    } catch {
      return null;
    }
  }

  async getCachedContentVersion(packageId: string, version: string, contentVersionId: string): Promise<ContentPackagePresentation | null> {
    const pkg = await this.getCachedPackage(packageId, version);
    if (!pkg) return null;
    return pkg.items.find((item) => item.contentVersionId === contentVersionId)?.presentation ?? null;
  }

  async getCachedManifest(): Promise<ContentManifest | null> {
    if (!this.metadata.exists) return null;
    try {
      const bytes = await this.metadata.bytes();
      if (bytes.byteLength === 0) return null;
      return JSON.parse(new TextDecoder().decode(bytes)) as ContentManifest;
    } catch {
      return null;
    }
  }

  private async ensureDirectory() {
    if (!this.root.exists) this.root.create({ intermediates: true, idempotent: true });
  }

  private async persistManifest(manifest: ContentManifest) {
    if (!this.metadata.exists) this.metadata.create({ intermediates: true, overwrite: true });
    this.metadata.write(JSON.stringify(manifest));
  }

  private async readCacheIndex(): Promise<CacheEntry[]> {
    if (!this.cacheIndex.exists) return [];
    const bytes = await this.cacheIndex.bytes();
    if (bytes.byteLength === 0) return [];
    return JSON.parse(new TextDecoder().decode(bytes)) as CacheEntry[];
  }

  private async writeCacheIndex(entries: CacheEntry[]): Promise<void> {
    if (!this.cacheIndex.exists) this.cacheIndex.create({ intermediates: true, overwrite: true });
    this.cacheIndex.write(JSON.stringify(entries));
  }

  private async upsertCacheEntry(entry: CacheEntry): Promise<void> {
    const entries = await this.readCacheIndex();
    const next = entries.filter((x) => !(x.packageId === entry.packageId && x.version === entry.version));
    next.push(entry);
    await this.writeCacheIndex(next);
  }
}

function evictionRank(cacheClass: CacheClass): number {
  return cacheClass === 'FUTURE' ? 4 : cacheClass === 'RECENT' ? 3 : cacheClass === 'NEXT' ? 2 : 0;
}

function safeName(value: string) { return value.replace(/[^a-zA-Z0-9._-]/g, '_'); }
function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes as Uint8Array<ArrayBuffer>);
  return Array.from(new Uint8Array(digest)).map((x) => x.toString(16).padStart(2, '0')).join('');
}
