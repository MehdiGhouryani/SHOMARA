import { AssignmentService } from '@math/assignment-runtime';
import { InMemoryAdultProjectionRepository } from './repository.js';
import { AdultProjectionService } from './service.js';

export * from './types.js';
export * from './repository.js';
export * from './service.js';

export function createAdultProjectionRuntime(assignments: AssignmentService) {
  const repo = new InMemoryAdultProjectionRepository();
  const service = new AdultProjectionService(repo, assignments);
  return { repo, assignments, service };
}
