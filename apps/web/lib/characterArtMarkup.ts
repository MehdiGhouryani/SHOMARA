import { CAST_IDS, CHARACTER_SVGS, INSTANCE_UID_TOKEN, type CastId, type CastState } from './characterArt.generated';

/** Pure helpers behind <CharacterArt/>. Kept React-free so they can be unit tested. */
export function toCastId(id: string | undefined): CastId {
  return (CAST_IDS as readonly string[]).includes(id ?? '') ? (id as CastId) : 'aria';
}

/** React useId() returns ":r1:" / "«r1»"; ids must be plain tokens to be referenced from url(#...). */
export function safeInstanceKey(raw: string): string {
  const k = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return `sh${k || '0'}`;
}

/** Inline SVG for one instance: gradient ids are prefixed with the instance key, so N characters can share one DOM. */
export function characterMarkup(id: string | undefined, state: CastState, bust: boolean, instanceKey: string): string {
  const svg = CHARACTER_SVGS[toCastId(id)][bust ? 'bust' : state];
  return svg.split(INSTANCE_UID_TOKEN).join(safeInstanceKey(instanceKey));
}

export interface CharacterArtAttrs {
  cid: CastId;
  dataState: CastState;
  dataStatic: 'true' | 'false';
  dataReduced: 'true' | 'false';
  width: number;
  height: number;
  remountKey: string;
}

export function characterArtAttrs(o: { id: string; state?: CastState; size?: number; bust?: boolean; staticIdle?: boolean; reducedMotion?: boolean | undefined; osReduced?: boolean }): CharacterArtAttrs {
  const cid = toCastId(o.id);
  const bust = o.bust ?? false;
  const state = o.state ?? 'idle';
  const size = o.size ?? 120;
  return {
    cid,
    dataState: bust ? 'idle' : state,
    dataStatic: o.staticIdle ? 'true' : 'false',
    dataReduced: (o.reducedMotion ?? o.osReduced ?? false) ? 'true' : 'false',
    width: size,
    height: bust ? size : Math.round((size * 256) / 224),
    remountKey: `${cid}-${bust ? 'bust' : state}`,
  };
}
