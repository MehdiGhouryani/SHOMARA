import { describe, expect, it } from 'vitest';
import {
  STATION_CHALLENGE_DEFINITION_IDS,
  challengeDefinitionIdForStation,
  extractClientPresentation,
  hasStationChallenge,
  normalizeStationCode,
} from './challenge-presentation';
import { ST01_CHALLENGE_DEFINITION_ID } from './st01-slice';
import { P10_BATCH_A_DEPTH } from './p10-batch-a-depth';
import { P10_BATCH_B_DEPTH } from './p10-batch-b-depth';
import { P10_BATCH_C_DEPTH } from './p10-batch-c-depth';
import { P10_BATCH_D_DEPTH } from './p10-batch-d-depth';
import { P10_BATCH_E_DEPTH } from './p10-batch-e-depth';

describe('extractClientPresentation', () => {
  it('returns empty for null/invalid metadata', () => {
    expect(extractClientPresentation(null).options).toEqual([]);
    expect(extractClientPresentation(undefined).title).toBeNull();
    expect(extractClientPresentation('x').options).toEqual([]);
  });

  it('reads nested presentation (DB shape)', () => {
    const p = extractClientPresentation({
      presentation: {
        title: 'بالا یا پایین',
        options: ['بالا', 'پایین'],
        display: 'توپ روی قفسه',
      },
    });
    expect(p.title).toBe('بالا یا پایین');
    expect(p.options).toEqual(['بالا', 'پایین']);
    expect(p.display).toBe('توپ روی قفسه');
    expect(p.sequence).toBeNull();
  });

  it('reads ST01 sequence tokens', () => {
    const p = extractClientPresentation({
      presentation: {
        title: 'تکه گمشده',
        options: ['زرد', 'آبی'],
        sequence: ['Y', 'B', 'Y', 'B', '?'],
      },
    });
    expect(p.sequence).toEqual(['Y', 'B', 'Y', 'B', '?']);
    expect(p.display).toBeNull();
  });

  it('never invents options from non-arrays and ignores answer-key-like keys', () => {
    const p = extractClientPresentation({
      presentation: { title: 'x', options: 'bad', expectedAnswers: [0] },
    });
    expect(p.options).toEqual([]);
    expect(p.title).toBe('x');
  });
});

describe('station challenge map', () => {
  it('covers ST01–ST25 uniquely', () => {
    const codes = Object.keys(STATION_CHALLENGE_DEFINITION_IDS);
    expect(codes).toHaveLength(25);
    const ids = Object.values(STATION_CHALLENGE_DEFINITION_IDS);
    expect(new Set(ids).size).toBe(25);
  });

  it('matches ST01 constant and depth seed definitionIds', () => {
    expect(challengeDefinitionIdForStation('ST01')).toBe(ST01_CHALLENGE_DEFINITION_ID);
    for (const seed of P10_BATCH_A_DEPTH) {
      expect(challengeDefinitionIdForStation(seed.stationId)).toBe(seed.definitionId);
    }
    for (const seed of P10_BATCH_B_DEPTH) {
      expect(challengeDefinitionIdForStation(seed.stationId)).toBe(seed.definitionId);
    }
    for (const seed of P10_BATCH_C_DEPTH) {
      expect(challengeDefinitionIdForStation(seed.stationId)).toBe(seed.definitionId);
    }
    for (const seed of P10_BATCH_D_DEPTH) {
      expect(challengeDefinitionIdForStation(seed.stationId)).toBe(seed.definitionId);
    }
    for (const seed of P10_BATCH_E_DEPTH) {
      expect(challengeDefinitionIdForStation(seed.stationId)).toBe(seed.definitionId);
    }
  });

  it('normalizes G1-ST0N and uuid-like suffixes', () => {
    expect(normalizeStationCode('g1-st03')).toBe('ST03');
    expect(normalizeStationCode('21000000-0000-4000-8000-000000000007')).toBe('ST07');
    expect(normalizeStationCode('nope')).toBeNull();
  });

  it('hasStationChallenge is true for all mapped stations', () => {
    for (let n = 1; n <= 25; n += 1) {
      const code = `ST${String(n).padStart(2, '0')}`;
      expect(hasStationChallenge(code)).toBe(true);
    }
    expect(hasStationChallenge('ST99')).toBe(false);
  });
});
