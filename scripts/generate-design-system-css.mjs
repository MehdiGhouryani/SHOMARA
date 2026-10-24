import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'packages/design-system/src/tokens.json');
const out = path.join(root, 'apps/web/app/design-tokens.generated.css');
const tokens = JSON.parse(fs.readFileSync(source, 'utf8'));

const lines = [
  '/* GENERATED FILE — DO NOT EDIT DIRECTLY.',
  ' * Source of truth: packages/design-system/src/tokens.json',
  ' * Regenerate with: npm run design-system:generate',
  ' */',
  ':root {'
];

const flatten = (obj, prefix = []) => {
  const rows = [];
  for (const [key, value] of Object.entries(obj)) {
    const next = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) rows.push(...flatten(value, next));
    else rows.push([next, value]);
  }
  return rows;
};

for (const [segments, value] of flatten(tokens.color)) lines.push(`  --ds-${segments.join('-')}: ${value};`);
for (const [segments, value] of flatten(tokens.space)) lines.push(`  --ds-space-${segments.join('-')}: ${value}px;`);
for (const [segments, value] of flatten(tokens.radius)) lines.push(`  --ds-radius-${segments.join('-')}: ${value}px;`);
for (const [segments, value] of flatten(tokens.size)) lines.push(`  --ds-size-${segments.join('-')}: ${value}px;`);
for (const [segments, value] of flatten(tokens.type)) {
  if (segments.at(-1) === 'fontSize') lines.push(`  --ds-type-${segments.slice(0, -1).join('-')}-size: ${value}px;`);
  else if (segments.at(-1) === 'lineHeight') lines.push(`  --ds-type-${segments.slice(0, -1).join('-')}-line: ${value}px;`);
  else if (segments.at(-1) === 'weight') lines.push(`  --ds-type-${segments.slice(0, -1).join('-')}-weight: ${value};`);
}
for (const [segments, value] of flatten(tokens.shadow)) lines.push(`  --ds-shadow-${segments.join('-')}: ${value};`);
for (const [segments, value] of flatten(tokens.motion)) lines.push(`  --ds-motion-${segments.join('-')}: ${value};`);

lines.push(`  --ds-font-family: ${tokens.font.family}, ${tokens.font.fallback};`);
lines.push('}');
lines.push('');
lines.push('[data-motion="reduced"], [data-motion="reduced"] * {');
lines.push('  animation-duration: 0.01ms !important;');
lines.push('  animation-iteration-count: 1 !important;');
lines.push('  transition-duration: 0.01ms !important;');
lines.push('  scroll-behavior: auto !important;');
lines.push('}');
lines.push('');
lines.push('@media (prefers-reduced-motion: reduce) {');
lines.push('  *, *::before, *::after {');
lines.push('    animation-duration: 0.01ms !important;');
lines.push('    animation-iteration-count: 1 !important;');
lines.push('    transition-duration: 0.01ms !important;');
lines.push('    scroll-behavior: auto !important;');
lines.push('  }');
lines.push('}');

fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`Generated ${path.relative(root, out)}`);
