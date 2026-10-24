// Launch Chromium for the parity tools. Normal Playwright launch first; if the pinned browser revision is
// not installed (offline CI/sandboxes), fall back to $PARITY_CHROMIUM_PATH or any chromium under a
// playwright browsers directory.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

function findInstalledChromium() {
  if (process.env.PARITY_CHROMIUM_PATH && fs.existsSync(process.env.PARITY_CHROMIUM_PATH)) return process.env.PARITY_CHROMIUM_PATH;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', path.join(process.env.HOME ?? '', '.cache/ms-playwright')].filter(Boolean);
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      const exe = path.join(root, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

export async function launchChromium() {
  try {
    return await chromium.launch();
  } catch (error) {
    const exe = findInstalledChromium();
    if (!exe) throw error;
    return chromium.launch({ executablePath: exe });
  }
}
