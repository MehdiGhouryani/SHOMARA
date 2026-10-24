// Shomara cast v2 — single source of truth for guide character art.
// Layered, semantically named SVG (Rive-import ready). Pure functions, no deps.
// ids: aria (baby dragon), qbo (counting-cube robot), dana (squirrel), jiko (songbird)

export const STATES = ['idle', 'think', 'encourage', 'correct', 'celebrate', 'recovery'];
export const CAST = ['aria', 'qbo', 'dana', 'jiko'];
export const VIEWBOX = '0 0 224 256';

export const PALETTE = {
  ink: '#1E2F35', white: '#FFFFFF', cheek: '#FF7E9C', shadow: '#15464B',
  aria: { light: '#5CC9CB', mid: '#239AA0', dark: '#16707A', deep: '#0F5059', belly: '#F6B93B', bellyLight: '#FFD877', bellyDark: '#D9921B', horn: '#F6E4B6', hornDark: '#D8BB7E', iris: '#0E5961' },
  qbo: { saffron: ['#FFCB4D', '#F2AE1C', '#C9850C'], teal: ['#4CC3BA', '#239A92', '#16706A'], plum: ['#C0588A', '#9A3B69', '#6F2449'], screen: '#16232E', screenEdge: '#0C151C', glow: '#5DF2E2', antenna: '#F5B922' },
  dana: { light: '#E89557', mid: '#CB6B2E', dark: '#98461B', cream: '#F7E1BC', creamDark: '#E5C38F', plum: '#8F3963', plumDark: '#6C2549', bag: '#3F7F5B', bagDark: '#2C5E42', gold: '#E3A93A', lens: '#CFEFF4', iris: '#2D6E6A', nose: '#3B2117' },
  jiko: { light: '#FF9C6E', mid: '#F26A3E', dark: '#CF4A26', belly: '#FFC93C', bellyLight: '#FFE07E', beak: '#F7931E', beakDark: '#D8730A', leg: '#E88A1A', iris: '#3A2414' },
};

const f = (n) => Math.round(n * 10) / 10;

// ---------- shared face parts ----------
function eye(id, cx, cy, mode, o = {}) {
  const rx = o.rx ?? 15, ry = o.ry ?? 17, ir = o.ir ?? 11, iris = o.iris ?? PALETTE.ink, lid = o.lid ?? '#000';
  const pivot = `style="transform-origin:${cx}px ${cy}px"`;
  if (mode === 'happy') {
    return `<g id="${id}" class="eye" ${pivot}><path d="M${cx - rx + 2} ${cy + 4} Q${cx} ${cy - ry + 2} ${cx + rx - 2} ${cy + 4}" fill="none" stroke="${PALETTE.ink}" stroke-width="5" stroke-linecap="round"/></g>`;
  }
  let dx = 1.5, dy = 1.5;
  if (mode === 'up') { dx = -2; dy = -6; }
  if (mode === 'side') { dx = 5; dy = 1; }
  if (mode === 'down') { dx = 0; dy = 4; }
  const ix = cx + dx, iy = cy + dy;
  let s = `<g id="${id}" class="eye" ${pivot}>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF"/>`;
  s += `<circle cx="${ix}" cy="${iy}" r="${ir}" fill="${iris}"/>`;
  s += `<circle cx="${ix}" cy="${iy + 0.5}" r="${f(ir * 0.62)}" fill="#10181C"/>`;
  s += `<circle cx="${f(ix - ir * 0.38)}" cy="${f(iy - ir * 0.42)}" r="${f(ir * 0.36)}" fill="#FFFFFF"/>`;
  s += `<circle cx="${f(ix + ir * 0.42)}" cy="${f(iy + ir * 0.38)}" r="${f(ir * 0.16)}" fill="#FFFFFF" opacity=".9"/>`;
  if (mode === 'soft') s += `<path d="M${cx - rx - 1} ${cy - 3} Q${cx} ${cy - ry - 6} ${cx + rx + 1} ${cy - 3} L${cx + rx + 1} ${cy - ry - 3} L${cx - rx - 1} ${cy - ry - 3} Z" fill="${lid}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${PALETTE.ink}" stroke-opacity=".18" stroke-width="1.5"/>`;
  return s + '</g>';
}

