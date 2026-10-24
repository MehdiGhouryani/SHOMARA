import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'packages/design-system/package.json',
  'packages/design-system/src/tokens.json',
  'packages/design-system/src/index.ts',
  'packages/design-system/tsconfig.json',
  'apps/web/app/design-tokens.generated.css',
  'apps/web/components/ui/UiButton.tsx',
  'apps/web/components/ui/UiSurface.tsx',
  'apps/web/components/ui/UiBadge.tsx',
  'apps/web/components/ui/UiProgress.tsx',
  'apps/mobile/src/ui/design-system/theme.ts',
  'apps/mobile/src/ui/design-system/components.tsx',
];

const failures = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing:${file}`);

const tokens = JSON.parse(fs.readFileSync(path.join(root, 'packages/design-system/src/tokens.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'apps/web/app/design-tokens.generated.css'), 'utf8');
const webCss = fs.readFileSync(path.join(root, 'apps/web/app/globals.css'), 'utf8');
const mobileTabs = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8');

const checks = {
  canonicalPrimary: tokens.color.brand.primary === '#2B5C7A' /* ADR-0035 */,
  canonicalCanvas: tokens.color.bg.canvas === '#F5F7F8' /* ADR-0035 */,
  rtlFont: tokens.font.family === 'Vazirmatn',
  focusToken: css.includes('--ds-focus:'),
  reducedMotion: css.includes('@media (prefers-reduced-motion: reduce)'),
  globalCanvasUsesToken: webCss.includes('background-color: var(--ds-bg-canvas);'),
  webUiPrimitives: ['UiButton', 'UiSurface', 'UiBadge', 'UiProgress'].every((x) => fs.existsSync(path.join(root, `apps/web/components/ui/${x}.tsx`))),
  nativePrimitives: ['DSButton', 'DSSurface', 'DSBadge', 'DSProgress'].every((x) => fs.readFileSync(path.join(root, 'apps/mobile/src/ui/design-system/components.tsx'), 'utf8').includes(`function ${x}`)),
  // Stage U3: the tab bar is the v1 TabBar; its colors come from the token names C.primary / C.ink2 (no literals).
  mobileNavigationUsesTokens: (() => { const bar = fs.readFileSync(path.join(root, 'apps/mobile/src/ui/v1/TabBar.tsx'), 'utf8'); return bar.includes('C.primary') && bar.includes('C.ink2') && !/#[0-9A-Fa-f]{3,8}\b/.test(bar) && mobileTabs.includes('ChildTabBar'); })(),
  noEmojiInPrimaryWebNav: !fs.readFileSync(path.join(root, 'apps/web/components/ChildBottomNav.tsx'), 'utf8').match(/[\u{1F300}-\u{1FAFF}]/u),
};

for (const [key, ok] of Object.entries(checks)) if (!ok) failures.push(`check:${key}`);

const result = { phase: 'UX-P03', generatedAt: new Date().toISOString(), status: failures.length ? 'FAIL' : 'PASS', checks, failures };
if (failures.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
