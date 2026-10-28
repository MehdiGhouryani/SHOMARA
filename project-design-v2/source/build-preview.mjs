import { renderCharacter, CAST, STATES, NAMES_FA, STATE_FA, INSTANCE_UID_TOKEN as T } from './shomara-cast.mjs';
import fs from 'node:fs';
const css = fs.readFileSync(new URL('./motion.css', import.meta.url), 'utf8');
const data = {};
for (const id of CAST) { data[id] = {}; for (const s of STATES) data[id][s] = renderCharacter(id, s, { uid: T, inline: true }); data[id].bust = renderCharacter(id, 'idle', { bust: true, uid: T, inline: true }); }
const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>شمارا · cast v2</title>
<style>
:root{--bg:#F3F8F6;--ink:#23373D;--muted:#5B6E73;--teal:#218B92;--line:#DCE8E4}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Vazirmatn,Tahoma,system-ui,sans-serif}
header{padding:28px 24px 8px;max-width:1180px;margin:auto}h1{margin:0;font-size:28px}header p{margin:6px 0 0;color:var(--muted)}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:1180px;margin:16px auto;padding:0 24px}
.bar button{font:inherit;border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer;color:var(--ink)}
.bar button[aria-pressed=true]{background:var(--teal);border-color:var(--teal);color:#fff}
.bar label{display:flex;gap:6px;align-items:center;margin-inline-start:12px;color:var(--muted);font-size:14px}
.stage{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1180px;margin:0 auto;padding:0 24px}
.card{background:#fff;border-radius:24px;padding:16px 12px 14px;text-align:center;box-shadow:0 1px 0 var(--line)}
.card h2{margin:6px 0 2px;font-size:20px}.card small{color:var(--muted)}
.card .sh-char{width:100%;max-width:220px;aspect-ratio:224/256;height:auto}
h3{max-width:1180px;margin:28px auto 10px;padding:0 24px;font-size:18px}
.grid{max-width:1180px;margin:0 auto 40px;padding:0 24px;display:grid;grid-template-columns:120px repeat(7,1fr);gap:8px;align-items:center}
.grid .h{font-size:13px;color:var(--muted);text-align:center}.grid .n{font-weight:700}
.cell{background:#fff;border-radius:16px;padding:6px;cursor:pointer}.cell .sh-char{width:100%;height:auto;aspect-ratio:224/256}.cell.b .sh-char{aspect-ratio:1}
@media(max-width:820px){.stage{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:70px repeat(7,1fr);gap:4px}}
${css}
</style></head><body>
<header><h1>شمارا · شخصیت‌های نسخهٔ ۲</h1><p>چهار راهنما، شش حالت، با انیمیشن واقعی لایه‌ها. روی هر خانهٔ جدول بزن تا آن حالت پخش شود.</p></header>
<div class="bar" id="bar">${STATES.map((s, i) => `<button data-s="${s}" aria-pressed="${i === 0}">${STATE_FA[s]}</button>`).join('')}
<label><input type="checkbox" id="lesson"> حالت درس (بدون حلقه)</label><label><input type="checkbox" id="reduced"> حرکت کمتر</label></div>
<section class="stage" id="stage">${CAST.map((id) => `<div class="card"><div class="sh-char" data-character="${id}" data-state="idle"></div><h2>${NAMES_FA[id]}</h2><small>${{ aria: 'بچه‌اژدها · راهنمای اصلی', qbo: 'ربات مکعبی · ساختن و شمردن', dana: 'سنجاب · الگو و شکل', jiko: 'پرندهٔ آوازخوان · جشن' }[id]}</small></div>`).join('')}</section>
<h3>همهٔ حالت‌ها</h3>
<div class="grid" id="grid"><div></div>${STATES.map((s) => `<div class="h">${STATE_FA[s]}</div>`).join('')}<div class="h">نیم‌تنه</div>
${CAST.map((id) => `<div class="n">${NAMES_FA[id]}</div>${STATES.map((s) => `<div class="cell" data-id="${id}" data-s="${s}"><div class="sh-char" data-character="${id}" data-state="${s}" data-static="true"></div></div>`).join('')}<div class="cell b"><div class="sh-char" data-character="${id}" data-state="idle" data-static="true"></div></div>`).join('')}</div>
<script>
const SVG=${JSON.stringify(data)};
let N=0;const fill=(el,id,s,b)=>{el.innerHTML=SVG[id][b?'bust':s].split(${JSON.stringify(T)}).join('i'+(++N))};
document.querySelectorAll('#grid .cell').forEach(c=>{const el=c.firstElementChild;fill(el,el.dataset.character,el.dataset.state,c.classList.contains('b'));c.onclick=()=>{if(c.classList.contains('b'))return;const n=el.cloneNode(false);n.dataset.static='false';fill(n,el.dataset.character,el.dataset.state);c.replaceChild(n,c.firstElementChild);setTimeout(()=>{n.dataset.static='true'},2600)}});
let cur='idle';const play=()=>{document.querySelectorAll('#stage .sh-char').forEach(o=>{const n=o.cloneNode(false);n.dataset.state=cur;n.dataset.static=lesson.checked?'true':'false';n.dataset.reduced=reduced.checked?'true':'false';fill(n,n.dataset.character,cur);o.replaceWith(n)})};
document.querySelectorAll('#bar button').forEach(b=>b.onclick=()=>{cur=b.dataset.s;document.querySelectorAll('#bar button').forEach(x=>x.setAttribute('aria-pressed',x===b));play()});
lesson.onchange=play;reduced.onchange=play;play();
</script></body></html>`;
const out = process.argv[2] || new URL('../preview/index.html', import.meta.url);
fs.writeFileSync(out, html); console.log('preview', html.length);