function mouth(kind, cx, cy, w = 22) {
  const h = w / 2;
  switch (kind) {
    case 'big': return `<g id="mouth"><path d="M${cx - h} ${cy} Q${cx} ${cy + w * 0.95} ${cx + h} ${cy} Q${cx} ${cy + 4} ${cx - h} ${cy} Z" fill="#7A2730"/><path d="M${cx - h * 0.5} ${cy + w * 0.42} Q${cx} ${cy + w * 0.2} ${cx + h * 0.55} ${cy + w * 0.42} Q${cx} ${cy + w * 0.62} ${cx - h * 0.5} ${cy + w * 0.42} Z" fill="#FF7A86"/></g>`;
    case 'open': return `<g id="mouth"><path d="M${cx - h * 0.8} ${cy} Q${cx} ${cy + w * 0.7} ${cx + h * 0.8} ${cy} Q${cx} ${cy + 3} ${cx - h * 0.8} ${cy} Z" fill="#7A2730"/><path d="M${cx - h * 0.35} ${cy + w * 0.3} Q${cx} ${cy + w * 0.14} ${cx + h * 0.4} ${cy + w * 0.3} Q${cx} ${cy + w * 0.46} ${cx - h * 0.35} ${cy + w * 0.3} Z" fill="#FF7A86"/></g>`;
    case 'o': return `<g id="mouth"><ellipse cx="${cx}" cy="${cy + 4}" rx="${h * 0.42}" ry="${h * 0.5}" fill="#7A2730"/></g>`;
    case 'small': return `<g id="mouth"><path d="M${cx - h * 0.55} ${cy + 1} Q${cx} ${cy + 7} ${cx + h * 0.55} ${cy + 1}" fill="none" stroke="${PALETTE.ink}" stroke-width="3.6" stroke-linecap="round"/></g>`;
    case 'side': return `<g id="mouth"><path d="M${cx - h * 0.6} ${cy + 2} Q${cx + 2} ${cy + 6} ${cx + h * 0.7} ${cy - 2}" fill="none" stroke="${PALETTE.ink}" stroke-width="3.6" stroke-linecap="round"/></g>`;
    default: return `<g id="mouth"><path d="M${cx - h * 0.8} ${cy} Q${cx} ${cy + w * 0.5} ${cx + h * 0.8} ${cy}" fill="none" stroke="${PALETTE.ink}" stroke-width="3.8" stroke-linecap="round"/></g>`;
  }
}

const cheeks = (lx, rx, y, r = 9) => `<g id="cheeks" opacity=".72"><ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="${PALETTE.cheek}"/><ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="${PALETTE.cheek}"/></g>`;

const brows = (lx, rx, y, mode, color = PALETTE.ink) => {
  const lift = mode === 'up' ? -4 : mode === 'worried' ? 0 : 0;
  const tiltL = mode === 'worried' ? 3 : mode === 'think' ? -3 : 0;
  const tiltR = mode === 'worried' ? 3 : mode === 'think' ? 2 : 0;
  return `<g id="brows" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" opacity=".75"><path d="M${lx - 8} ${y + lift + tiltL} Q${lx} ${y + lift - 4} ${lx + 8} ${y + lift - tiltL}"/><path d="M${rx - 8} ${y + lift - tiltR} Q${rx} ${y + lift - 4} ${rx + 8} ${y + lift + tiltR}"/></g>`;
};

