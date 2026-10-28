import type { InteractionFeedbackEvent } from '@math/contracts';

export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }

/**
 * Placement result only — never an answer verdict. `REJECTED` is returned only when
 * the caller says this target cannot accept the token (e.g. full slot); answer
 * correctness stays with the authoritative learning runtime.
 */
export type DropResult = 'ACCEPTED' | 'REJECTED' | 'NEAR_MISS' | 'OUTSIDE';

export interface DropOptions {
  /** Forgiving radius around the target centre that still counts as a hit. */
  acceptanceRadius?: number;
  /** Extra distance beyond the target edge that counts as "almost" (near miss). */
  nearMissMargin?: number;
  canAccept?: boolean;
}

export function pointInsideRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function centerOf(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function expandRect(rect: Rect, margin: number): Rect {
  return { x: rect.x - margin, y: rect.y - margin, width: rect.width + margin * 2, height: rect.height + margin * 2 };
}

export function evaluateDrop(point: Point, target: Rect, acceptanceRadius = 0, canAccept = true, nearMissMargin = 0): DropResult {
  const inside = pointInsideRect(point, target);
  const withinForgivingRadius = acceptanceRadius > 0 && distance(point, centerOf(target)) <= acceptanceRadius;
  if (inside || withinForgivingRadius) return canAccept ? 'ACCEPTED' : 'REJECTED';
  if (nearMissMargin > 0 && pointInsideRect(point, expandRect(target, nearMissMargin))) return 'NEAR_MISS';
  return 'OUTSIDE';
}

export function evaluateDropWith(point: Point, target: Rect, options: DropOptions = {}): DropResult {
  return evaluateDrop(point, target, options.acceptanceRadius ?? 0, options.canAccept ?? true, options.nearMissMargin ?? 0);
}

/** Default forgiveness for small hands: radius ≈18% of the short side, near-miss band ≈35%. */
export function defaultDropOptions(target: Rect): Required<Pick<DropOptions, 'acceptanceRadius' | 'nearMissMargin'>> {
  const shortSide = Math.min(target.width, target.height);
  return { acceptanceRadius: shortSide * 0.18, nearMissMargin: shortSide * 0.35 };
}

export const DROP_FEEDBACK_EVENT: Readonly<Record<DropResult, InteractionFeedbackEvent>> = {
  ACCEPTED: 'DROP_ACCEPTED',
  REJECTED: 'DROP_REJECTED',
  NEAR_MISS: 'DROP_NEAR_MISS',
  OUTSIDE: 'DROP_OUTSIDE',
};

export function feedbackEventForDrop(result: DropResult): InteractionFeedbackEvent {
  return DROP_FEEDBACK_EVENT[result];
}
