import type { ContentManifest, ContentPackageDescriptor, EntitlementCheck, CacheClass } from '@math/contracts';

export interface ContentRepository {
  getManifest(gradeId: string): Promise<ContentManifest>;
  getPackage(packageId: string): Promise<ContentPackageDescriptor | null>;
  checkEntitlement(packageId: string, learningIdentityId: string | null): Promise<EntitlementCheck>;
}

export interface PackageSelection {
  current: ContentPackageDescriptor[];
  next: ContentPackageDescriptor[];
  recent: ContentPackageDescriptor[];
  future: ContentPackageDescriptor[];
}

export function groupByCacheClass(packages: ContentPackageDescriptor[]): PackageSelection {
  const groups: Record<CacheClass, ContentPackageDescriptor[]> = {
    CURRENT: [], NEXT: [], RECENT: [], FUTURE: [],
  };
  for (const pkg of packages) groups[pkg.cacheClass].push(pkg);
  return { current: groups.CURRENT, next: groups.NEXT, recent: groups.RECENT, future: groups.FUTURE };
}

export function shouldDownload(cacheClass: CacheClass, online: boolean): boolean {
  if (!online) return cacheClass === 'CURRENT' || cacheClass === 'RECENT';
  return cacheClass !== 'FUTURE';
}

export function backoffMs(attempt: number, base = 750, max = 30_000): number {
  const exponent = Math.max(0, Math.min(attempt, 6));
  return Math.min(max, base * 2 ** exponent);
}