function sparkle(x, y, s = 1, c = '#FFC83D') {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -9 C1.5 -2 2 -1.5 9 0 C2 1.5 1.5 2 0 9 C-1.5 2 -2 1.5 -9 0 C-2 -1.5 -1.5 -2 0 -9 Z" fill="${c}"/>`;
}
const note = (x, y, c, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="${c}"><ellipse cx="0" cy="10" rx="5.5" ry="4.2" transform="rotate(-20 0 10)"/><rect x="3.6" y="-8" width="2.6" height="18" rx="1.2"/><path d="M6 -8 Q14 -5 12 3 Q11 -2 6 -2 Z"/></g>`;
const confetti = (pts) => `<g id="confetti">${pts.map(([x, y, c, r]) => `<rect x="${x}" y="${y}" width="7" height="4" rx="1.5" fill="${c}" transform="rotate(${r} ${x + 3} ${y + 2})"/>`).join('')}</g>`;

function defsFor(uid, stops) {
  return stops.map(([name, light, mid, dark]) =>
    `<radialGradient id="${uid}-${name}" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`).join('');
}
const shadow = (cx = 112, rx = 64) => `<ellipse id="contact-shadow" cx="${cx}" cy="241" rx="${rx}" ry="8" fill="${PALETTE.shadow}" opacity=".12"/>`;

// limb helper: capsule from shoulder, rotated around shoulder
function limb(id, sx, sy, len, w, angle, fill, hand) {
  return `<g id="${id}" class="limb" style="transform-origin:${sx}px ${sy}px"><g transform="rotate(${angle} ${sx} ${sy})"><rect x="${sx - w / 2}" y="${sy - w / 2}" width="${w}" height="${len}" rx="${w / 2}" fill="${fill}"/>${hand ? `<circle cx="${sx}" cy="${sy + len - w / 2}" r="${w * 0.62}" fill="${hand}"/>` : ''}</g></g>`;
}

// ---------- ARIA: baby dragon ----------
function aria(state, uid, opt = {}) {
  const P = PALETTE.aria;
  const pose = {
    idle: { eyes: 'open', mouth: 'open', brows: 'n', armL: 18, armR: -118, head: 0, fx: '' },
    think: { eyes: 'up', mouth: 'side', brows: 'think', armL: 18, armR: 150, head: -6, fx: '' },
    encourage: { eyes: 'open', mouth: 'open', brows: 'up', armL: 18, armR: -88, head: 4, fx: '' },
    correct: { eyes: 'happy', mouth: 'smile', brows: 'n', armL: 46, armR: -46, head: 5, fx: 'pop' },
    celebrate: { eyes: 'open', mouth: 'big', brows: 'up', armL: 112, armR: -112, head: 0, fx: 'spark' },
    recovery: { eyes: 'soft', mouth: 'small', brows: 'worried', armL: 18, armR: 50, head: -3, fx: '' },
  }[state];
  const body = `url(#${uid}-body)`, belly = `url(#${uid}-belly)`;
  let s = `<defs>${defsFor(uid, [['body', P.light, P.mid, P.dark], ['belly', P.bellyLight, P.belly, P.bellyDark], ['horn', '#FFF6DC', P.horn, P.hornDark], ['wing', '#58C2C4', '#2A9DA2', P.deep]])}</defs>`;
  if (!opt.headOnly) s += shadow(112, 66);
  // BACK plane: tail + wings
  const bodyStart = s.length;
  s += `<g id="back">`;
  s += `<g id="tail" style="transform-origin:150px 212px"><path d="M138 200 C168 222 206 222 208 190 C209 172 193 164 184 174 C178 181 186 189 192 186 C194 196 184 204 168 203 C156 202 147 196 142 190 Z" fill="${body}"/>`;
  s += `<path d="M171 198 l4 -11 l7 9 Z M188 188 l9 -6 l1 11 Z" fill="${P.deep}" opacity=".85"/></g>`;
  const wing = (side) => {
    const m = side === 'l' ? 1 : -1, ox = side === 'l' ? 0 : 224;
    const tx = (x) => (side === 'l' ? x : ox - x);
    const px = tx(76), py = 150;
    return `<g id="wing-${side}" class="wing" style="transform-origin:${px}px ${py}px"><path d="M${tx(78)} 146 C${tx(60)} 120 ${tx(34)} 116 ${tx(24)} 126 C${tx(32)} 132 ${tx(33)} 140 ${tx(30)} 148 C${tx(39)} 147 ${tx(45)} 152 ${tx(45)} 160 C${tx(53)} 156 ${tx(62)} 160 ${tx(66)} 168 Z" fill="url(#${uid}-wing)"/><path d="M${tx(76)} 148 L${tx(30)} 128 M${tx(74)} 152 L${tx(40)} 150 M${tx(72)} 157 L${tx(54)} 160" stroke="${P.deep}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></g>`;
  };
  s += wing('l') + wing('r') + `</g>`;
  // BODY plane
  s += `<g id="body-group" style="transform-origin:112px 236px">`;
  s += `<g id="legs"><ellipse cx="88" cy="228" rx="19" ry="12" fill="${P.dark}"/><ellipse cx="136" cy="228" rx="19" ry="12" fill="${P.dark}"/><g fill="${P.light}" opacity=".9"><circle cx="79" cy="234" r="3.2"/><circle cx="88" cy="236" r="3.2"/><circle cx="97" cy="234" r="3.2"/><circle cx="127" cy="234" r="3.2"/><circle cx="136" cy="236" r="3.2"/><circle cx="145" cy="234" r="3.2"/></g></g>`;
  s += `<path id="torso" d="M112 126 C150 126 164 168 160 198 C157 224 138 234 112 234 C86 234 67 224 64 198 C60 168 74 126 112 126 Z" fill="${body}"/>`;
  s += `<path id="belly" d="M112 146 C134 146 143 176 141 200 C139 220 127 228 112 228 C97 228 85 220 83 200 C81 176 90 146 112 146 Z" fill="${belly}"/>`;
  s += `<g id="belly-plates" fill="none" stroke="${P.bellyDark}" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M92 168 Q112 174 132 168"/><path d="M87 184 Q112 191 137 184"/><path d="M86 200 Q112 207 138 200"/><path d="M90 215 Q112 221 134 215"/></g>`;
  s += `<g id="spots" fill="${P.dark}" opacity=".35"><circle cx="72" cy="200" r="4"/><circle cx="78" cy="212" r="2.6"/><circle cx="152" cy="204" r="3.4"/></g>`;
  s += limb('arm-l', 74, 160, 40, 18, pose.armL, P.dark, P.mid);
  s += limb('arm-r', 150, 160, 40, 18, pose.armR, P.dark, P.mid);
  s += `</g>`;
  if (opt.headOnly) s = s.slice(0, bodyStart);
  // HEAD
  s += `<g id="head" style="transform-origin:112px 132px"><g transform="rotate(${pose.head} 112 132)">`;
  s += `<g id="crest" fill="${P.dark}"><ellipse cx="96" cy="44" rx="8" ry="11" transform="rotate(-20 96 44)"/><ellipse cx="112" cy="38" rx="8" ry="12"/><ellipse cx="128" cy="44" rx="8" ry="11" transform="rotate(20 128 44)"/></g>`;
  s += `<g id="horns"><path d="M68 66 C62 48 66 32 76 24 C80 36 86 48 90 58 Z" fill="url(#${uid}-horn)"/><path d="M156 66 C162 48 158 32 148 24 C144 36 138 48 134 58 Z" fill="url(#${uid}-horn)"/><path d="M70 50 Q77 47 84 50 M151 50 Q144 47 137 50" stroke="${P.hornDark}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
  s += `<path id="skull" d="M112 40 C154 40 172 68 172 98 C172 128 148 146 112 146 C76 146 52 128 52 98 C52 68 70 40 112 40 Z" fill="${body}"/>`;
  s += `<ellipse id="head-highlight" cx="88" cy="62" rx="22" ry="10" fill="#FFFFFF" opacity=".13" transform="rotate(-18 88 62)"/>`;
  s += `<g id="face">`;
  s += `<ellipse id="snout" cx="112" cy="121" rx="27" ry="16" fill="${P.light}" opacity=".55"/>`;
  s += `<g id="nostrils" fill="${P.deep}"><ellipse cx="104" cy="115" rx="2.6" ry="2"/><ellipse cx="120" cy="115" rx="2.6" ry="2"/></g>`;
  s += cheeks(70, 154, 118, 10);
  s += eye('eye-l', 86, 96, pose.eyes, { rx: 16, ry: 18, ir: 12, iris: P.iris, lid: P.mid });
  s += eye('eye-r', 138, 96, pose.eyes, { rx: 16, ry: 18, ir: 12, iris: P.iris, lid: P.mid });
  s += brows(86, 138, 72, pose.brows, P.deep);
  s += mouth(pose.mouth, 112, 126, 24);
  s += `</g></g></g>`;
  if (pose.fx === 'pop') s += `<g id="fx" stroke="#F6B93B" stroke-width="4" stroke-linecap="round"><path d="M176 52 l8 -8 M162 38 l2 -11 M190 70 l11 -3"/></g>`;
  if (pose.fx === 'spark') s += `<g id="fx">${sparkle(36, 70, 1.1)}${sparkle(190, 60, 1.3)}${sparkle(196, 112, .8, '#FFE38A')}${sparkle(28, 120, .7, '#FFE38A')}</g>`;
  return s;
}

// ---------- QBO: robot built of counting cubes ----------
function cube(x, y, s, [light, mid, dark], id = '') {
  const d = s * 0.22;
  return `<g ${id ? `id="${id}"` : ''}><path d="M${x} ${y} l${d} ${-d} h${s} l${-d} ${d} Z" fill="${light}"/><path d="M${x + s} ${y} l${d} ${-d} v${s} l${-d} ${d} Z" fill="${dark}"/><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.16}" fill="${mid}"/><circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.2}" fill="${dark}"/><circle cx="${x + s / 2 - 1}" cy="${y + s / 2 - 1}" r="${s * 0.12}" fill="${dark}" opacity=".6"/><rect x="${x + 3}" y="${y + 3}" width="${s * 0.32}" height="${s * 0.12}" rx="2" fill="#FFFFFF" opacity=".28"/></g>`;
}
function qbo(state, uid) {
  const P = PALETTE.qbo, Y = P.saffron, T = P.teal, M = P.plum;
  const pose = {
    idle: { screen: 'eyes', armL: 15, armR: -15, float: [168, 128], fx: '' },
    think: { screen: 'loading', armL: 15, armR: -165, float: null, fx: '' },
    encourage: { screen: 'eyes', armL: 15, armR: -80, float: [184, 150], fx: '' },
    correct: { screen: 'happy', armL: 15, armR: -150, float: null, fx: 'pop' },
    celebrate: { screen: 'big', armL: 150, armR: -150, float: null, fx: 'tower' },
    recovery: { screen: 'soft', armL: 15, armR: -40, float: [176, 206], fx: '' },
  }[state];
  const S = 25;
  let s = shadow(112, 58);
  s += `<g id="body-group" style="transform-origin:112px 236px">`;
  // legs
  s += `<g id="legs">${cube(80, 186, S, M)}${cube(80, 211, S, Y)}${cube(118, 186, S, M)}${cube(118, 211, S, Y)}</g>`;
  // torso 2x2
  s += `<g id="torso">${cube(87, 136, S, Y)}${cube(112, 136, S, M)}${cube(87, 161, S, Y)}${cube(112, 161, S, T)}</g>`;
  // arms (cube chains)
  const arm = (id, sx, sy, ang, cols) => `<g id="${id}" class="limb" style="transform-origin:${sx}px ${sy}px"><g transform="rotate(${ang} ${sx} ${sy})">${cube(sx - 10, sy - 4, 20, cols[0])}${cube(sx - 10, sy + 16, 20, cols[1])}${cube(sx - 10, sy + 36, 20, cols[2])}</g></g>`;
  s += arm('arm-l', 76, 144, pose.armL, [Y, T, Y]);
  s += arm('arm-r', 148, 144, pose.armR, [Y, T, Y]);
  s += `</g>`;
  // head
  s += `<g id="head" style="transform-origin:112px 132px">`;
  s += `<g id="antenna" style="transform-origin:112px 50px"><rect x="109.5" y="28" width="5" height="22" rx="2.5" fill="#3A3F45"/><circle cx="112" cy="24" r="9" fill="${P.antenna}"/><circle cx="109" cy="21" r="3" fill="#FFFFFF" opacity=".55"/></g>`;
  s += `<path d="M58 60 l14 -12 h96 l-14 12 Z" fill="${Y[0]}"/><path d="M154 60 l14 -12 v76 l-14 12 Z" fill="${Y[2]}"/>`;
  s += `<rect id="skull" x="58" y="58" width="98" height="80" rx="16" fill="url(#${uid}-head)"/>`;
  s += `<g fill="${Y[2]}" opacity=".7"><circle cx="66" cy="66" r="2.4"/><circle cx="148" cy="66" r="2.4"/><circle cx="66" cy="130" r="2.4"/><circle cx="148" cy="130" r="2.4"/></g>`;
  s += `<rect id="screen" x="68" y="68" width="78" height="60" rx="14" fill="${P.screen}" stroke="${P.screenEdge}" stroke-width="3"/>`;
  s += `<rect x="74" y="72" width="30" height="6" rx="3" fill="#FFFFFF" opacity=".08"/>`;
  s += `<g id="face" fill="${P.glow}" stroke="${P.glow}">`;
  const glowEye = (cx, mode) => {
    const pv = `style="transform-origin:${cx}px 96px"`;
    if (mode === 'happy') return `<g class="eye" ${pv}><path d="M${cx - 9} 99 Q${cx} 86 ${cx + 9} 99" fill="none" stroke-width="5" stroke-linecap="round"/></g>`;
    if (mode === 'soft') return `<g class="eye" ${pv}><rect x="${cx - 8}" y="92" width="16" height="10" rx="5" stroke="none"/></g>`;
    return `<g class="eye" ${pv}><ellipse cx="${cx}" cy="96" rx="8.5" ry="11" stroke="none"/><circle cx="${cx - 3}" cy="91" r="3" fill="${P.screen}" stroke="none"/></g>`;
  };
  if (pose.screen === 'loading') {
    s += `<g id="loading" stroke="none">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${f(107 + Math.cos(a) * 15)}" cy="${f(98 + Math.sin(a) * 15)}" r="${f(2 + i * 0.28)}" opacity="${f(0.3 + i * 0.09)}"/>`; }).join('')}</g>`;
  } else {
    const em = pose.screen === 'happy' || pose.screen === 'big' ? 'happy' : pose.screen === 'soft' ? 'soft' : 'open';
    s += `<g id="eye-l">${glowEye(92, pose.screen === 'big' ? 'open' : em)}</g><g id="eye-r">${glowEye(122, pose.screen === 'big' ? 'open' : em)}</g>`;
    const mp = pose.screen === 'big' ? `<path id="mouth" d="M96 109 Q107 124 118 109 Z" stroke-width="2" stroke-linejoin="round"/>` : `<path id="mouth" d="M98 111 Q107 118 116 111" fill="none" stroke-width="3.6" stroke-linecap="round"/>`;
    s += mp;
  }
  s += `</g></g>`;
  if (pose.float) s += `<g id="float-cube" style="transform-origin:${pose.float[0] + 10}px ${pose.float[1] + 10}px">${cube(pose.float[0], pose.float[1], 20, T)}</g>`;
  if (pose.fx === 'pop') s += `<g id="fx" stroke="#5DF2E2" stroke-width="4" stroke-linecap="round"><path d="M48 60 l-8 -8 M62 46 l-2 -11 M34 78 l-11 -3"/></g>`;
  if (pose.fx === 'tower') s += `<g id="fx"><g id="cube-tower">${cube(100, -6 + 0, 22, T)}</g>${sparkle(40, 40, .9)}${sparkle(186, 34, 1.1)}${confetti([[30, 90, '#9A3B69', 20], [184, 92, '#239A92', -30], [52, 20, '#239A92', 40], [168, 8, '#F2AE1C', 10]])}</g>`;
  return `<defs><linearGradient id="${uid}-head" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${Y[0]}"/><stop offset=".6" stop-color="${Y[1]}"/><stop offset="1" stop-color="#DE9A12"/></linearGradient></defs>` + s;
}

