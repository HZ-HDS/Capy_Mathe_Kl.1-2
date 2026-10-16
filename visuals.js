/* Mathe-Material als Bausteine: Zwanzigerfeld, Gruppen, Spielgeld, Uhr,
   Rechenstrich, Zehnerstangen, Punktefelder. */
window.V = (function () {
  const { h } = U;

  /* Zwanzigerfeld: a rote, b blaue Plättchen, Reihe 1 zuerst (Kraft der Fünf und Zehn).
     opts.cross: so viele Plättchen am Ende durchstreichen (Minus).
     opts.tap: leere Felder antippbar (füllen mit Farbe opts.tapColor). Rückgabe hat .count() */
  function field20(a, b = 0, opts = {}) {
    const rows = opts.rows || 2;
    const wrap = h('div.field20');
    const cells = [];
    let added = 0;
    for (let r = 0; r < rows; r++) {
      const row = h('div.frow');
      for (let c = 0; c < 10; c++) {
        if (c === 5) row.appendChild(h('span'));
        const i = r * 10 + c;
        const cell = h('div.cell');
        let kind = i < a ? 'r' : i < a + b ? 'b' : null;
        if (opts.cross && i >= a + b - opts.cross && i < a + b) kind = 'x';
        if (kind) cell.appendChild(h('div.dot.' + kind));
        else if (opts.tap) {
          cell.classList.add('tap');
          cell.addEventListener('pointerdown', () => {
            const has = cell.firstChild;
            if (has) { cell.innerHTML = ''; added--; } else { cell.appendChild(h('div.dot.' + (opts.tapColor || 'b'))); added++; }
            Sound.play('tap');
            opts.onChange && opts.onChange(added);
          });
        }
        cells.push(cell); row.appendChild(cell);
      }
      wrap.appendChild(row);
    }
    wrap.count = () => added;
    return wrap;
  }

  /* Gegenstände in Fünfergruppen zeigen (nie als lose Reihe) */
  function groups(emo, nums) {
    const box = h('div.groups');
    nums.forEach(n => {
      if (!n) return;
      const g = h('div.grp' + (n > 5 ? '.wide' : ''));
      g.style.gridTemplateColumns = n > 5 ? 'repeat(5, 1fr)' : `repeat(${Math.min(n, 5)}, 1fr)`;
      for (let i = 0; i < n; i++) g.appendChild(h('span', { text: emo }));
      box.appendChild(g);
    });
    return box;
  }

  /* Spielgeld (bewusst stilisiert, mit Aufdruck SPIELGELD) */
  const MONEY = {
    1: { kind: 'c', label: '1 €', col: '#e3c25a', ring: '#c9cbd2', size: 64 },
    2: { kind: 'c', label: '2 €', col: '#c9cbd2', ring: '#e3c25a', size: 72 },
    5: { kind: 'n', label: '5 €', col: '#b9c4cf' },
    10: { kind: 'n', label: '10 €', col: '#f2a7a0' },
    20: { kind: 'n', label: '20 €', col: '#a8c7f0' },
    50: { kind: 'n', label: '50 €', col: '#f5c48a' },
    0.5: { kind: 'c', label: '50 ct', col: '#e3c25a', ring: '#e3c25a', size: 58 },
    0.2: { kind: 'c', label: '20 ct', col: '#e3c25a', ring: '#e3c25a', size: 52 },
    0.1: { kind: 'c', label: '10 ct', col: '#e3c25a', ring: '#e3c25a', size: 46 }
  };
  function moneySVG(v) {
    const m = MONEY[v];
    if (m.kind === 'c') {
      const s = m.size;
      return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${m.ring}" stroke="#8a7a3a" stroke-width="2"/><circle cx="32" cy="32" r="22" fill="${m.col}"/><text x="32" y="37" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="bold" font-size="${m.label.length > 3 ? 13 : 16}" fill="#3a2f10">${m.label}</text><text x="32" y="50" text-anchor="middle" font-size="5.5" font-family="Arial, sans-serif" fill="#3a2f10">SPIELGELD</text></svg>`;
    }
    return `<svg width="116" height="64" viewBox="0 0 116 64"><rect x="2" y="2" width="112" height="60" rx="8" fill="${m.col}" stroke="#55607a" stroke-width="2"/><circle cx="26" cy="32" r="16" fill="rgba(255,255,255,.6)"/><text x="26" y="38" text-anchor="middle" font-size="16">🦫</text><text x="78" y="38" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="bold" font-size="20" fill="#232a3d">${m.label}</text><text x="78" y="54" text-anchor="middle" font-size="7" font-family="Arial, sans-serif" fill="#232a3d">SPIELGELD</text></svg>`;
  }

  /* Analoge Uhr. opts.hlHour/hlMin heben Zeiger hervor, opts.hideHands */
  function clockSVG(hh, mm, opts = {}) {
    const ha = ((hh % 12) + mm / 60) * 30, ma = mm * 6;
    let ticks = '', nums = '';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 88 : 82;
      ticks += `<line x1="${100 + Math.sin(a) * r1}" y1="${100 - Math.cos(a) * r1}" x2="${100 + Math.sin(a) * 92}" y2="${100 - Math.cos(a) * 92}" stroke="#7a7398" stroke-width="${i % 5 ? 1.5 : 3}"/>`;
    }
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180;
      nums += `<text x="${100 + Math.sin(a) * 68}" y="${100 - Math.cos(a) * 68 + 7}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="20" font-weight="bold" fill="#2b2550">${i}</text>`;
    }
    const hand = (ang, len, w, col, cls) => `<line class="${cls}" x1="100" y1="100" x2="${100 + Math.sin(ang * Math.PI / 180) * len}" y2="${100 - Math.cos(ang * Math.PI / 180) * len}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const hCol = opts.hlHour ? '#ef5b6b' : '#2b2550', mCol = opts.hlMin ? '#3f8fe0' : '#5b3a99';
    return `<svg class="clock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="96" fill="#fff" stroke="#9a72dd" stroke-width="6"/>${ticks}${nums}
      ${opts.hideHands ? '' : hand(ha, 46, 9, hCol, 'h-hand') + hand(ma, 74, 6, mCol, 'm-hand')}
      <circle cx="100" cy="100" r="7" fill="#ffc94d" stroke="#2b2550" stroke-width="2"/></svg>`;
  }

  /* Rechenstrich: start, Sprünge [+3, +2] → Bögen mit Zwischenergebnissen */
  function strich(start, jumps) {
    const pts = [start]; jumps.forEach(j => pts.push(pts[pts.length - 1] + j));
    const min = Math.min(...pts), max = Math.max(...pts), span = Math.max(1, max - min);
    const W = 600, x = v => 40 + (v - min) / span * (W - 80);
    let s = `<svg viewBox="0 0 ${W} 150" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="110" x2="${W - 20}" y2="110" stroke="#2b2550" stroke-width="4" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { s += `<line x1="${x(p)}" y1="100" x2="${x(p)}" y2="120" stroke="#2b2550" stroke-width="3"/><text x="${x(p)}" y="144" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="22" font-weight="bold" fill="${i === pts.length - 1 ? '#9a72dd' : '#1d5f96'}">${p}</text>`; });
    jumps.forEach((j, i) => {
      const a = x(pts[i]), b = x(pts[i + 1]), mid = (a + b) / 2, top = 110 - Math.min(80, 30 + Math.abs(b - a) / 3);
      s += `<path d="M${a} 104 Q${mid} ${top} ${b} 104" fill="none" stroke="${j > 0 ? '#3f9fe0' : '#ef5b6b'}" stroke-width="4"/><text x="${mid}" y="${top + 26}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="20" font-weight="bold" fill="${j > 0 ? '#1d5f96' : '#a3303f'}">${j > 0 ? '+' + j : '−' + Math.abs(j)}</text>`;
    });
    return h('div.rstrich', { html: s + '</svg>' });
  }

  /* Zehnerstangen und Einerwürfel */
  function tensOnes(t, o, opts = {}) {
    const box = h('div.place');
    const tens = h('div.tens'); for (let i = 0; i < t; i++) { const b = h('div.ten-bar'); for (let k = 0; k < 10; k++) b.appendChild(h('i')); if (opts.onTen) b.addEventListener('pointerdown', () => opts.onTen(i)); tens.appendChild(b); }
    const ones = h('div.ones'); for (let i = 0; i < o; i++) { const c = h('div.one'); if (opts.onOne) c.addEventListener('pointerdown', () => opts.onOne(i)); ones.appendChild(c); }
    box.append(tens, ones);
    return box;
  }
  function zeTafel(z, e) {
    return h('div.zetafel', {}, [h('div.h', { text: 'Zehner' }), h('div.h', { text: 'Einer' }), h('div', { text: z }), h('div', { text: e })]);
  }

  /* Punktefeld fürs Einmaleins: rows Reihen mit je cols Dingen */
  function array(rows, cols, emo, hlRows = 0) {
    const a = h('div.array');
    for (let r = 0; r < rows; r++) {
      const row = h('div.arow' + (r < hlRows ? '.hl' : ''));
      for (let c = 0; c < cols; c++) row.appendChild(h('span', { text: emo }));
      a.appendChild(row);
    }
    return a;
  }

  /* Schmetterling: links n Punkte, rechts gespiegelt (oder leer zum Verdoppeln) */
  function butterfly(left, right) {
    const wing = (n, side, ghost) => { const w = h('div.wing.' + side); for (let i = 0; i < 10; i++) w.appendChild(i < n ? h('div.dot.' + (ghost ? 'ghost' : side === 'l' ? 'r' : 'b')) : h('span')); return w; };
    return h('div.wing-wrap', {}, [wing(left, 'l'), h('div.body-bar'), wing(right, 'r')]);
  }

  return { field20, groups, MONEY, moneySVG, clockSVG, strich, tensOnes, zeTafel, array, butterfly };
})();
