/* Belohnungen: Abschluss einer Einheit, Capys Zimmer und Shop, Geschichten, Schatzkammer mit PDFs. */
window.Screens = window.Screens || {};
(function () {
  const { h } = U;
  const app = () => document.getElementById('app');
  const item = id => ITEMS.find(i => i.id === id);

  // Kreativ-PDFs werden nach und nach freigeschaltet (Anzahl Einheiten)
  const CREATIVE = [
    { id: 'coloring', need: 1, emo: '🖍️', title: 'Capy-Ausmalbild', fn: () => PDF.coloring(Store.state.sessions.length) },
    { id: 'craft', need: 2, emo: '✂️', title: 'Bastelidee der Jahreszeit', fn: () => PDF.craft() },
    { id: 'song', need: 3, emo: '🎶', title: 'Lied zum Mitklatschen', fn: () => PDF.song() },
    { id: 'experiment', need: 4, emo: '🔬', title: 'Experiment für Forscherinnen', fn: () => PDF.experiment() },
    { id: 'steckbrief', need: 5, emo: '🎤', title: 'Tier-Steckbrief', fn: () => PDF.steckbrief() },
    { id: 'clock', need: 6, emo: '⏰', title: 'Bastel-Uhr', fn: () => PDF.clockCraft() },
    { id: 'money', need: 7, emo: '💶', title: 'Spielgeld für den Kaufladen', fn: () => PDF.playMoney() }
  ];
  async function makePdf(btn, fn) {
    const old = btn.innerHTML; btn.disabled = true; btn.querySelector('h3') && (btn.querySelector('h3').textContent = 'Wird gemalt …');
    try { await fn(); Capy.say('Fertig! Du findest dein PDF jetzt zum Ausdrucken.', 'cheer'); }
    catch (e) { Capy.say('Hoppla, das PDF hat nicht geklappt. Probier es nochmal.', 'comfort'); }
    btn.disabled = false; btn.innerHTML = old;
  }

  /* ---------- Abschluss einer Einheit ---------- */
  Screens.end = function (sum) {
    const a = app(); a.innerHTML = '';
    const st = Store.state;
    Sound.play('win'); U.sparkle(null, null, 30);
    const newCreative = CREATIVE.find(c => c.need === st.sessions.length);
    const cards = [
      h('div.card.center', {}, [h('div.big-emoji', { text: '✅' }), h('h3', { text: `${sum.solved} Aufgaben gelöst` })]),
      h('div.card.center', {}, [h('div.big-emoji', { text: '⭐' }), h('h3', { text: `${sum.stars} Mutmach-Sterne` }), h('p.muted', { text: 'für Dranbleiben und Hilfe holen' })]),
      h('div.card.center', {}, [h('div.big-emoji', { text: '🪙' }), h('h3', { text: `+${sum.coins} Capy-Geld` })])
    ];
    a.appendChild(h('div.card.center', {}, [
      h('div', { html: Capy.svg({ mood: 'cheer', hat: st.items.includes('mandarine') }), style: 'width:150px' }),
      h('h1', { text: sum.training ? 'Mission erfüllt! Du hast Capy gerettet!' : 'Reportage geschafft!' })
    ]));
    // Edelsteine / geschlossene Lücken: große Feier
    sum.news.forEach(n => {
      const sk = X.byId(n.id);
      a.appendChild(h('div.card.center', { style: 'background:linear-gradient(135deg,#fff,#efe6fd);border:4px solid #ffc94d' }, [
        h('div.big-emoji', { text: '💎' }),
        h('h2', { text: `Neuer Edelstein: ${sk.gem}!` }),
        h('p', { text: n.closedGap ? 'Das war mal knifflig für dich, und jetzt kannst du es sicher. Du hast eine Lücke geschlossen! Dafür gibt es ein Sonder-Ausmalbild in deinen Schätzen.' : `Du kannst „${sk.title}“ jetzt richtig sicher. Ab in die Schatzkiste!` })
      ]));
      setTimeout(() => Capy.bounce('dance'), 600);
    });
    a.appendChild(h('div.grid', {}, cards));
    // Geschenke
    if (sum.gifts.length) a.appendChild(h('div.card.center', {}, [
      h('h2', { text: sum.gifts.length > 1 ? 'Zwei Geschenke für Capys Zimmer!' : 'Ein Geschenk für Capys Zimmer!' }),
      h('div.row', { style: 'justify-content:center' }, sum.gifts.map(g => h('div.shop-item.owned', {}, [h('div.si-emo', { text: g.emo }), h('b', { text: g.name })]))),
      h('button.btn', { text: '🏡 Ins Zimmer stellen', onclick: () => App.go('room') })
    ]));
    const row = [];
    if (sum.newChapters) row.push(h('button.btn.lila', { text: `📖 Neues Kapitel lesen`, onclick: () => Screens.story(sum.world, (st.chapters[sum.world] || 1) - 1) }));
    if (newCreative) row.push(h('button.btn.lila', { text: `${newCreative.emo} Neu: ${newCreative.title}`, onclick: () => App.go('treasure') }));
    if (row.length) a.appendChild(h('div.row', { style: 'justify-content:center' }, row));
    // Selbstreflexion mit Smileys
    const refl = { date: U.today() };
    const q = (key, text, opts) => h('div.rq', {}, [h('p', { style: 'font-family:var(--font);font-size:1.15rem', text }), h('div.smileys', {}, opts.map(([e, v]) => {
      const b = h('button', { text: e, 'aria-label': v, onclick: () => { refl[key] = v; b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); Sound.play('tap'); save(); } });
      return b;
    }))]);
    const save = () => { const rs = Store.state.reflections; if (rs.length && rs[rs.length - 1].date === refl.date && rs[rs.length - 1]._s === Store.state.sessions.length) rs[rs.length - 1] = { ...refl, _s: Store.state.sessions.length }; else rs.push({ ...refl, _s: Store.state.sessions.length }); Store.state.reflections = rs.slice(-60); Store.save(); };
    a.appendChild(h('div.card.reflect', {}, [
      h('h3', { text: 'Wie war es für dich?', style: 'text-align:center' }),
      q('easy', 'War es leicht oder knifflig?', [['😎', 'leicht'], ['🙂', 'mittel'], ['🤯', 'knifflig']]),
      q('feel', 'Wie fühlst du dich?', [['😄', 'super'], ['😐', 'okay'], ['😴', 'müde'], ['😣', 'genervt']])
    ]));
    a.appendChild(h('div.row', { style: 'justify-content:center' }, [
      h('button.btn', { text: '💃 Tanzpause', onclick: () => App.breakDance(() => {}) }),
      h('button.btn', { text: '😂 Witz', onclick: () => App.joke(() => {}) }),
      h('button.btn.big.lila', { text: 'Zur Karte 🗺️', onclick: () => App.go('map') })
    ]));
    Capy.say(Capy.phrase('end'), 'cheer');
  };

  /* ---------- Capys Zimmer und Shop ---------- */
  Screens.room = function () {
    const st = Store.state, a = app(); a.innerHTML = '';
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: `🏡 ${st.buddy}s Zimmer` }), h('p.sub', { text: 'Zieh die Sachen dorthin, wo sie hinsollen. Ganz nach unten ziehen räumt sie weg.' })]));
    const room = h('div.room', {}, [h('div.room-capy', { html: Capy.svg({ mood: 'happy', hat: !!st.room.mandarine }) })]);
    const shelf = h('div.row');
    const draw = () => {
      room.querySelectorAll('.item').forEach(e => e.remove());
      Object.entries(st.room).forEach(([id, p]) => {
        const it = item(id); if (!it) return;
        const el = h('div.item', { text: it.emo, style: `left:${p.x}%;top:${p.y}%`, 'aria-label': it.name });
        el.addEventListener('pointerdown', e => {
          el.setPointerCapture(e.pointerId);
          const r = room.getBoundingClientRect();
          const mv = ev => { p.x = Math.max(4, Math.min(96, (ev.clientX - r.left) / r.width * 100)); p.y = Math.max(4, Math.min(110, (ev.clientY - r.top) / r.height * 100)); el.style.left = p.x + '%'; el.style.top = Math.min(96, p.y) + '%'; };
          const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); if (p.y > 100) delete st.room[id]; Store.save(); draw(); };
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
        });
        room.appendChild(el);
      });
      shelf.innerHTML = '';
      const loose = st.items.filter(id => !st.room[id]);
      if (!loose.length) shelf.appendChild(h('p.muted', { text: st.items.length ? 'Alles steht im Zimmer.' : 'Nach jeder Reportage bekommst du ein Geschenk für Capy.' }));
      loose.forEach(id => { const it = item(id); if (it) shelf.appendChild(h('button.shop-item', { style: 'min-height:96px;min-width:96px', onclick: () => { st.room[id] = { x: 15 + Math.random() * 70, y: 25 + Math.random() * 60 }; Sound.play('tap'); Store.save(); draw(); } }, [h('div.si-emo', { text: it.emo }), h('span', { text: it.name })])); });
    };
    a.append(room, h('div.card', {}, [h('h3', { text: 'Noch nicht im Zimmer (antippen)' }), shelf]));
    draw();
    // Shop: mit Capy-Geld bezahlen, Capy rechnet laut mit
    const shop = h('div.grid');
    let pending = null;
    ITEMS.filter(i => i.price).forEach(it => {
      const owned = st.items.includes(it.id);
      const b = h('button.shop-item' + (owned ? '.owned' : ''), {}, [h('div.si-emo', { text: it.emo }), h('b', { text: it.name }), h('span', { text: owned ? '✓ gehört dir' : `🪙 ${it.price}` })]);
      b.onclick = () => {
        if (owned) return;
        if (st.coins < it.price) { Capy.say(`Du hast ${st.coins} Capy-Geld. ${it.name} kostet ${it.price}. Es fehlen noch ${it.price - st.coins}. Noch ein paar Reportagen!`, 'think'); return; }
        if (pending !== it.id) { pending = it.id; Capy.say(`Du hast ${st.coins}. ${it.name} kostet ${it.price}. Dann bleiben dir ${st.coins - it.price}. Nochmal tippen zum Kaufen!`, 'think'); b.lastChild.textContent = 'Kaufen? Tippen ✓'; return; }
        st.coins -= it.price; st.items.push(it.id); Store.save(); Sound.play('coin'); U.sparkle();
        Capy.say(`Juhu, ${it.name}! Danke!`, 'cheer'); Screens.room();
      };
      shop.appendChild(b);
    });
    a.appendChild(h('div.card', {}, [h('h2', { text: `🛍️ Capy-Laden · du hast 🪙 ${st.coins}` }), h('p.muted', { text: 'Capy-Geld verdienst du mit jeder gelösten Aufgabe.' }), shop]));
    Capy.say(st.items.length ? 'Mein Zimmer! Richte es schön für mich ein.' : 'Mein Zimmer ist noch leer. Nach jeder Reportage bekommst du ein Geschenk für mich!', 'happy');
  };

  /* ---------- Geschichten ---------- */
  Screens.stories = function () {
    const st = Store.state, a = app(); a.innerHTML = '';
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: '📖 Capys Geschichten' }), h('p.sub', { text: 'Nach jeder Reportage wird ein neues Kapitel frei.' })]));
    ['w1', 'w2', 'w3'].forEach(w => {
      const story = STORIES[w], open = st.chapters[w] || 0;
      const list = h('div.grid');
      story.chapters.forEach((c, i) => {
        const ok = i < open;
        list.appendChild(h('button.chapter' + (ok ? '' : '.locked'), { onclick: () => ok ? Screens.story(w, i) : Capy.say('Dieses Kapitel ist noch verschlossen. Mach eine Reportage in dieser Welt!', 'think') }, [
          h('div.ch-emo', { text: ok ? c.pic.slice(0, 2) : '🔒' }), h('div', {}, [h('b', { text: `Kapitel ${i + 1}` }), h('p', { text: ok ? U.t(c.title) : '???' })])
        ]));
      });
      a.appendChild(h('div.card', {}, [h('h2', { text: U.t(story.title) }), h('p.muted', { style: 'margin-block:6px 12px', text: `${open} von ${story.chapters.length} Kapiteln` }), list]));
    });
    Capy.say('Welche Geschichte wollen wir lesen?', 'happy');
  };
  Screens.story = function (w, i) {
    const c = STORIES[w].chapters[i], a = app(); a.innerHTML = '';
    const text = U.t(c.text);
    const open = Store.state.chapters[w] || 0;
    a.appendChild(h('div.card.center', {}, [
      h('p.muted', { text: `${U.t(STORIES[w].title)} · Kapitel ${i + 1}` }),
      h('div.story-pic', { text: c.pic }),
      h('h1', { text: U.t(c.title) }),
      h('p.story-text', { style: 'text-align:left', text }),
      h('div.row', { style: 'justify-content:center' }, [
        h('button.btn.lila', { text: '🔈 Vorlesen', onclick: () => Sound.speak(text, true) }),
        i > 0 ? h('button.btn.soft', { text: '◀ Kapitel davor', onclick: () => Screens.story(w, i - 1) }) : null,
        i + 1 < open ? h('button.btn.soft', { text: 'Nächstes ▶', onclick: () => Screens.story(w, i + 1) }) : null,
        h('button.btn', { text: 'Alle Geschichten', onclick: () => App.go('stories') })
      ])
    ]));
    Sound.speak(U.t(c.title) + '. ' + text);
    Capy.hide();
  };

  /* ---------- Schatzkammer ---------- */
  Screens.treasure = function () {
    const st = Store.state, a = app(); a.innerHTML = '';
    const n = st.sessions.length;
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: '💎 Deine Schätze' }), h('p.sub', { text: `${st.stars} Mutmach-Sterne · ${st.gems.length} Edelsteine · ${n} Reportagen` })]));
    // Stärken-Schatzkiste
    a.appendChild(h('div.card', {}, [
      h('h2', { text: 'Stärken-Schatzkiste' }), h('p.muted', { style: 'margin-block:6px 12px', text: 'Ein Edelstein kommt hinein, wenn du ein Thema an zwei verschiedenen Tagen sicher kannst.' }),
      h('div.gem-chest', {}, SKILLS.map(sk => h('div.gem' + (st.gems.includes(sk.id) ? '' : '.empty'), {}, [h('span.g', { text: st.gems.includes(sk.id) ? '💎' : sk.emo }), h('span', { text: st.gems.includes(sk.id) ? sk.gem : sk.title })])))
    ]));
    // Reporter-Ausweis
    const badge = w => { const k = st.sessions.filter(s => s.world === w).length; return k >= 15 ? '🥇' : k >= 7 ? '🥈' : k >= 2 ? '🥉' : '⚪'; };
    a.appendChild(h('div.card', { style: 'background:linear-gradient(135deg,#dcf1ff,#f0e6ff)' }, [
      h('div.row', {}, [h('div', { html: Capy.svg({ mood: 'happy' }), style: 'width:90px' }), h('div', {}, [h('h2', { text: 'Reporter-Ausweis' }), h('p', { text: `Name: ${st.name} · Buddy: ${st.buddy} · seit ${new Date(st.created).toLocaleDateString('de-DE')}` })])]),
      h('div.row', { style: 'margin-top:12px' }, Screens.WORLDS.map(w => h('span.counter', { text: `${badge(w.id)} ${w.title}` })))
    ]));
    // Kreativ-PDFs
    const grid = h('div.grid');
    CREATIVE.forEach(c => {
      const ok = n >= c.need;
      const b = h('button.skill-tile', { onclick: () => ok ? makePdf(b, c.fn) : Capy.say(`Noch ${c.need - n} Reportage${c.need - n > 1 ? 'n' : ''}, dann gehört dir das!`, 'think') }, [
        h('div.st-emoji', { text: ok ? c.emo : '🔒' }), h('div', {}, [h('h3', { text: c.title }), h('div.st-meta', { text: ok ? 'PDF zum Ausdrucken' : `ab ${c.need} Reportagen` })])
      ]);
      grid.appendChild(b);
    });
    st.unlocked.filter(u => u.startsWith('special-')).forEach(u => {
      const sk = X.byId(u.slice(8)); if (!sk) return;
      const b = h('button.skill-tile', { onclick: () => makePdf(b, () => PDF.coloring(7)) }, [h('div.st-emoji', { text: '🌟' }), h('div', {}, [h('h3', { text: `Sonder-Ausmalbild: ${sk.gem}` }), h('div.st-meta', { text: 'Weil du eine Lücke geschlossen hast!' })])]);
      grid.appendChild(b);
    });
    a.appendChild(h('div.card', {}, [h('h2', { text: '🎁 Malen, Basteln, Singen' }), h('p.muted', { style: 'margin-block:6px 12px', text: 'Mit jeder Reportage wird etwas Neues frei.' }), grid]));
    // Capy-Brief und Urkunden
    const docs = h('div.grid');
    const letterBtn = h('button.skill-tile', { onclick: () => { if (!n) { Capy.say('Nach deiner ersten Reportage schreibe ich dir einen Brief!', 'happy'); return; } const p = Coach.weekSummary(); Capy.say(`Liebe ${st.name}, ` + p.slice(0, 2).join(' '), 'comfort', { ms: 14000 }); makePdf(letterBtn, () => PDF.letter(p)); } }, [h('div.st-emoji', { text: '💌' }), h('div', {}, [h('h3', { text: 'Capy-Brief der Woche' }), h('div.st-meta', { text: 'Was du diese Woche geschafft hast' })])]);
    docs.appendChild(letterBtn);
    Screens.WORLDS.forEach(w => {
      const r = Coach.worldReady(w.id), ok = r.gems >= Math.ceil(r.total / 2);
      const b = h('button.skill-tile', { onclick: () => ok ? makePdf(b, () => PDF.certificate(w.id)) : Capy.say(`Für die Urkunde brauchst du ${Math.ceil(r.total / 2)} Edelsteine aus dieser Welt. Du hast schon ${r.gems}!`, 'think') }, [
        h('div.st-emoji', { text: ok ? '🏅' : '🔒' }), h('div', {}, [h('h3', { text: `Urkunde: ${w.title}` }), h('div.st-meta', { text: `💎 ${r.gems} von ${Math.ceil(r.total / 2)} nötig` })])
      ]);
      docs.appendChild(b);
    });
    a.appendChild(h('div.card', {}, [h('h2', { text: '📜 Briefe und Urkunden' }), docs]));
    Capy.say(st.gems.length ? `Schau mal, ${st.gems.length} Edelsteine! Du wirst immer stärker.` : 'Hier sammeln wir deine Schätze. Die ersten kommen bald!', 'happy');
  };
})();
