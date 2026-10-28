/** The remote sync queue is not part of the lesson screens under test. */
export const createMobileSyncManager = () => ({ flush: async () => ({ processed: 0, acked: 0, retried: 0, rejected: 0 }) });
export const stableActionKey = (...parts: unknown[]) => parts.join(':');
