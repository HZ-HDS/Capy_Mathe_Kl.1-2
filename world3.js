/* WELT 3 – Klasse 2, Zahlenraum bis 100
   Plus/Minus mit Rechenstrich, Einmaleins, Geld mit Wechselgeld, Uhr mit Minuten. */
(function () {
  const { h, rnd, pick, shuffle } = U;
  const { reg, analyzeNum, distract, animal, helpText } = X;
  const ten = n => Math.floor(n / 10) * 10;

  /* 12) Plus bis 100 */
  reg({
    id: 'plus100', world: 'w3', emo: '➕', title: 'Plus bis 100', strat: 'zehner', gem: 'Hunderter-Plus-Profi',
    desc: 'ZE + E, ZE + Z, ZE + ZE mit Rechenstrich', komp: 'Addition bis 100: schrittweise rechnen, Zehnerübergang, Rechenwege am Rechenstrich',
    gen(L) {
      let a, b, jumps;
      if (L === 1) { a = rnd(21, 85); if (a % 10 === 9) a--; b = rnd(1, 9 - a % 10); jumps = [b]; }
      else if (L === 2) { a = rnd(12, 69); b = rnd(1, Math.floor((99 - a) / 10)) * 10; jumps = [b]; }
      else if (L === 3) { a = rnd(15, 88); if (a % 10 < 3) a += 4; b = rnd(10 - a % 10 + 1, 9); if (a + b > 99) { a = 47; b = 6; } jumps = [ten(a) + 10 - a, a + b - ten(a) - 10]; }
      else { a = rnd(15, 59); if (a % 10 < 3) a += 4; b = rnd(1, Math.floor((99 - a) / 10) - 1) * 10 + rnd(10 - a % 10 + 1, 9); if (b < 10 || a + b > 99) { a = 38; b = 45; } const z = ten(b), r = a + z, e = b - z; jumps = [z, ten(r) + 10 - r, r + e - ten(r) - 10]; }
      jumps = jumps.filter(j => j > 0);
      const s = a + b, cross = a % 10 + b % 10 > 9, an = animal();
      const pts = [a]; jumps.forEach(j => pts.push(pts[pts.length - 1] + j));
      return {
        q: Math.random() < .4 ? `${a} ${an.p} ${an.s}. ${b} ${an.d}. Wie viele sind es?` : 'Rechne mit Köpfchen!', eq: `${a} + ${b} = _`, cross,
        input: 'numpad', answer: s, strat: cross ? 'zehner' : 'stelle',
        hint: cross ? `Tipp: Erst bis zur ${ten(a) + 10}, dann weiter.` : b % 10 === 0 ? 'Tipp: Nur die Zehner ändern sich.' : 'Tipp: Nur die Einer ändern sich.',
        help(box) { box.appendChild(V.strich(a, jumps)); helpText(box, 'So kannst du springen.'); },
        steps: jumps.map((j, i) => `${pts[i]} + ${j} = ${pts[i + 1]}`),
        analyze: v => analyzeNum(v, s, { other: Math.abs(a - b), crossing: cross })
      };
    }
  });

  /* 13) Minus bis 100 */
  reg({
    id: 'minus100', world: 'w3', emo: '➖', title: 'Minus bis 100', strat: 'zehner', gem: 'Hunderter-Minus-Profi',
    desc: 'ZE − E, ZE − Z, ZE − ZE mit Rechenstrich', komp: 'Subtraktion bis 100: schrittweise rückwärts, Zehnerübergang, Ergänzen',
    gen(L) {
      let a, b, jumps;
      if (L === 1) { a = rnd(25, 99); if (a % 10 === 0) a -= 3; b = rnd(1, a % 10); jumps = [-b]; }
      else if (L === 2) { a = rnd(35, 99); b = rnd(1, Math.floor(a / 10) - 1) * 10; jumps = [-b]; }
      else if (L === 3) { a = rnd(21, 95); if (a % 10 > 7) a -= 3; if (a % 10 === 0) a += 2; b = rnd(a % 10 + 1, 9); jumps = [-(a % 10), -(b - a % 10)]; }
      else { a = rnd(41, 95); if (a % 10 > 7) a -= 3; if (a % 10 === 0) a += 2; const z = rnd(1, Math.floor(a / 10) - 2) * 10, e = rnd(a % 10 + 1, 9); b = z + e; const r = a - z; jumps = [-z, -(r % 10), -(e - r % 10)]; }
      jumps = jumps.filter(j => j !== 0);
      const d = a - b, cross = a % 10 < b % 10, an = animal();
      const pts = [a]; jumps.forEach(j => pts.push(pts[pts.length - 1] + j));
      return {
        q: Math.random() < .4 ? `${a} ${an.p} ${an.s}. ${b} ${an.w}. Wie viele bleiben?` : 'Rechne mit Köpfchen!', eq: `${a} − ${b} = _`, cross,
        input: 'numpad', answer: d, strat: cross ? 'zehner' : 'stelle',
        hint: cross ? `Tipp: Erst zurück zur ${ten(a - (b - b % 10))}, dann weiter.` : 'Tipp: Schau, ob sich Zehner oder Einer ändern.',
        help(box) { box.appendChild(V.strich(a, jumps)); helpText(box, 'So kannst du rückwärts springen.'); },
        steps: jumps.map((j, i) => `${pts[i]} − ${-j} = ${pts[i + 1]}`),
        analyze: v => analyzeNum(v, d, { other: a + b, crossing: cross })
      };
    }
  });

  /* 14) Einmaleins und Teilen */
  const FAM = [['🦫', 'Capybara-Familien', 'Babys'], ['🍓', 'Körbe', 'Erdbeeren'], ['🐸', 'Seerosen', 'Frösche'], ['🍌', 'Stauden', 'Bananen']];
  reg({
    id: 'mal', world: 'w3', emo: '✖️', title: 'Einmaleins', strat: 'reihe', gem: 'Einmaleins-Star',
    desc: 'Malnehmen als Punktefeld, Kernaufgaben, Teilen', komp: 'Multiplikation und Division: Malaufgaben als Reihen gleicher Mengen, Kernaufgaben, Umkehraufgaben',
    gen(L) {
      const f = pick(FAM);
      if (L <= 3) {
        const n = L === 1 ? rnd(1, 5) : L === 2 ? rnd(2, 5) : rnd(3, 9), k = L === 1 ? pick([2, 5, 10]) : L === 2 ? rnd(2, 5) : rnd(3, 9);
        const p = n * k, c = n >= 5 ? (n >= 8 ? 10 : 5) : 2, near = c * k;
        return {
          q: `${n} ${f[1]} mit je ${k} ${f[2]}. Wie viele sind es?`, eq: `${n} × ${k} = _`,
          render: L <= 2 ? stage => stage.appendChild(V.array(n, k, f[0])) : null, input: 'numpad', answer: p,
          hint: L === 3 ? `Tipp: ${c} × ${k} = ${near} kennst du schon. Leite ab!` : `Tipp: Zähle in ${k}er-Schritten, Reihe für Reihe.`,
          help(box) { box.appendChild(V.array(n, k, f[0], L === 3 ? Math.min(c, n) : 0)); helpText(box, L === 3 ? `Die gelben Reihen sind ${c} × ${k} = ${near}.` : `${Array(n).fill(k).join(' + ')}`); },
          steps: L === 3 && c !== n ? [`${c} × ${k} = ${near}`, `${n > c ? 'Dazu' : 'Weg'}: ${Math.abs(n - c)} × ${k} = ${Math.abs(n - c) * k}`, `${n} × ${k} = ${p}`] : [`${Array(n).fill(k).join(' + ')} = ${p}`, `${n} × ${k} = ${p}`],
          analyze: v => { v = Number(v); if (v === n + k) return 'operation'; if (v === (n - 1) * k || v === (n + 1) * k || v === n * (k - 1) || v === n * (k + 1)) return 'reihe'; return analyzeNum(v, p); }
        };
      }
      const k = rnd(2, 6), n = rnd(2, 6), total = n * k;
      return {
        q: `${total} ${f[2]} werden gerecht an ${k} Tiere verteilt. Wie viele bekommt jedes?`, eq: `${total} : ${k} = _`, say: `${total} ${f[2]} werden gerecht an ${k} Tiere verteilt. ${total} geteilt durch ${k}. Wie viele bekommt jedes?`,
        input: 'numpad', answer: n,
        hint: `Tipp: Welche Zahl mal ${k} ergibt ${total}?`,
        help(box) { box.appendChild(V.array(k, n, f[0])); helpText(box, `Jedes der ${k} Tiere bekommt eine Reihe.`); },
        steps: [`${k} × ${n} = ${total}`, `Also ${total} : ${k} = ${n}`],
        analyze: v => Number(v) === total - k ? 'operation' : analyzeNum(v, n)
      };
    }
  });

  /* 15) Geld bis 100 €: Wechselgeld, Euro und Cent */
  reg({
    id: 'geld100', world: 'w3', emo: '💶', title: 'Markt und Wechselgeld', strat: 'geld', gem: 'Marktchefin',
    desc: 'Wechselgeld, Euro und Cent', komp: 'Größen und Messen: Geldbeträge bis 100 €, Wechselgeld durch Ergänzen, Euro und Cent umrechnen',
    gen(L) {
      const goods = [['🍉', 'Melone'], ['🥥', 'Kokosnuss'], ['🎒', 'Rucksack'], ['📷', 'Kamera'], ['🧸', 'Kuscheltier'], ['🔭', 'Fernglas']];
      const g = pick(goods);
      if (L === 3) {
        const kind = rnd(0, 2);
        if (kind === 0) { const e = rnd(1, 5); return { q: 'Wie viele Cent sind das?', eq: `${e} € = _ ct`, say: `${e} Euro sind wie viele Cent?`, input: 'numpad', answer: e * 100, hint: 'Tipp: 1 € sind 100 Cent.', help(box) { helpText(box, '1 € = 100 ct'); }, steps: ['1 € = 100 ct', `${e} € = ${e * 100} ct`], analyze: v => Number(v) === e ? 'cent' : analyzeNum(v, e * 100) }; }
        if (kind === 1) { const e = rnd(1, 4), c = pick([10, 20, 50]); return { q: 'Wie viele Cent sind das?', eq: `${e} € ${c} ct = _ ct`, say: `${e} Euro und ${c} Cent sind wie viele Cent?`, input: 'numpad', answer: e * 100 + c, hint: 'Tipp: Erst die Euro in Cent, dann die Cent dazu.', help(box) { helpText(box, `${e} € = ${e * 100} ct`); }, steps: [`${e} € = ${e * 100} ct`, `${e * 100} + ${c} = ${e * 100 + c} ct`], analyze: v => Number(v) === e + c || Number(v) === e * 10 + c ? 'cent' : 'sonst' }; }
        const e = rnd(2, 9); return { q: 'Wie viele Euro sind das?', eq: `${e * 100} ct = _ €`, say: `${e * 100} Cent sind wie viele Euro?`, input: 'numpad', answer: e, hint: 'Tipp: 100 Cent sind 1 Euro.', help(box) { helpText(box, '100 ct = 1 €'); }, steps: ['100 ct = 1 €', `${e * 100} ct = ${e} €`], analyze: v => Number(v) === e * 100 || Number(v) === e * 10 ? 'cent' : 'sonst' };
      }
      let price, paid;
      if (L === 1) { price = rnd(1, 9); paid = 10; }
      else if (L === 2) { price = rnd(11, 19); paid = 20; }
      else { paid = pick([50, 100]); price = rnd(paid === 50 ? 21 : 41, paid - 3); if (price % 10 === 0) price += 3; }
      const ch = paid - price, up = Math.ceil(price / 10) * 10, jumps = up === paid || price % 10 === 0 ? [ch] : [up - price, paid - up];
      return {
        q: `Die ${g[1]} kostet ${price} €. Du bezahlst mit ${paid} €. Wie viel Rückgeld bekommst du?`, say: `Die ${g[1]} kostet ${price} Euro. Du bezahlst mit ${paid} Euro. Wie viel Rückgeld bekommst du?`,
        render: stage => stage.append(h('div.price-tag', {}, [h('span.emo', { text: g[0] }), `${price} €`]), h('div', { html: V.moneySVG(paid) })),
        eq: `${price} € + _ € = ${paid} €`, input: 'numpad', answer: ch,
        hint: `Tipp: Rechne von ${price} hoch bis ${paid}.`,
        help(box) { box.appendChild(V.strich(price, jumps)); helpText(box, 'Rückgeld ist das, was bis zum bezahlten Betrag fehlt.'); },
        steps: jumps.length > 1 ? [`${price} + ${jumps[0]} = ${up}`, `${up} + ${jumps[1]} = ${paid}`, `Rückgeld: ${ch} €`] : [`${price} + ${ch} = ${paid}`, `Rückgeld: ${ch} €`],
        analyze: v => Number(v) === paid + price ? 'operation' : analyzeNum(v, ch, { crossing: true })
      };
    }
  });

  /* 16) Uhr: Viertel, Minuten, Uhr stellen, Zeitspannen */
  const fmt = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`;
  reg({
    id: 'uhr2', world: 'w3', emo: '🕰️', title: 'Turmuhr', strat: 'uhr', gem: 'Minuten-Meisterin',
    desc: 'Viertelstunden, Minuten, Zeitspannen', komp: 'Größen und Messen: Uhrzeiten auf die Minute, Viertelstunden, Zeitspannen bestimmen',
    gen(L) {
      const hh = rnd(1, 11);
      if (L === 1) {
        const after = Math.random() < .5, mm = after ? 15 : 45;
        const ans = after ? `Viertel nach ${hh}` : `Viertel vor ${hh + 1}`, wrong = after ? `Viertel vor ${hh}` : `Viertel nach ${hh + 1}`;
        return {
          q: 'Wie spät ist es?', render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm)),
          input: 'choice', text: true, choices: shuffle([ans, wrong, `halb ${hh + 1}`]), answer: ans,
          hint: 'Tipp: Zeigt der lange Zeiger auf die 3, ist es Viertel nach. Auf die 9: Viertel vor.',
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm, { hlMin: true })); helpText(box, after ? 'Der lange Zeiger hat ein Viertel der Runde geschafft.' : 'Bis zur vollen Stunde fehlt noch ein Viertel.'); },
          steps: [`Langer Zeiger auf ${after ? 3 : 9}`, ans], analyze: v => v === wrong ? 'viertel' : 'zeiger'
        };
      }
      if (L === 2) {
        const mm = rnd(1, 11) * 5;
        return {
          q: `Wie viele Minuten nach ${hh} Uhr ist es?`, render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm)),
          eq: `${hh}:_`, input: 'numpad', answer: mm,
          hint: 'Tipp: Von einer Zahl zur nächsten sind es 5 Minuten. Zähle in 5er-Schritten.',
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm, { hlMin: true })); helpText(box, `Der lange Zeiger zeigt auf die ${mm / 5}. ${mm / 5} mal 5 Minuten.`); },
          steps: [`Langer Zeiger auf ${mm / 5}`, `${mm / 5} × 5 = ${mm} Minuten`, `Es ist ${fmt(hh, mm)}`],
          analyze: v => Number(v) === mm / 5 || Number(v) === hh * 5 ? 'zeiger' : analyzeNum(v, mm)
        };
      }
      if (L === 3) {
        const mm = rnd(1, 11) * 5;
        let cur = 0, svgEl;
        return {
          q: `Stelle die Uhr auf ${fmt(hh, mm)}! Zieh den langen Zeiger.`, say: `Stelle die Uhr auf ${hh} Uhr ${mm}. Zieh den langen Zeiger.`,
          render(stage) {
            const holder = h('div', { html: V.clockSVG(hh, 0) }); stage.appendChild(holder);
            const readout = h('p.sum-line', { text: fmt(hh, 0) }); stage.appendChild(readout);
            svgEl = holder.querySelector('svg');
            const set = m => {
              cur = m;
              const ha = ((hh % 12) + m / 60) * 30;
              const hHand = svgEl.querySelector('.h-hand'), mHand = svgEl.querySelector('.m-hand');
              hHand.setAttribute('x2', 100 + Math.sin(ha * Math.PI / 180) * 46); hHand.setAttribute('y2', 100 - Math.cos(ha * Math.PI / 180) * 46);
              mHand.setAttribute('x2', 100 + Math.sin(m * 6 * Math.PI / 180) * 74); mHand.setAttribute('y2', 100 - Math.cos(m * 6 * Math.PI / 180) * 74);
              readout.textContent = fmt(hh, m);
            };
            let drag = false;
            const move = e => {
              const r = svgEl.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
              let ang = Math.atan2(x, -y) * 180 / Math.PI; if (ang < 0) ang += 360;
              const m = Math.round(ang / 30) * 5 % 60;
              if (m !== cur) { set(m); Sound.play('tap'); }
            };
            svgEl.addEventListener('pointerdown', e => { drag = true; svgEl.setPointerCapture(e.pointerId); move(e); });
            svgEl.addEventListener('pointermove', e => drag && move(e));
            svgEl.addEventListener('pointerup', () => (drag = false));
            return { getValue: () => cur };
          },
          input: 'widget', answer: mm,
          hint: `Tipp: ${mm} Minuten. In 5er-Schritten: auf welche Zahl muss der lange Zeiger?`,
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm, { hlMin: true })); helpText(box, `${mm} : 5 = ${mm / 5}. Der lange Zeiger muss auf die ${mm / 5}.`); },
          steps: [`${mm} Minuten`, `${mm} = ${mm / 5} × 5`, `Langer Zeiger auf ${mm / 5}`],
          analyze: v => v === (hh % 12) * 5 ? 'zeiger' : 'sonst'
        };
      }
      const sm = pick([0, 15, 30, 45]), dur = pick([10, 15, 20, 30, 45]);
      const end = sm + dur, eh = hh + Math.floor(end / 60), em = end % 60;
      const ans = fmt(eh, em);
      const opts = U.uniq([ans, fmt(hh, (sm + dur + 10) % 60), fmt(eh + 1, em), fmt(hh, Math.abs(sm - dur) % 60)]).slice(0, 3);
      const an = pick(['Die Reportage', 'Das Froschkonzert', 'Die Bootsfahrt', 'Der Ausflug']);
      return {
        q: `${an} beginnt um ${fmt(hh, sm)} und dauert ${dur} Minuten. Wann ist sie zu Ende?`, say: `${an} beginnt um ${hh} Uhr ${sm || ''} und dauert ${dur} Minuten. Wann ist sie zu Ende?`,
        render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(hh, sm)),
        input: 'choice', text: true, choices: shuffle(opts), answer: ans,
        hint: 'Tipp: Gehe in Minuten-Schritten weiter. Nach 60 Minuten beginnt eine neue Stunde.',
        help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(eh, em, { hlMin: true })); helpText(box, `Von ${fmt(hh, sm)} plus ${dur} Minuten.`); },
        steps: [`Start: ${fmt(hh, sm)}`, `+ ${dur} Minuten`, `Ende: ${ans}`], analyze: () => 'sonst'
      };
    }
  });
})();
