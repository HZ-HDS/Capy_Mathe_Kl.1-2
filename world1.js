/* WELT 1 – Klasse 1, Zahlenraum bis 20
   Schwerpunkt: Mengen sehen statt zählen, Zehnerfreunde, Zehnerübergang. */
(function () {
  const { h, rnd, pick, shuffle } = U;
  const { reg, analyzeNum, distract, animal, helpText } = X;

  /* 1) Blitzblick: Menge kurz zeigen, dann zudecken */
  reg({
    id: 'blitz', world: 'w1', emo: '⚡', title: 'Blitzblick', strat: 'menge', gem: 'Blitzblick-Profi',
    desc: 'Mengen auf einen Blick erkennen', komp: 'Zahlvorstellung: strukturierte Mengen simultan und quasi-simultan erfassen (Leitidee Zahl – Variable – Operation)',
    gen(L) {
      const max = [6, 10, 15, 20][L - 1], n = rnd(L === 1 ? 2 : 4, max), ms = [2600, 2000, 1600, 1300][L - 1];
      const a = Math.min(n, 10), b = n - a;
      return {
        q: 'Schau genau! Wie viele Punkte siehst du?', say: 'Schau genau! Wie viele Punkte siehst du? Nicht zählen, nur gucken!',
        render(stage) {
          const wrap = h('div.cover', {}, [V.field20(a, b, { rows: n > 10 ? 2 : 1 })]);
          stage.appendChild(wrap);
          setTimeout(() => wrap.appendChild(h('div.leaves', { text: '🍃🍃🍃' })), ms);
        },
        input: 'choice', choices: distract(n, [n + 1, n - 1, n + 5, n - 5, n + 10], 4, 1, 20), answer: n,
        hint: n > 5 ? 'Tipp: Eine volle Reihe sind 5. Schau, wie viele noch dazukommen.' : 'Tipp: Stell dir einen Würfel vor.',
        help(box) { box.appendChild(V.field20(a, b, { rows: n > 10 ? 2 : 1 })); helpText(box, n > 10 ? `Oben ist voll: 10. Unten sind ${b}.` : n > 5 ? `Eine volle Fünf und noch ${n - 5}.` : `Das sind ${n}.`); },
        steps: n > 10 ? ['Oben: eine volle Reihe = 10', `Unten: ${b}`, `10 und ${b} sind ${n}`] : n > 5 ? ['Eine volle Fünf = 5', `Dazu ${n - 5}`, `5 und ${n - 5} sind ${n}`] : [`Das sind ${n} Punkte`],
        analyze: v => analyzeNum(v, n, { five: true })
      };
    }
  });

  /* 2) Zehnerfreunde: auffüllen bis 10 */
  reg({
    id: 'freunde', world: 'w1', emo: '💞', title: 'Zehnerfreunde', strat: 'zehner', gem: 'Zehnerfreunde-Profi',
    desc: 'Zahlen bis 10 zerlegen und ergänzen', komp: 'Zahlzerlegung, Ergänzen bis 10 als Basis für den Zehnerübergang',
    gen(L) {
      if (L <= 2) {
        const a = L === 1 ? rnd(5, 9) : rnd(1, 9);
        let field;
        return {
          q: `Im Nest sind ${a} Eier. Tippe die leeren Plätze an, bis das Nest voll ist!`, say: `Im Nest sind ${a} Eier. Fülle das Nest bis zehn auf!`,
          render(stage) { field = V.field20(a, 0, { rows: 1, tap: true, tapColor: 'b' }); stage.appendChild(field); return { getValue: () => field.count() }; },
          input: 'widget', answer: 10 - a, strat: 'zehner',
          hint: 'Tipp: Das Nest hat genau 10 Plätze, zwei Fünfer.', help(box) { box.appendChild(V.field20(a, 10 - a, { rows: 1 })); helpText(box, `${a} und ${10 - a} sind Zehnerfreunde.`); },
          steps: [`${a} sind schon da`, `Bis 10 fehlen ${10 - a}`, `${a} + ${10 - a} = 10`],
          analyze: v => analyzeNum(v, 10 - a)
        };
      }
      const twenty = L === 4 && Math.random() < .5;
      const target = twenty ? 20 : 10, a = twenty ? rnd(11, 19) : rnd(1, 9);
      return {
        q: `Wie viele fehlen bis ${target}?`, eq: `${a} + _ = ${target}`, input: 'numpad', answer: target - a,
        hint: twenty ? 'Tipp: Schau nur auf die Einer. Wie viele fehlen bis zur nächsten 10?' : 'Tipp: Denk an die Zehnerfreunde.',
        help(box) { box.appendChild(V.field20(a, 0, { rows: twenty ? 2 : 1 })); helpText(box, 'Wie viele Felder sind noch leer?'); },
        steps: [`${a} + ${target - a} = ${target}`, twenty ? `Denn ${a - 10} + ${target - a} = 10` : 'Zehnerfreunde!'],
        analyze: v => analyzeNum(v, target - a)
      };
    }
  });

  /* 3) Plus bis 20 mit Zehnerübergang */
  reg({
    id: 'plus20', world: 'w1', emo: '➕', title: 'Plus bis 20', strat: 'zehner', gem: 'Plus-Profi',
    desc: 'Addieren bis 20, auch über die 10', komp: 'Addition im Zahlenraum bis 20, Zehnerübergang mit Teilschrittverfahren',
    gen(L) {
      let a, b;
      if (L === 1) { a = rnd(1, 8); b = rnd(1, 10 - a); }
      else if (L === 2) { a = pick([10, rnd(11, 15)]); b = rnd(1, 9 - (a % 10) || 1); }
      else if (L === 3) { a = rnd(7, 9); b = rnd(11 - a, 9); }
      else { a = rnd(4, 9); b = rnd(Math.max(11 - a, 4), 9); }
      const s = a + b, cross = a < 10 && s > 10, an = animal();
      const story = L <= 2 ? `${a} ${an.p} ${an.s}. ${b} ${an.d}.` : null;
      const fill = 10 - a, rest = b - fill;
      return {
        q: story || 'Rechne geschickt!', eq: `${a} + ${b} = _`, cross,
        render: L <= 2 ? stage => stage.appendChild(V.groups(an.e, a > 10 ? [10, a - 10, b] : [a, b])) : null,
        input: 'numpad', answer: s, strat: cross ? 'zehner' : 'menge',
        hint: cross ? `Tipp: Rechne erst bis zur 10. Wie viel fehlt von ${a} bis 10?` : a >= 10 ? 'Tipp: Rechne erst die Einer zusammen.' : 'Tipp: Sieh die Mengen auf einen Blick.',
        help(box) {
          box.appendChild(V.field20(a, b, { rows: s > 10 ? 2 : 1 }));
          helpText(box, cross ? `Rot ist ${a}. Blau füllt erst bis 10 auf, dann geht's in der zweiten Reihe weiter.` : 'Rot und Blau zusammen.');
        },
        steps: cross ? [`${a} + ${b}`, `${a} + ${fill} = 10`, `10 + ${rest} = ${s}`] : a >= 10 && a > 10 ? [`${a % 10} + ${b} = ${a % 10 + b}`, `10 + ${a % 10 + b} = ${s}`] : [`${a} + ${b} = ${s}`],
        analyze: v => analyzeNum(v, s, { other: Math.abs(a - b), crossing: cross })
      };
    }
  });

  /* 4) Minus bis 20 */
  reg({
    id: 'minus20', world: 'w1', emo: '➖', title: 'Minus bis 20', strat: 'zehner', gem: 'Minus-Profi',
    desc: 'Subtrahieren bis 20, auch über die 10', komp: 'Subtraktion im Zahlenraum bis 20, Zehnerübergang rückwärts',
    gen(L) {
      let a, b;
      if (L === 1) { a = rnd(4, 10); b = rnd(1, a - 1); }
      else if (L === 2) { a = rnd(13, 19); b = rnd(1, a - 10); }
      else if (L === 3) { a = rnd(11, 16); b = rnd(a - 9, Math.min(9, a - 10 + 5)); }
      else { a = rnd(11, 18); b = rnd(a - 9, 9); }
      const d = a - b, cross = a > 10 && d < 10, an = animal();
      const story = L <= 2 ? `${a} ${an.p} ${an.s}. ${b} ${an.w}.` : null;
      const toTen = a - 10, rest = b - toTen;
      return {
        q: story || 'Rechne geschickt!', eq: `${a} − ${b} = _`, cross,
        render: L <= 2 ? stage => stage.appendChild(V.field20(a, 0, { rows: a > 10 ? 2 : 1, cross: b })) : null,
        input: 'numpad', answer: d, strat: cross ? 'zehner' : 'menge',
        hint: cross ? `Tipp: Geh erst zurück bis zur 10. Wie viel ist das von ${a} aus?` : 'Tipp: Die durchgestrichenen sind weg.',
        help(box) { box.appendChild(V.field20(a, 0, { rows: a > 10 ? 2 : 1, cross: b })); helpText(box, cross ? `Erst die ${toTen} in der unteren Reihe weg, dann noch ${rest} oben.` : 'Wie viele sind noch übrig?'); },
        steps: cross ? [`${a} − ${b}`, `${a} − ${toTen} = 10`, `10 − ${rest} = ${d}`] : [`${a} − ${b} = ${d}`],
        analyze: v => analyzeNum(v, d, { other: a + b, crossing: cross })
      };
    }
  });

  /* 5) Verdoppeln, Halbieren, Fast-Verdopplungen */
  reg({
    id: 'doppel', world: 'w1', emo: '🦋', title: 'Verdoppeln', strat: 'doppel', gem: 'Verdoppel-Königin',
    desc: 'Verdoppeln, halbieren, Fast-Verdopplungen', komp: 'Verdoppeln und Halbieren als Rechenstrategie, Ableiten (6 + 7 = 6 + 6 + 1)',
    gen(L) {
      if (L <= 2) {
        const n = L === 1 ? rnd(1, 5) : rnd(6, 10);
        return {
          q: `Der Schmetterling hat links ${n} Punkte. Rechts genauso viele. Wie viele zusammen?`, eq: `${n} + ${n} = _`,
          render: stage => stage.appendChild(V.butterfly(n, 0)), input: 'numpad', answer: 2 * n,
          hint: 'Tipp: Beide Flügel sind gleich. Verdoppeln!',
          help(box) { box.appendChild(V.butterfly(n, n)); helpText(box, n > 5 ? 'Zwei volle Fünfer sind 10. Dann der Rest.' : 'Links und rechts zusammen.'); },
          steps: n > 5 ? [`5 + 5 = 10`, `${n - 5} + ${n - 5} = ${2 * (n - 5)}`, `10 + ${2 * (n - 5)} = ${2 * n}`] : [`${n} + ${n} = ${2 * n}`],
          analyze: v => analyzeNum(v, 2 * n, { five: true, crossing: n > 5 })
        };
      }
      if (L === 3) {
        const half = rnd(2, 10), n = half * 2;
        return {
          q: `${n} Mandarinen werden gerecht geteilt. Wie viele bekommt jeder?`, eq: `Die Hälfte von ${n} = _`, say: `Die Hälfte von ${n}. Wie viel ist das?`,
          render: stage => stage.appendChild(V.field20(Math.min(n, 10), Math.max(0, n - 10), { rows: n > 10 ? 2 : 1 })), input: 'numpad', answer: half,
          hint: 'Tipp: Welche Zahl verdoppelt ergibt ' + n + '?',
          help(box) { box.appendChild(V.butterfly(half, half)); helpText(box, `${half} + ${half} = ${n}`); },
          steps: [`${half} + ${half} = ${n}`, `Also ist die Hälfte ${half}`],
          analyze: v => analyzeNum(v, half)
        };
      }
      const n = rnd(3, 9), s = 2 * n + 1;
      return {
        q: 'Fast verdoppelt! Rechne mit dem Verdoppel-Trick.', eq: `${n} + ${n + 1} = _`, input: 'numpad', answer: s,
        hint: `Tipp: ${n} + ${n} kennst du schon. Und dann?`,
        help(box) { box.appendChild(V.butterfly(n, n)); helpText(box, `${n} + ${n} = ${2 * n}, und dann noch 1 dazu.`); },
        steps: [`${n} + ${n} = ${2 * n}`, `${2 * n} + 1 = ${s}`],
        analyze: v => analyzeNum(v, s, { crossing: s > 10 })
      };
    }
  });

  /* 6) Geld bis 20 €: Betrag legen */
  reg({
    id: 'geld20', world: 'w1', emo: '🪙', title: 'Regenwald-Kiosk', strat: 'geld', gem: 'Kioskchefin',
    desc: 'Mit Euro-Münzen und Scheinen bezahlen', komp: 'Größen und Messen: Geldwerte bis 20 €, Beträge legen und bündeln',
    gen(L) {
      const max = [5, 10, 20, 20][L - 1], price = rnd(L === 1 ? 2 : 3, max);
      const sources = L === 1 ? [1, 2, 5] : L === 2 ? [1, 2, 5, 10] : [1, 2, 5, 10, 20];
      const goods = [['🍌', 'Banane'], ['🍊', 'Mandarine'], ['🥭', 'Mango'], ['🍍', 'Ananas'], ['🧃', 'Saft'], ['🍪', 'Keks']];
      const g = pick(goods);
      const greedy = [];
      let r = price; [20, 10, 5, 2, 1].forEach(v => { if (!sources.includes(v)) return; while (r >= v) { greedy.push(v); r -= v; } });
      let tray = [];
      return {
        q: L === 4 ? `Bezahle ${price} € mit möglichst wenig Geldstücken!` : `Lege genau ${price} € in die Schale.`, say: L === 4 ? `Bezahle ${price} Euro mit möglichst wenig Münzen und Scheinen!` : `Lege genau ${price} Euro in die Schale.`,
        render(stage) {
          stage.appendChild(h('div.price-tag', {}, [h('span.emo', { text: g[0] }), `${g[1]}: ${price} €`]));
          const trayEl = h('div.money-tray');
          const draw = () => {
            trayEl.innerHTML = '';
            if (!tray.length) trayEl.appendChild(h('span.muted', { text: 'Tippe unten auf Geld, um es hierher zu legen.' }));
            tray.forEach((v, i) => trayEl.appendChild(h('button.coin', { html: V.moneySVG(v), 'aria-label': `${v} Euro zurücklegen`, onclick: () => { tray.splice(i, 1); Sound.play('tap'); draw(); } })));
          };
          const src = h('div.money-src', {}, sources.map(v => h('button.coin', { html: V.moneySVG(v), 'aria-label': `${v} Euro`, onclick: () => { if (tray.length < 12) { tray.push(v); Sound.play('coin'); draw(); } } })));
          draw(); stage.append(trayEl, src);
          return { getValue: () => ({ sum: tray.reduce((s, v) => s + v, 0), count: tray.length }) };
        },
        input: 'widget', answer: price,
        check: v => v.sum === price && (L < 4 || v.count <= greedy.length),
        hint: L === 4 ? 'Tipp: Nimm zuerst den größten Schein, der noch passt.' : 'Tipp: Zähl in großen Schritten: erst Scheine, dann Münzen.',
        help(box) { box.appendChild(h('div.money-src', {}, greedy.map(v => h('span', { html: V.moneySVG(v) })))); helpText(box, `So geht es: ${greedy.join(' € + ')} € = ${price} €`); },
        steps: [`${price} € = ${greedy.map(v => v + ' €').join(' + ')}`, 'Erst das Große, dann das Kleine'],
        analyze: v => v.sum !== price ? 'geld' : 'muenzen'
      };
    }
  });

  /* 7) Uhr: volle und halbe Stunden, Tagesablauf */
  const HALB = n => `halb ${n % 12 || 12}`;
  reg({
    id: 'uhr1', world: 'w1', emo: '⏰', title: 'Uhrzeit', strat: 'uhr', gem: 'Uhren-Expertin',
    desc: 'Volle und halbe Stunden, Tagesablauf', komp: 'Größen und Messen: Zeitpunkte ablesen (volle und halbe Stunden), Tagesablauf',
    gen(L) {
      const hh = rnd(1, 12);
      if (L === 1) {
        return {
          q: 'Wie spät ist es?', render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(hh, 0)),
          input: 'choice', choices: shuffle([`${hh} Uhr`, `${hh % 12 + 1} Uhr`, `${(hh + 10) % 12 + 1} Uhr`]), text: true, answer: `${hh} Uhr`,
          hint: 'Tipp: Der kurze Zeiger zeigt die Stunde.',
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, 0, { hlHour: true })); helpText(box, 'Der kurze rote Zeiger zeigt auf die ' + hh + '. Der lange steht oben: volle Stunde.'); },
          steps: [`Kurzer Zeiger auf ${hh}`, 'Langer Zeiger oben auf 12', `Es ist ${hh} Uhr`],
          analyze: () => 'zeiger'
        };
      }
      if (L === 2) {
        const ans = HALB(hh + 1), wrongHalb = HALB(hh);
        return {
          q: 'Wie spät ist es?', render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(hh, 30)),
          input: 'choice', choices: shuffle([ans, wrongHalb, `${hh} Uhr`]), text: true, answer: ans,
          hint: 'Tipp: Steht der lange Zeiger unten, ist es „halb“. Halb heißt: halb auf dem Weg zur nächsten Stunde.',
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, 30, { hlHour: true, hlMin: true })); helpText(box, `Der kurze Zeiger ist zwischen ${hh} und ${hh % 12 + 1}. Es ist halb auf dem Weg zur ${hh % 12 + 1}.`); },
          steps: ['Langer Zeiger unten: halb', `Kurzer Zeiger zwischen ${hh} und ${hh % 12 + 1}`, `Es ist ${ans}`],
          analyze: v => v === wrongHalb ? 'halb' : 'zeiger'
        };
      }
      if (L === 3) {
        const half = Math.random() < .5, label = half ? HALB(hh + 1) : `${hh} Uhr`, mm = half ? 30 : 0;
        const opts = shuffle([[hh, mm], half ? [hh + 1, 30] : [(hh + 5) % 12 + 1, 0], half ? [hh, 0] : [hh, 30]]);
        const key = a => a[0] % 12 + ':' + a[1];
        return {
          q: `Welche Uhr zeigt ${label}?`, input: 'choice', clocks: true, choices: opts.map(key), answer: key([hh, mm]),
          label: k => { const [a, b] = k.split(':').map(Number); return V.clockSVG(a, b); },
          hint: 'Tipp: Wo steht der lange Zeiger bei „halb“?',
          help(box) { box.insertAdjacentHTML('beforeend', V.clockSVG(hh, mm, { hlHour: true, hlMin: true })); helpText(box, `So sieht ${label} aus.`); },
          steps: [half ? 'Halb: langer Zeiger unten' : 'Volle Stunde: langer Zeiger oben', `Kurzer Zeiger bei der ${half ? hh + ' und ' + (hh % 12 + 1) : hh}`],
          analyze: v => half && v === key([hh + 1, 30]) ? 'halb' : 'zeiger'
        };
      }
      const day = pick([[7, 'morgens', '🥣', 'Frühstück'], [12, 'mittags', '🍝', 'Mittagessen'], [8, 'abends', '🌙', 'Schlafen gehen'], [3, 'nachmittags', '🛝', 'Spielplatz']]);
      const all = [['🥣', 'Frühstück'], ['🍝', 'Mittagessen'], ['🌙', 'Schlafen gehen'], ['🛝', 'Spielplatz']];
      return {
        q: `Es ist ${day[0]} Uhr ${day[1]}. Was passt?`, render: stage => stage.insertAdjacentHTML('beforeend', V.clockSVG(day[0], 0)),
        input: 'choice', text: true, choices: shuffle(all.map(a => a[0] + ' ' + a[1])).slice(0, 4), answer: day[2] + ' ' + day[3],
        hint: 'Tipp: Was machst du ' + day[1] + '?', help(box) { helpText(box, `${day[1]}: ${day[3]} ${day[2]}`); },
        steps: [`${day[0]} Uhr ${day[1]}`, `Da ist ${day[3]}`], analyze: () => 'sonst'
      };
    }
  });
})();
