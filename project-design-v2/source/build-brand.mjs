import { renderCharacter } from './shomara-cast.mjs';
import fs from 'node:fs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const inner = renderCharacter('aria', 'idle', { uid: 'icon', title: false, headOnly: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
// face-forward crop of the full drawing (head + horns), no text, mint-teal ground
const face = (x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="42 14 140 140">${inner}</svg>`;
const bg = `<defs><radialGradient id="ibg" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#E9F7F2"/><stop offset="1" stop-color="#BFE6DE"/></radialGradient></defs>`;
fs.writeFileSync(`${out}/launcher-master.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="شمارا">${bg}<rect width="1024" height="1024" rx="0" fill="url(#ibg)"/>${face(92, 112, 840)}</svg>`);
fs.writeFileSync(`${out}/adaptive-background.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${bg}<rect width="1024" height="1024" fill="url(#ibg)"/></svg>`);
// Android safe zone: keep art inside the central 66%
fs.writeFileSync(`${out}/adaptive-foreground.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${face(212, 212, 600)}</svg>`);
fs.writeFileSync(`${out}/splash.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${face(162, 150, 700)}</svg>`);
console.log('brand ok');
