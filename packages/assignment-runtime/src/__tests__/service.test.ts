import { describe, expect, it } from 'vitest';
import { AssignmentService } from '../service';
import { InMemoryAssignmentRepository } from '../repository';

async function setup(stationIds = ['ST1', 'ST2']) {
  const repo = new InMemoryAssignmentRepository();
  const service = new AssignmentService(repo);
  await service.createDraft({
    id: 'asg1', classId: 'c1', authorAccountId: 't1', learnerIds: ['child-1'], sharedObjective: 'obj',
    boundary: { target: { stationIds }, adaptationMode: 'PINNED' }, startsAt: '2026-01-01T00:00:00Z',
  });
  const { instances } = await service.publish('asg1', ['child-1']);
  return { repo, service, instanceId: instances[0]!.id };
}

describe('AssignmentService server-authoritative completion', () => {
  it('has no learner-reported outcome entry point any more', async () => {
    const { service } = await setup();
    expect((service as unknown as Record<string, unknown>).applyLearningOutcome).toBeUndefined();
  });

  it('completes only after every target station is passed', async () => {
    const { repo, service, instanceId } = await setup(['ST1', 'ST2']);
    await service.recordStationPass('child-1', 'ST1');
    expect((await repo.getInstance(instanceId))!.status).toBe('ACTIVE');
    await service.recordStationPass('child-1', 'ST1'); // idempotent
    expect((await repo.getInstance(instanceId))!.status).toBe('ACTIVE');
    await service.recordStationPass('child-1', 'ST2');
    const done = (await repo.getInstance(instanceId))!;
    expect(done.status).toBe('COMPLETED');
    expect(done.completedAt).not.toBeNull();
  });

  it('ignores stations outside the target and other learners', async () => {
    const { repo, service, instanceId } = await setup(['ST1']);
    await service.recordStationPass('child-1', 'OTHER');
    await service.recordStationPass('child-2', 'ST1');
    expect((await repo.getInstance(instanceId))!.status).toBe('PENDING');
  });

  it('never moves a cancelled instance', async () => {
    const { repo, service, instanceId } = await setup(['ST1']);
    const inst = (await repo.getInstance(instanceId))!;
    inst.status = 'CANCELLED';
    await repo.saveInstance(inst);
    await service.recordStationPass('child-1', 'ST1');
    expect((await repo.getInstance(instanceId))!.status).toBe('CANCELLED');
  });
});

describe('recheck state machine', () => {
  it('rejects recheck on CANCELLED / EXPIRED / already NEEDS_RECHECK', async () => {
    for (const status of ['CANCELLED', 'EXPIRED', 'NEEDS_RECHECK'] as const) {
      const { repo, service, instanceId } = await setup();
      const inst = (await repo.getInstance(instanceId))!;
      inst.status = status;
      await repo.saveInstance(inst);
      await expect(service.requestRecheck(instanceId, 't1')).rejects.toMatchObject({ code: 'INVALID_INSTANCE_STATUS' });
      expect((await repo.getInstance(instanceId))!.status).toBe(status);
    }
  });

  it('teacher completeRecheck is the only way out of NEEDS_RECHECK', async () => {
    const { repo, service, instanceId } = await setup(['ST1']);
    await service.recordStationPass('child-1', 'ST1');
    const recheck = await service.requestRecheck(instanceId, 't1', 'verify');
    const after = (await repo.getInstance(instanceId))!;
    expect(after.status).toBe('NEEDS_RECHECK');
    expect(after.completedAt).toBeNull();
    await service.recordStationPass('child-1', 'ST1'); // learner activity cannot clear it
    expect((await repo.getInstance(instanceId))!.status).toBe('NEEDS_RECHECK');
    await expect(service.markActive(instanceId)).rejects.toMatchObject({ code: 'INVALID_INSTANCE_STATUS' });
    await service.completeRecheck(recheck.id);
    expect((await repo.getInstance(instanceId))!.status).toBe('COMPLETED');
  });
});
