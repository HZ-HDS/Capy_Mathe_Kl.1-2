/* WELT 2 – Brücke von Klasse 1 zu Klasse 2
   Bündeln, Zahlen bis 100 lesen, Analogien, Hundertertafel, Ergänzen zum Zehner. */
(function () {
  const { h, rnd, pick, shuffle } = U;
  const { reg, analyzeNum, distract, helpText } = X;

  /* 8) Bündeln: Zehner und Einer */
  reg({
    id: 'buendeln', world: 'w2', emo: '🪵', title: 'Zehner bündeln', strat: 'stelle', gem: 'Bündel-Meisterin',
    desc: 'Zehnerstangen und Einer, Zahlen bis 100 bauen', komp: 'Stellenwertverständnis: Bündeln und Entbündeln, Zehner und Einer',
    gen(L) {
      if (L === 1 || L === 3) {
        const t = L === 1 ? rnd(1, 5) : rnd(2, 9), o = rnd(0, 9), n = 10 * t + o;
        return {
          q: 'Welche Zahl ist das?', render: stage => stage.appendChild(V.tensOnes(t, o)),
          input: L === 1 ? 'choice' : 'numpad', choices: L === 1 ? distract(n, [10 * o + t, n + 10, n - 1], 3, 1, 99) : null, answer: n,
          hint: 'Tipp: Jede Stange ist ein Zehner. Erst die Zehner, dann die Einer.',
          help(box) { box.appendChild(V.zeTafel(t, o)); helpText(box, `${t} Zehner und ${o} Einer`); },
          steps: [`${t} Zehner = ${10 * t}`, `${o} Einer = ${o}`, `${10 * t} + ${o} = ${n}`],
          analyze: v => analyzeNum(v, n)
        };
      }
      if (L === 2) {
        const n = rnd(12, 59);
        let t = 0, o = 0, stageRef;
        return {
          q: `Baue die Zahl ${n}!`, say: `Baue die Zahl ${U.zahlwort(n)}. Nimm Zehnerstangen und Einer.`, eq: String(n),
          render(stage) {
            const area = h('div');
            const draw = () => {
              area.innerHTML = '';
              area.appendChild(V.tensOnes(t, o, { onTen: () => { t--; Sound.play('tap'); draw(); }, onOne: () => { o--; Sound.play('tap'); draw(); } }));
              if (o >= 10) area.appendChild(h('button.btn.lila', { text: '10 Einer bündeln!', onclick: () => { o -= 10; t++; Sound.play('ok'); draw(); } }));
            };
            draw();
            stage.append(area, h('div.row', { style: 'justify-content:center' }, [
              h('button.btn.soft', { text: '+ Zehner', onclick: () => { if (t < 9) { t++; Sound.play('tap'); draw(); } } }),
              h('button.btn.soft', { text: '+ Einer', onclick: () => { if (o < 19) { o++; Sound.play('tap'); draw(); } } })
            ]), h('p.muted', { text: 'Antippen nimmt ein Teil wieder weg.' }));
            stageRef = stage;
            return { getValue: () => 10 * t + o };
          },
          input: 'widget', answer: n,
          hint: `Tipp: ${n} hat ${Math.floor(n / 10)} Zehner. Die erste Ziffer sagt die Zehner.`,
          help(box) { box.appendChild(V.zeTafel(Math.floor(n / 10), n % 10)); },
          steps: [`${n} = ${Math.floor(n / 10)} Zehner und ${n % 10} Einer`],
          analyze: v => analyzeNum(v, n)
        };
      }
      const t = rnd(1, 5), o = rnd(11, 18), n = 10 * t + o;
      return {
        q: `${t} Zehner und ${o} Einer. Welche Zahl ist das?`, render: stage => stage.appendChild(V.tensOnes(t, o)),
        input: 'numpad', answer: n,
        hint: 'Tipp: 10 Einer kannst du zu einem Zehner bündeln!',
        help(box) { box.appendChild(V.tensOnes(t + 1, o - 10)); helpText(box, `10 Einer gebündelt: jetzt ${t + 1} Zehner und ${o - 10} Einer.`); },
        steps: [`${o} Einer = 1 Zehner und ${o - 10} Einer`, `${t + 1} Zehner und ${o - 10} Einer`, `= ${n}`],
        analyze: v => analyzeNum(v, n, { crossing: true })
      };
    }
  });

  /* 9) Analogieaufgaben: kleine Aufgabe hilft bei großer */
  reg({
    id: 'analogie', world: 'w2', emo: '🔗', title: 'Kleine hilft Großer', strat: 'reihe', gem: 'Trick-Finderin',
    desc: 'Analogien: 3 + 4 hilft bei 33 + 4', komp: 'Operationsverständnis: Analogien nutzen, Zehnerzahlen addieren und subtrahieren',
    gen(L) {
      let base, q, ans, other, small;
      if (L <= 2 || L === 4 && Math.random() < .5) {
        const minus = L === 4;
        const a = minus ? rnd(5, 9) : rnd(1, 7), b = minus ? rnd(1, a - 1) : rnd(1, 9 - a);
        const T = L === 1 ? 1 : rnd(2, 8);
        small = minus ? `${a} − ${b} = ${a - b}` : `${a} + ${b} = ${a + b}`;
        q = minus ? `${10 * T + a} − ${b} = _` : `${10 * T + a} + ${b} = _`;
        ans = minus ? 10 * T + a - b : 10 * T + a + b; other = minus ? 10 * T + a + b : 10 * T + a - b;
        base = { a, b, T, minus };
      } else {
        const minus = L === 4;
        const a = minus ? rnd(4, 9) : rnd(1, 7), b = minus ? rnd(1, a - 1) : rnd(1, 9 - a);
        small = minus ? `${a} − ${b} = ${a - b}` : `${a} + ${b} = ${a + b}`;
        q = minus ? `${a}0 − ${b}0 = _` : `${a}0 + ${b}0 = _`;
        ans = minus ? 10 * (a - b) : 10 * (a + b); other = minus ? 10 * (a + b) : 10 * Math.abs(a - b);
        base = { a, b, tens: true, minus };
      }
      return {
        q: 'Die kleine Aufgabe hilft dir!', eq: q,
        render: stage => stage.appendChild(h('div.price-tag', { style: 'font-size:1.8rem' }, [h('span.emo', { text: '💡' }), small])),
        input: 'numpad', answer: ans,
        hint: base.tens ? 'Tipp: Rechne mit Zehnern wie mit Einern: 3 Zehner + 4 Zehner.' : 'Tipp: Die Zehner bleiben gleich. Nur die Einer ändern sich.',
        help(box) {
          if (base.tens) { box.appendChild(V.tensOnes(base.a, 0)); helpText(box, `${base.a} Zehner ${base.minus ? '−' : '+'} ${base.b} Zehner`); }
          else { box.appendChild(V.zeTafel(base.T, base.a)); helpText(box, `Die ${base.T} Zehner bleiben. Rechne nur ${small.split(' =')[0]}.`); }
        },
        steps: base.tens ? [small, `Also: ${q.replace('_', ans)}`] : [small, `${base.T} Zehner bleiben`, q.replace('_', ans)],
        analyze: v => analyzeNum(v, ans, { other })
      };
    }
  });

  /* 10) Hundertertafel: Zahlen finden, Nachbarn, Zehnersprünge */
  reg({
    id: 'hunderter', world: 'w2', emo: '💯', title: 'Hundertertafel', strat: 'stelle', gem: 'Hunderter-Entdeckerin',
    desc: 'Orientierung bis 100, Nachbarzahlen', komp: 'Zahlenraum bis 100: Orientierung an der Hundertertafel, Nachbarzahlen, Zehnersprünge',
    gen(L) {
      let n, q, say;
      if (L === 1) { n = rnd(1, 40); q = `Tippe auf die ${n}!`; say = `Tippe auf die ${U.zahlwort(n)}!`; }
      else if (L === 2) { n = rnd(41, 99); q = `Tippe auf die ${n}!`; say = `Tippe auf die ${U.zahlwort(n)}!`; }
      else if (L === 3) { const b = rnd(12, 98), up = Math.random() < .5; n = up ? b + 1 : b - 1; q = `Tippe auf die Zahl, die 1 ${up ? 'mehr' : 'weniger'} ist als ${b}!`; }
      else { const b = rnd(15, 85), up = Math.random() < .5; n = up ? b + 10 : b - 10; q = `Tippe auf die Zahl, die 10 ${up ? 'mehr' : 'weniger'} ist als ${b}!`; }
      let tafel;
      return {
        q, say,
        render(stage, api) {
          tafel = h('div.hundert');
          for (let i = 1; i <= 100; i++) {
            const b = h('button' + (i % 10 === 5 || i % 10 === 0 ? '.five' : ''), { text: i, onclick: () => { Sound.play('tap'); api.submit(i, b); } });
            tafel.appendChild(b);
          }
          stage.appendChild(tafel);
        },
        input: 'direct', answer: n,
        onWrong(v, btn) { btn && btn.classList.add('miss'); },
        hint: L === 4 ? 'Tipp: 10 mehr ist genau eine Reihe darunter.' : 'Tipp: Die Zehner sagen dir die Reihe.',
        help() {
          const row = Math.ceil(n / 10);
          [...tafel.children].forEach((b, i) => { if (Math.ceil((i + 1) / 10) === row) b.classList.add('row-hl'); });
          return `Die ${n} ist in der hellen Reihe.`;
        },
        steps: [`Die ${n} hat ${Math.floor(n / 10)} Zehner und ${n % 10} Einer`, 'Ich zeige sie dir!'],
        reveal() { tafel.children[n - 1].classList.add('hit'); },
        analyze: v => analyzeNum(v, n)
      };
    }
  });

  /* 11) Ergänzen zum nächsten Zehner und bis 100 */
  reg({
    id: 'ergaenzen', world: 'w2', emo: '🌉', title: 'Bis zum Zehner', strat: 'zehner', gem: 'Brückenbauerin',
    desc: 'Ergänzen zum nächsten Zehner und bis 100', komp: 'Ergänzen als Grundlage für den Zehnerübergang bis 100',
    gen(L) {
      let n, target, jumps;
      if (L <= 2) { n = L === 1 ? rnd(11, 39) : rnd(41, 98); if (n % 10 === 0) n++; target = Math.ceil(n / 10) * 10; jumps = [target - n]; }
      else if (L === 3) { n = Math.random() < .5 ? rnd(2, 9) * 10 : rnd(51, 97); if (n % 10 === 0 && n > 90) n = 70; target = 100; jumps = n % 10 ? [Math.ceil(n / 10) * 10 - n, 100 - Math.ceil(n / 10) * 10] : [100 - n]; }
      else { n = rnd(23, 87); if (n % 10 === 0) n += 3; const up = Math.ceil(n / 10) * 10; target = up + rnd(1, 8); jumps = [up - n, target - up]; }
      const ans = target - n;
      return {
        q: target === 100 ? 'Wie viel fehlt bis 100?' : 'Wie viel fehlt?', eq: `${n} + _ = ${target}`, input: 'numpad', answer: ans,
        hint: jumps.length > 1 ? `Tipp: Spring erst bis zur ${Math.ceil(n / 10) * 10}.` : 'Tipp: Schau auf die Einer. Was fehlt bis zur 10?',
        help(box) { box.appendChild(V.strich(n, jumps.map(j => j))); helpText(box, 'Die Sprünge zusammen sind die Lösung.'); },
        steps: jumps.length > 1 ? [`${n} + ${jumps[0]} = ${n + jumps[0]}`, `${n + jumps[0]} + ${jumps[1]} = ${target}`, `${jumps[0]} + ${jumps[1]} = ${ans}`] : [`${n} + ${ans} = ${target}`],
        analyze: v => analyzeNum(v, ans, { crossing: true })
      };
    }
  });
})();
