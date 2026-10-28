import { createAdultProjectionRuntime } from '@math/adult-projections';
import { assignmentRuntime } from '@/lib/assignment-runtime';

export const adultProjectionRuntime = createAdultProjectionRuntime(assignmentRuntime.service);
