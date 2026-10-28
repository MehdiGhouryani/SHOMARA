import { AssignmentService, InMemoryAssignmentRepository } from '@math/assignment-runtime';

const globalKey = '__mathAssignmentRuntime';

type RuntimeGlobal = typeof globalThis & { [globalKey]?: { repo: InMemoryAssignmentRepository; service: AssignmentService } };
const runtimeGlobal = globalThis as RuntimeGlobal;

export const assignmentRuntime = runtimeGlobal[globalKey] ?? (() => {
  const repo = new InMemoryAssignmentRepository();
  const service = new AssignmentService(repo);
  const runtime = { repo, service };
  runtimeGlobal[globalKey] = runtime;
  return runtime;
})();
