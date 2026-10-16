/* Abenteuer-Karte mit Mission des Tages und den drei Welten. */
window.Screens = window.Screens || {};
(function () {
  const { h } = U;
  const app = () => document.getElementById('app');
  const WORLDS = [
    { id: 'w1', emo: '🐸', title: 'Der Zahlenfluss', sub: 'Klasse 1 · Zahlen bis 20', story: 'Fünferbanden, Zehnerfreunde, Sprünge über die 10, Kiosk und Uhr.' },
    { id: 'w2', emo: '🌉', title: 'Die Hängebrücke', sub: 'Brücke 1 → 2 · auf dem Weg zur 100', story: 'Zehner bündeln, große Zahlen lesen, kleine Aufgaben helfen großen.' },
    { id: 'w3', emo: '🏙️', title: 'Land der großen Zahlen', sub: 'Klasse 2 · Zahlen bis 100', story: 'Rechenstrich, Einmaleins, Markt mit Wechselgeld, Turmuhr.' }
  ];
  Screens.WORLDS = WORLDS;

  function levelDots(lvl) { return h('span.lvl', { 'aria-label': `Stufe ${lvl} von 4` }, [1, 2, 3, 4].map(i => h('i' + (i <= lvl ? '.on' : '')))); }

  Screens.map = function () {
    const st = Store.state, a = app(); a.innerHTML = '';
    const m = Coach.missionOfDay();
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: `Hallo ${st.name || 'Reporterin'}! 🎤` }), h('p.sub', { text: 'Wohin geht deine Reportage heute?' })]));
    // Mission des Tages
    const startMission = () => {
      if (m.type === 'training') Engine.start({ training: m, world: m.gap.skill.world });
      else Engine.start({ skills: [m.skill.id], world: m.skill.world });
    };
    a.appendChild(h('div.card.mission-day', {}, [
      h('div.md-icon', { text: m.type === 'training' ? '🆘' : m.skill.emo }),
      h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }, [
        h('h2', { text: m.type === 'training' ? 'Capy braucht deine Hilfe!' : 'Mission des Tages' }),
        h('p', { text: m.text }),
        m.type === 'training' ? h('p.muted', { text: 'Trainingsmission: doppelte Belohnung! 🎁🎁' }) : null,
        h('div.row', {}, [h('button.btn.big.lila', { text: 'Mission starten ▶', onclick: startMission })])
      ])
    ]));
    // Welten
    const grid = h('div.grid');
    WORLDS.forEach(w => {
      const r = Coach.worldReady(w.id), ch = st.chapters[w.id] || 0;
      const prog = Math.round((r.gems / r.total) * 100);
      const card = h('button.world-card.' + w.id, { onclick: () => Screens.world(w.id) }, [
        st.recommended === w.id ? h('span.tag', { text: '⭐ Empfohlen' }) : null,
        h('div.wc-emoji', { text: w.emo }), h('h3', { text: w.title }), h('p', { text: w.sub }),
        h('p.muted', { text: `💎 ${r.gems} von ${r.total} · 📖 ${ch} Kapitel` }),
        h('div.wc-bar', {}, [h('i', { style: `width:${Math.max(4, prog)}%` })])
      ]);
      grid.appendChild(card);
    });
    a.appendChild(grid);
    a.appendChild(h('div.grid', {}, [
      h('button.skill-tile', { onclick: () => Screens.films() }, [h('div.st-emoji', { text: '🎬' }), h('div', {}, [h('h3', { text: 'Capys Kino' }), h('div.st-meta', { text: 'Erklärfilme: Lernen, Zehnertrick, Uhr …' })])]),
      h('button.skill-tile', { onclick: () => App.breakDance(() => App.go('map')) }, [h('div.st-emoji', { text: '💃' }), h('div', {}, [h('h3', { text: 'Tanzpause' }), h('div.st-meta', { text: 'Bewegen wie die Tiere' })])]),
      h('button.skill-tile', { onclick: () => App.joke(() => { document.getElementById('overlay').hidden = true; }) }, [h('div.st-emoji', { text: '😂' }), h('div', {}, [h('h3', { text: 'Capy-Witz' }), h('div.st-meta', { text: 'Zum Lachen' })])])
    ]));
    if (!App.greeted) { App.greeted = true; Capy.say(m.type === 'training' ? m.text : Capy.phrase(st.sessions.length ? 'back' : 'start'), m.type === 'training' ? 'think' : 'happy'); }
  };

  Screens.world = function (wid) {
    const st = Store.state, w = WORLDS.find(x => x.id === wid), a = app(); a.innerHTML = '';
    const gapIds = Coach.gaps().map(g => g.skill.id);
    a.appendChild(h('div.world-head.' + wid, {}, [
      h('button.btn.soft', { text: '◀ Karte', style: 'min-height:52px', onclick: () => App.go('map') }),
      h('div', { style: 'min-width:0' }, [h('h1', { text: `${w.emo} ${w.title}` }), h('p.muted', { text: w.story })])
    ]));
    if (wid === 'w2') {
      // Brücke: jedes gemeisterte Thema und jedes Kapitel baut Bretter
      const planks = 20, built = Math.min(planks, (st.chapters.w2 || 0) * 2 + st.gems.filter(id => X.byId(id).world === 'w2').length * 2);
      a.appendChild(h('div.card', {}, [h('p', { style: 'font-family:var(--font)', text: `Brückenbretter: ${built} von ${planks}` }), h('div.bridge', {}, Array.from({ length: planks }, (_, i) => h('i' + (i < built ? '.on' : ''))))]));
    }
    const grid = h('div.grid');
    SKILLS.filter(s => s.world === wid).forEach(sk => {
      const stt = Coach.stat(sk.id), gem = Coach.isGem(sk.id), gap = gapIds.includes(sk.id);
      grid.appendChild(h('button.skill-tile' + (gap ? '.train' : ''), { onclick: () => Engine.start({ skills: [sk.id], world: wid }) }, [
        h('div.st-emoji', { text: sk.emo }),
        h('div', { style: 'min-width:0' }, [
          h('h3', { text: sk.title }),
          h('div.st-meta', {}, [levelDots(stt.level || 1), gem ? h('span', { text: '💎' }) : null, gap ? h('span', { text: '🆘 Capy braucht Hilfe' }) : null]),
          h('div.st-meta', { text: sk.desc })
        ])
      ]));
    });
    // Mix-Runde: alles aus dieser Welt gemischt (verteiltes Üben)
    const ids = SKILLS.filter(s => s.world === wid).map(s => s.id);
    grid.appendChild(h('button.skill-tile', { onclick: () => Engine.start({ skills: U.shuffle(ids), world: wid, count: 8 }) }, [
      h('div.st-emoji', { text: '🎲' }), h('div', {}, [h('h3', { text: 'Wilde Mischung' }), h('div.st-meta', { text: 'Von allem etwas, zum Wiederholen' })])
    ]));
    a.appendChild(grid);
    Capy.say(gapIds.some(id => ids.includes(id)) ? 'Bei den Aufgaben mit 🆘 brauche ich deine Hilfe!' : 'Such dir eine Reportage aus!', 'happy');
  };
})();