// ---------- DANA: squirrel pattern explorer ----------
function dana(state, uid) {
  const P = PALETTE.dana;
  const pose = {
    idle: { eyes: 'open', mouth: 'open', brows: 'n', armL: 20, armR: -20, lens: 'hold', head: 0, tail: 'n', fx: '' },
    think: { eyes: 'up', mouth: 'side', brows: 'think', armL: 20, armR: -160, lens: 'eye', head: -7, tail: 'n', fx: '' },
    encourage: { eyes: 'side', mouth: 'open', brows: 'up', armL: 20, armR: -95, lens: 'none', head: 4, tail: 'n', fx: '' },
    correct: { eyes: 'open', mouth: 'o', brows: 'up', armL: 155, armR: -155, lens: 'none', head: 0, tail: 'fluff', fx: 'pop' },
    celebrate: { eyes: 'happy', mouth: 'big', brows: 'up', armL: 140, armR: -140, lens: 'none', head: 0, tail: 'n', fx: 'acorns' },
    recovery: { eyes: 'soft', mouth: 'small', brows: 'worried', armL: 50, armR: -50, lens: 'none', head: -4, tail: 'hug', fx: '' },
  }[state];
  const fur = `url(#${uid}-fur)`;
  let s = `<defs>${defsFor(uid, [['fur', P.light, P.mid, P.dark]])}</defs>` + shadow(108, 64);
  // tail: thick stroke + dashed overlay = repeating AB pattern (the character IS the pattern)
  const tailPath = pose.tail === 'hug'
    ? 'M128 214 C168 214 184 190 170 170 C156 150 120 160 104 176'
    : 'M126 212 C172 214 190 178 176 148 C162 122 156 86 174 64 C188 50 204 58 196 76';
  const w = pose.tail === 'fluff' ? 44 : 36;
  s += `<g id="back"><g id="tail" style="transform-origin:140px 210px">`;
  s += `<path d="${tailPath}" fill="none" stroke="${P.creamDark}" stroke-width="${w + 6}" stroke-linecap="round"/>`;
  s += `<path d="${tailPath}" fill="none" stroke="${P.cream}" stroke-width="${w}" stroke-linecap="round"/>`;
  s += `<path id="tail-pattern" d="${tailPath}" fill="none" stroke="${P.plum}" stroke-width="${w}" stroke-dasharray="24 22" stroke-dashoffset="4"/>`;
  s += `<path d="${tailPath}" fill="none" stroke="#FFFFFF" stroke-width="${w * 0.25}" stroke-linecap="round" opacity=".12" transform="translate(-6 -4)"/>`;
  s += `</g></g>`;
  s += `<g id="body-group" style="transform-origin:108px 236px">`;
  s += `<g id="legs"><ellipse cx="86" cy="230" rx="17" ry="10" fill="${P.dark}"/><ellipse cx="130" cy="230" rx="17" ry="10" fill="${P.dark}"/></g>`;
  s += `<path id="torso" d="M108 132 C140 132 152 168 150 196 C148 222 132 232 108 232 C84 232 68 222 66 196 C64 168 76 132 108 132 Z" fill="${fur}"/>`;
  s += `<path id="belly" d="M108 150 C126 150 134 176 132 198 C130 216 120 224 108 224 C96 224 86 216 84 198 C82 176 90 150 108 150 Z" fill="${P.cream}"/>`;
  // satchel
  s += `<g id="satchel"><path d="M78 142 L140 200" stroke="${P.bagDark}" stroke-width="7" stroke-linecap="round"/><rect x="124" y="190" width="34" height="28" rx="7" fill="${P.bag}"/><path d="M124 196 Q141 210 158 196 L158 192 Q141 186 124 192 Z" fill="${P.bagDark}"/><circle cx="141" cy="203" r="2.6" fill="${P.gold}"/><g id="acorn" transform="translate(140 184)"><ellipse cx="0" cy="4" rx="6" ry="7" fill="#B9773C"/><path d="M-7 0 Q0 -7 7 0 Q0 2 -7 0 Z" fill="#6E4321"/><rect x="-1" y="-8" width="2" height="5" rx="1" fill="#6E4321"/></g></g>`;
  const handLens = pose.lens === 'hold';
  s += limb('arm-l', 74, 160, 32, 15, pose.armL, P.dark, P.mid);
  s += `<g id="arm-r-wrap">${limb('arm-r', 142, 160, 32, 15, pose.armR, P.dark, P.mid)}</g>`;
  if (handLens) s += `<g id="magnifier" transform="translate(150 178) rotate(-20)"><rect x="-3" y="0" width="6" height="22" rx="3" fill="#7A4A26"/><circle cx="0" cy="-12" r="13" fill="${P.lens}" opacity=".85" stroke="${P.gold}" stroke-width="5"/><path d="M-6 -18 Q-2 -22 3 -20" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
  s += `</g>`;
  // head
  s += `<g id="head" style="transform-origin:108px 138px"><g transform="rotate(${pose.head} 108 138)">`;
  const ear = (x, m) => `<g id="ear-${m > 0 ? 'r' : 'l'}"><path d="M${x - 16 * m} 70 C${x - 16 * m} 46 ${x - 6 * m} 30 ${x + 4 * m} 22 C${x + 14 * m} 34 ${x + 14 * m} 52 ${x + 10 * m} 66 Z" fill="${P.mid}"/><path d="M${x - 9 * m} 64 C${x - 9 * m} 48 ${x - 2 * m} 38 ${x + 3 * m} 32 C${x + 9 * m} 42 ${x + 8 * m} 54 ${x + 6 * m} 62 Z" fill="#F2A68C"/><path d="M${x + 4 * m} 22 l${-4 * m} -9 M${x + 4 * m} 22 l${2 * m} -10 M${x + 4 * m} 22 l${7 * m} -6" stroke="${P.dark}" stroke-width="3" stroke-linecap="round"/></g>`;
  s += ear(70, -1) + ear(146, 1);
  s += `<path id="skull" d="M108 48 C148 48 162 76 162 102 C162 130 140 146 108 146 C76 146 54 130 54 102 C54 76 68 48 108 48 Z" fill="${fur}"/>`;
  s += `<ellipse cx="86" cy="66" rx="18" ry="8" fill="#FFFFFF" opacity=".13" transform="rotate(-18 86 66)"/>`;
  s += `<g id="face"><path id="muzzle" d="M108 106 C126 106 136 116 134 128 C132 140 120 144 108 144 C96 144 84 140 82 128 C80 116 90 106 108 106 Z" fill="${P.cream}"/>`;
  s += `<path d="M66 100 C64 84 74 76 86 78" fill="none" stroke="${P.cream}" stroke-width="0"/>`;
  s += cheeks(70, 146, 120, 9);
  const big = pose.lens === 'eye';
  s += eye('eye-l', 86, 98, pose.eyes, { rx: 14, ry: 16, ir: 11, iris: P.iris, lid: P.mid });
  s += eye('eye-r', 130, 98, pose.eyes, { rx: big ? 18 : 14, ry: big ? 20 : 16, ir: big ? 14 : 11, iris: P.iris, lid: P.mid });
  s += brows(86, 130, 76, pose.brows, P.dark);
  s += `<path id="nose" d="M102 114 Q108 110 114 114 Q112 120 108 121 Q104 120 102 114 Z" fill="${P.nose}"/>`;
  s += mouth(pose.mouth, 108, 125, 18);
  s += `<rect id="teeth" x="104.5" y="${pose.mouth === 'big' || pose.mouth === 'open' ? 126 : 128}" width="7" height="5" rx="1.5" fill="#FFFFFF" opacity="${pose.mouth === 'o' ? 0 : 0.95}"/>`;
  s += `</g>`;
  if (big) s += `<g id="magnifier"><path d="M150 112 L168 150" stroke="#7A4A26" stroke-width="7" stroke-linecap="round"/><circle cx="130" cy="98" r="23" fill="${P.lens}" opacity=".35" stroke="${P.gold}" stroke-width="6"/><path d="M118 88 Q124 82 132 84" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  s += `</g></g>`;
  if (pose.fx === 'pop') s += `<g id="fx" stroke="#23A5A0" stroke-width="4" stroke-linecap="round"><path d="M44 52 l-8 -8 M58 40 l-2 -11 M30 70 l-11 -3"/></g>`;
  if (pose.fx === 'acorns') s += `<g id="fx">${[[34, 70, -20], [186, 40, 15], [196, 110, 30], [26, 140, -10]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="4" rx="6" ry="7" fill="#B9773C"/><path d="M-7 0 Q0 -7 7 0 Q0 2 -7 0 Z" fill="#6E4321"/></g>`).join('')}${sparkle(60, 30, .8)}</g>`;
  return s;
}

// ---------- JIKO: round songbird ----------
function jiko(state, uid) {
  const P = PALETTE.jiko;
  const pose = {
    idle: { eyes: 'open', beak: 'smile', wingL: 0, wingR: 0, crest: 0, hop: 0, fx: '' },
    think: { eyes: 'up', beak: 'closed', wingL: 0, wingR: -120, crest: -8, hop: 0, fx: '' },
    encourage: { eyes: 'side', beak: 'open', wingL: 0, wingR: -70, crest: 4, hop: 0, fx: '' },
    correct: { eyes: 'happy', beak: 'open', wingL: 0, wingR: -100, crest: 0, crestUp: true, hop: 0, fx: 'pop' },
    celebrate: { eyes: 'open', beak: 'big', wingL: 115, wingR: -115, crest: 0, crestUp: true, hop: -14, fx: 'notes' },
    recovery: { eyes: 'soft', beak: 'closed', wingL: -10, wingR: 10, crest: -12, hop: 0, fx: '' },
  }[state];
  const body = `url(#${uid}-body)`;
  let s = `<defs>${defsFor(uid, [['body', P.light, P.mid, P.dark], ['belly', P.bellyLight, P.belly, '#EFA51F']])}</defs>` + shadow(112, pose.hop ? 46 : 56);
  s += `<g id="body-group" transform="translate(0 ${pose.hop})" style="transform-origin:112px 236px">`;
  s += `<g id="legs" stroke="${P.leg}" stroke-width="5" stroke-linecap="round" fill="none">${pose.hop ? '<path d="M96 210 L90 228 M90 228 l-8 4 M90 228 l2 7 M128 210 L136 226 M136 226 l8 2 M136 226 l-1 8"/>' : '<path d="M96 212 L96 234 M96 234 l-8 4 M96 234 l0 6 M96 234 l8 4 M128 212 L128 234 M128 234 l-8 4 M128 234 l0 6 M128 234 l8 4"/>'}</g>`;
  s += `<g id="tail-feathers" fill="${P.dark}"><ellipse cx="170" cy="196" rx="20" ry="8" transform="rotate(-25 170 196)"/><ellipse cx="172" cy="206" rx="18" ry="7" transform="rotate(-8 172 206)"/></g>`;
  const wing = (id, x, ang, m) => `<g id="${id}" class="wing" style="transform-origin:${x}px 140px"><g transform="rotate(${ang} ${x} 140)"><path d="M${x} 132 C${x - 30 * m} 136 ${x - 38 * m} 168 ${x - 30 * m} 186 C${x - 22 * m} 182 ${x - 16 * m} 186 ${x - 10 * m} 180 C${x - 4 * m} 176 ${x + 2 * m} 160 ${x} 132 Z" fill="${P.dark}"/><path d="M${x - 8 * m} 150 C${x - 18 * m} 160 ${x - 22 * m} 170 ${x - 22 * m} 178" stroke="${P.mid}" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>`;
  s += wing('wing-l', 60, pose.wingL, 1) + wing('wing-r', 164, pose.wingR, -1);
  s += `<g id="head" style="transform-origin:112px 140px">`;
  s += `<g id="crest" style="transform-origin:112px 66px"><g transform="rotate(${pose.crest} 112 66) ${pose.crestUp ? 'translate(0 -6)' : ''}"><path d="M110 70 C96 56 92 34 104 24 C112 34 114 52 114 68 Z" fill="${P.dark}"/><path d="M112 68 C110 46 118 26 132 22 C136 36 126 56 116 70 Z" fill="${P.mid}"/><path d="M114 70 C122 56 140 46 152 50 C148 62 132 70 116 72 Z" fill="${P.light}"/></g></g>`;
  s += `<path id="torso" d="M112 64 C160 64 176 108 174 146 C172 188 146 214 112 214 C78 214 52 188 50 146 C48 108 64 64 112 64 Z" fill="${body}"/>`;
  s += `<ellipse cx="86" cy="90" rx="22" ry="11" fill="#FFFFFF" opacity=".16" transform="rotate(-22 86 90)"/>`;
  s += `<path id="belly" d="M112 140 C140 140 156 160 152 184 C148 204 132 212 112 212 C92 212 76 204 72 184 C68 160 84 140 112 140 Z" fill="url(#${uid}-belly)"/>`;
  s += `<g id="belly-feathers" fill="none" stroke="#EFA51F" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M98 170 q4 4 8 0 M112 176 q4 4 8 0 M104 188 q4 4 8 0 M120 190 q4 4 8 0"/></g>`;
  s += `<g id="face">`;
  s += cheeks(70, 154, 132, 10);
  s += eye('eye-l', 88, 108, pose.eyes, { rx: 15, ry: 17, ir: 12, iris: P.iris, lid: P.mid });
  s += eye('eye-r', 136, 108, pose.eyes, { rx: 15, ry: 17, ir: 12, iris: P.iris, lid: P.mid });
  s += brows(88, 136, 84, pose.eyes === 'soft' ? 'worried' : pose.eyes === 'up' ? 'think' : 'up', P.dark);
  const bk = pose.beak;
  if (bk === 'closed') s += `<g id="beak"><path d="M101 124 Q112 118 123 124 Q118 136 112 138 Q106 136 101 124 Z" fill="${P.beak}"/><path d="M103 127 Q112 131 121 127" stroke="${P.beakDark}" stroke-width="2" fill="none"/></g>`;
  else if (bk === 'smile') s += `<g id="beak"><path d="M100 123 Q112 116 124 123 Q118 131 112 131 Q106 131 100 123 Z" fill="${P.beak}"/><path d="M103 131 Q112 140 121 131 Q112 134 103 131 Z" fill="${P.beakDark}"/></g>`;
  else s += `<g id="beak"><path d="M99 122 Q112 115 125 122 Q118 128 112 128 Q106 128 99 122 Z" fill="${P.beak}"/><path d="M102 129 Q112 ${bk === 'big' ? 152 : 145} 122 129 Q112 132 102 129 Z" fill="#7A2730"/><path d="M104 130 Q112 ${bk === 'big' ? 148 : 141} 120 130 Q112 ${bk === 'big' ? 140 : 136} 104 130 Z" fill="${P.beakDark}" opacity=".55"/></g>`;
  s += `</g></g></g>`;
  if (pose.fx === 'notes') s += `<g id="fx">${note(26, 60, '#239AA0', -10)}${note(186, 46, '#9A3B69', 12)}${sparkle(196, 112, .9)}${sparkle(30, 124, .7)}${confetti([[48, 30, '#F2AE1C', 30], [170, 20, '#239AA0', -20], [20, 96, '#9A3B69', 50], [200, 150, '#F2AE1C', -40]])}</g>`;
  if (pose.fx === 'pop') s += `<g id="fx" stroke="#F2AE1C" stroke-width="4" stroke-linecap="round"><path d="M88 22 l-6 -10 M112 14 v-11 M136 22 l6 -10"/></g>`;
  return s;
}

