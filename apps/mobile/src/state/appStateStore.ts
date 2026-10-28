import { Directory, File, Paths } from 'expo-file-system';
import { decideEntry, type AppState, type EntryDecision } from './appStateCore';

/**
 * File IO for the versioned app state. Writes are ATOMIC (tmp file, then move
 * over the real one) and serialized through a queue, so a crash or two fast
 * updates can never leave a half-written file. A file we cannot trust is backed
 * up (never silently discarded) before the child is sent through First Run again.
 */
const dir = new Directory(Paths.document, 'state');
const main = new File(dir, 'app-state.json');
const tmp = new File(dir, 'app-state.json.tmp');

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.catch(() => undefined);
  return run;
}

function ensureDir() {
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
}

async function readRaw(): Promise<string | null> {
  if (!main.exists) return null;
  const bytes = await main.bytes();
  return new TextDecoder().decode(bytes);
}

function backup(raw: string, reason: 'CORRUPT' | 'NEWER_VERSION') {
  try {
    ensureDir();
    const file = new File(dir, reason === 'NEWER_VERSION' ? 'app-state.newer-version.json' : 'app-state.corrupt.json');
    if (!file.exists) file.create({ intermediates: true, overwrite: true });
    file.write(raw);
  } catch {
    // best-effort only
  }
}

export function loadEntry(): Promise<EntryDecision> {
  return enqueue(async () => {
    let raw: string | null;
    try {
      raw = await readRaw();
    } catch {
      return { kind: 'RECOVER', reason: 'CORRUPT' } as const;
    }
    const decision = decideEntry(raw);
    if (decision.kind === 'RECOVER' && raw !== null) backup(raw, decision.reason);
    return decision;
  });
}

/** Parent-initiated deletion of EVERYTHING stored about the child (state + backups + temp). */
export function deleteAllData(): Promise<boolean> {
  return enqueue(async () => {
    try {
      if (dir.exists) dir.delete();
      return !dir.exists;
    } catch {
      return false;
    }
  });
}

export function saveState(state: AppState): Promise<boolean> {
  return enqueue(async () => {
    try {
      ensureDir();
      if (!tmp.exists) tmp.create({ intermediates: true, overwrite: true });
      tmp.write(JSON.stringify(state));
      tmp.move(main, { overwrite: true });
      return true;
    } catch {
      return false;
    }
  });
}
