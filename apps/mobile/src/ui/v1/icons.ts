/**
 * Icon geometry copied verbatim from the approved pages (docs/design-handoff-2026-10/pages-v1).
 * All icons: 24x24 viewBox, no fill, rounded 2.5 stroke (applied by <Icon/>).
 * Names describe the shape; the pages use them for the roles noted in comments.
 */
export type IconNode =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; width: number; height: number; rx: number };

export const ICONS = {
  chevronBack: [
    { t: 'path', d: 'M9 5l7 7-7 7' },
  ],
  lock: [
    { t: 'rect', x: 5, y: 11, width: 14, height: 9, rx: 2.5 },
    { t: 'path', d: 'M8 11V8a4 4 0 018 0v3' },
  ],
  message: [
    { t: 'rect', x: 4, y: 5, width: 16, height: 12, rx: 3 },
    { t: 'path', d: 'M8 9.5h8M8 13h5M9 21l3-4 3 4' },
  ],
  sun: [
    { t: 'circle', cx: 12, cy: 12, r: 4 },
    { t: 'path', d: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4' },
  ],
  leaf: [
    { t: 'path', d: 'M5 19c0-8 4-13 14-14 0 10-5 14-13 14M5 19l7-7' },
  ],
  cloud: [
    { t: 'path', d: 'M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.7 1A3.5 3.5 0 0117 18H7z' },
  ],
  moon: [
    { t: 'path', d: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z' },
  ],
  close: [
    { t: 'path', d: 'M6 6l12 12M18 6L6 18' },
  ],
  book: [
    { t: 'path', d: 'M12 6.5C10.3 5.2 8 4.8 4.5 5v12c3.5-.2 5.8.2 7.5 1.5 1.7-1.3 4-1.7 7.5-1.5V5C16 4.8 13.7 5.2 12 6.5zM12 6.5v12' },
  ],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 8.5 },
    { t: 'path', d: 'M12 7.5V12l3 2' },
  ],
  speaker: [
    { t: 'path', d: 'M4 10v4h4l5 4V6L8 10H4zM16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11' },
  ],
  check: [
    { t: 'path', d: 'M5 12.5l4.5 4.5L19 7' },
  ],
  retry: [
    { t: 'path', d: 'M4 12a8 8 0 108-8M4 4v5h5' },
  ],
  medal: [
    { t: 'circle', cx: 12, cy: 9, r: 5 },
    { t: 'path', d: 'M9 13.5L7.5 21l4.5-2.5 4.5 2.5-1.5-7.5' },
  ],
  trophy: [
    { t: 'path', d: 'M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M12 13v4M8.5 20h7M10 17h4' },
  ],
  bolt: [
    { t: 'path', d: 'M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z' },
  ],
  route: [
    { t: 'circle', cx: 6, cy: 18, r: 2.5 },
    { t: 'circle', cx: 18, cy: 6, r: 2.5 },
    { t: 'path', d: 'M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5' },
  ],
  person: [
    { t: 'circle', cx: 12, cy: 8, r: 4 },
    { t: 'path', d: 'M4.5 20c.8-3.6 3.7-5.5 7.5-5.5s6.7 1.9 7.5 5.5' },
  ],
  settings: [
    { t: 'circle', cx: 12, cy: 12, r: 3 },
    { t: 'path', d: 'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1' },
  ],
  plus: [
    { t: 'path', d: 'M12 5v14M5 12h14' },
  ],
  guide: [
    { t: 'path', d: 'M6 3.5h11a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5H6zM6 3.5v17M9.5 8h5M9.5 12h5' },
  ],
  arrowUp: [
    { t: 'path', d: 'M12 19V5M5.5 11.5L12 5l6.5 6.5' },
  ],
  chest: [
    { t: 'path', d: 'M4 11h16v8.5a1 1 0 01-1 1H5a1 1 0 01-1-1zM3.5 6.5h17V11h-17zM12 6.5v14M10 14.5h4' },
  ],
  // Not in the approved pages: shown on a path node whose lesson content is not on the device yet.
  download: [
    { t: 'path', d: 'M12 4v10M7.5 10l4.5 4.5 4.5-4.5M5 19h14' },
  ],
} as const satisfies Record<string, readonly IconNode[]>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
