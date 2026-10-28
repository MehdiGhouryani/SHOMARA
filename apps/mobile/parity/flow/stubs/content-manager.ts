type Pkg = { id: string; version: string; stationId: string };
type FlowWindow = {
  __flow: {
    manifest: { current: Pkg[]; next: Pkg[]; recent: Pkg[]; future: Pkg[] } | null;
    cacheEntries: Array<{ packageId: string; version: string }>;
    prepared: string[];
  };
};
const flow = () => (window as unknown as FlowWindow).__flow;

// The start screen asks the API for the entitlement with `fetch`; the harness has no server.
window.fetch = (async () => ({ ok: true, json: async () => ({ entitled: true }) })) as unknown as typeof window.fetch;

export class MobileContentManager {
  async getManifest() {
    const manifest = flow().manifest;
    if (!manifest) throw new Error('MANIFEST_503');
    return manifest;
  }
  async getCacheEntries() {
    return flow().cacheEntries;
  }
  async downloadPackage(pkg: Pkg) {
    flow().prepared.push(pkg.id);
    flow().cacheEntries.push({ packageId: pkg.id, version: pkg.version });
  }
}
