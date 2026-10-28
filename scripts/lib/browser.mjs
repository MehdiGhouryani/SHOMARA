// Launch Chromium for the parity tools. Normal Playwright launch first; if the pinned browser revision is
// not installed (offline CI/sandboxes), fall back to $PARITY_CHROMIUM_PATH or any chromium under a
// playwright browsers directory.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

function findInstalledChromium() {
  if (process.env.PARITY_CHROMIUM_PATH && fs.existsSync(process.env.PARITY_CHROMIUM_PATH)) return process.env.PARITY_CHROMIUM_PATH;
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    '/opt/pw-browsers',
    path.join(process.env.HOME ?? '', '.cache/ms-playwright'),
    process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright') : null,
  ].filter(Boolean);
  // chromium-<rev>/chrome-linux/chrome on POSIX, chromium-<rev>/chrome-win64|chrome-win/chrome.exe on Windows.
  const subdirs = process.platform === 'win32' ? ['chrome-win64', 'chrome-win'] : ['chrome-linux'];
  const exeName = process.platform === 'win32' ? 'chrome.exe' : 'chrome';
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      for (const sub of subdirs) {
        const exe = path.join(root, d, sub, exeName);
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  // Last resort: a branded Chrome/Edge install. Playwright can drive it via executablePath.
  if (process.platform === 'win32') {
    const candidates = [
      process.env.PARITY_CHROMIUM_PATH,
      path.join(process.env.ProgramFiles ?? '', 'Google/Chrome/Application/chrome.exe'),
      path.join(process.env['ProgramFiles(x86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
      path.join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
      path.join(process.env.ProgramFiles ?? '', 'Microsoft/Edge/Application/msedge.exe'),
    ].filter(Boolean);
    for (const exe of candidates) if (fs.existsSync(exe)) return exe;
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
