import { Directory, File, Paths } from 'expo-file-system';
import type { OfflineSyncAction, SyncQueueStore } from '@math/offline-sync';
import { parseQueueText } from './queueParse';

/**
 * File-backed pending-action queue.
 * - Operations are serialized (no lost updates from concurrent read-modify-write).
 * - Writes go to a temp file first; a crash mid-write never destroys the last good queue.
 * - A corrupt queue file is quarantined (kept for diagnosis) instead of blocking sync forever.
 * Device behaviour of File.move(overwrite) is UNVERIFIED until the final device phase.
 */
export class FileSyncQueueStore implements SyncQueueStore {
  private readonly dir = new Directory(Paths.document, 'sync');
  private readonly file = new File(this.dir, 'pending-actions.json');
  private readonly tmp = new File(this.dir, 'pending-actions.json.tmp');
  private chain: Promise<unknown> = Promise.resolve();

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => undefined);
    return run;
  }

  async listReady(now: string): Promise<OfflineSyncAction[]> {
    return this.serialize(async () => {
      const actions = await this.read();
      const t = Date.parse(now);
      return actions
        .filter((x) => (x.status === 'PENDING' || x.status === 'RETRY' || x.status === 'SYNCING') && (!x.nextRetryAt || Date.parse(x.nextRetryAt) <= t))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }

  put(action: OfflineSyncAction): Promise<void> { return this.upsert(action); }

  update(action: OfflineSyncAction): Promise<void> { return this.upsert(action); }

  remove(id: string): Promise<void> {
    return this.serialize(async () => {
      const actions = await this.read();
      await this.write(actions.filter((x) => x.id !== id));
    });
  }

  private upsert(action: OfflineSyncAction): Promise<void> {
    return this.serialize(async () => {
      const actions = await this.read();
      const index = actions.findIndex((x) => x.id === action.id);
      if (index === -1) actions.push(action); else actions[index] = action;
      await this.write(actions);
    });
  }

  private async parseFile(file: File): Promise<OfflineSyncAction[] | null> {
    if (!file.exists) return null;
    try {
      return parseQueueText(new TextDecoder().decode(await file.bytes()));
    } catch {
      return null;
    }
  }

  private async read(): Promise<OfflineSyncAction[]> {
    const main = await this.parseFile(this.file);
    if (main) return main;
    // Main file missing or unreadable: a complete temp file from an interrupted write is the newest good copy.
    const recovered = await this.parseFile(this.tmp);
    if (this.file.exists) this.quarantineCorrupt();
    return recovered ?? [];
  }

  private quarantineCorrupt(): void {
    try {
      const target = new File(this.dir, `pending-actions.corrupt-${Date.now()}.json`);
      this.file.move(target);
    } catch {
      try { this.file.delete(); } catch { /* nothing else we can safely do */ }
    }
  }

  private async write(actions: OfflineSyncAction[]): Promise<void> {
    if (!this.dir.exists) this.dir.create({ intermediates: true, idempotent: true });
    if (this.tmp.exists) this.tmp.delete();
    this.tmp.create({ intermediates: true, overwrite: true });
    this.tmp.write(JSON.stringify(actions));
    if (this.file.exists) this.file.delete();
    this.tmp.move(this.file);
  }
}
