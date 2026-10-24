import { TOKENS } from '@math/design-system';

export type ChapterTheme = (typeof TOKENS.ui.chapter)[number];

/** Five colour themes (t1 to t5) from the approved path page; chapter n uses theme n, repeating after five. */
export function chapterTheme(index: number): ChapterTheme {
  const themes = TOKENS.ui.chapter;
  return themes[((index % themes.length) + themes.length) % themes.length] as ChapterTheme;
}