const RENDER = { aria, qbo, dana, jiko };
export const NAMES_FA = { aria: 'آریا', qbo: 'کیوبو', dana: 'دانا', jiko: 'جیکو' };
export const STATE_FA = { idle: 'آرام', think: 'فکر', encourage: 'تشویق', correct: 'درست', celebrate: 'جشن', recovery: 'دلگرمی' };

// Layer naming (P01): every named layer carries a stable class `sh-<name>` that motion.css targets.
// file mode (default, assets on disk / Rive import): layer ids are kept as well (one character per file).
// inline mode (web DOM, preview): layer ids are dropped so many characters can share one page with valid,
// unique ids; gradient ids are prefixed with `uid` (use INSTANCE_UID_TOKEN and substitute per instance).
export const INSTANCE_UID_TOKEN = '__SHU__';
const DEF_TAGS = new Set(['radialGradient', 'linearGradient', 'clipPath', 'mask', 'pattern', 'filter', 'symbol']);
export function layerize(svg, { keepIds = true } = {}) {
  return svg.replace(/<([a-zA-Z]+)(\s[^>]*?)?(\/?)>/g, (all, tag, attrs = '', selfClose) => {
    if (DEF_TAGS.has(tag) || !/\sid="/.test(attrs)) return all;
    const name = /\sid="([^"]+)"/.exec(attrs)[1];
    const layer = /^(aria|qbo|dana|jiko)-root$/.test(name) ? 'root' : name;
    let a = attrs;
    if (/\sclass="/.test(a)) a = a.replace(/\sclass="([^"]*)"/, (m, c) => ` class="${c.split(/\s+/).includes(`sh-${layer}`) ? c : `${c} sh-${layer}`}"`);
    else a = `${a} class="sh-${layer}"`;
    if (!keepIds) a = a.replace(/\sid="[^"]+"/, '');
    return `<${tag}${a}${selfClose}>`;
  });
}

export function renderCharacter(id, state = 'idle', { uid, bust = false, title = true, headOnly = false, inline = false } = {}) {
  if (!RENDER[id]) id = 'aria';
  if (!STATES.includes(state)) state = 'idle';
  const u = uid || `${id}-${state}`;
  const vb = bust ? (id === 'qbo' ? '44 10 136 136' : id === 'jiko' ? '40 14 144 144' : id === 'dana' ? '40 14 136 136' : '24 4 176 176') : VIEWBOX;
  const label = `${NAMES_FA[id]}، حالت ${STATE_FA[state]}`;
  const body = layerize(`<g id="${id}-root" class="sh-root">${RENDER[id](state, u, { headOnly })}</g>`, { keepIds: !inline });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${label}" data-character="${id}" data-state="${state}"${bust ? ' style="overflow:hidden"' : ''}>${title ? `<title>${label}</title>` : ''}${body}</svg>`;
}
