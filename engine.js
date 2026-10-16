/* Engine: führt eine Lerneinheit durch.
   Gestufte Hilfe (Hinweis → Hilfe-Bild → gemeinsam rechnen + leichtere Aufgabe),
   Fehleranalyse, Anpassung der Stufe, Frust-Erkennung, garantierter Erfolg am Ende. */
window.Engine = (function () {
  const { h, wait } = U;
  let S = null; // laufende Sitzung

  /* ---------- Start ---------- */
  function start(opt) {
    const queue = [];
    if (opt.training) {
      const tr = opt.training;
      const pattern = ['s', 'g', 's', 's', 'g', 's', 'g', 's'];
      let gi = 0;
      pattern.forEach(p => {
        if (p === 'g' || !tr.strong.length) {
          const id = tr.focus[gi++ % tr.focus.length];
          queue.push({ id, lvl: Math.max(1, Store.skill(id).level - (p === 'g' ? 0 : 1)) });
        } else queue.push({ id: U.pick(tr.strong), lvl: null });
      });
    } else {
      const n = opt.count || 7;
      for (let i = 0; i < n; i++) queue.push({ id: opt.skills[i % opt.skills.length], lvl: null });
    }
    S = {
      opt, queue, idx: 0, results: {}, stars: 0, coins: 0, hardRow: 0, fastWrong: 0, pauses: 0,
      world: opt.world || X.byId(queue[0].id).world, training: !!opt.training
    };
    document.body.classList.add('in-session');
    ritual(() => next());
  }

  /* Startritual: Capy-Atmung */
  function ritual(go) {
    const ov = document.getElementById('overlay');
    const line = Coach.strengthLine();
    const skip = () => { ov.hidden = true; ov.innerHTML = ''; go(); };
    ov.innerHTML = '';
    ov.appendChild(h('div.modal', {}, [
      h('h2', { text: 'Capy-Atmung' }),
      h('div.breathe', { text: 'atmen' }),
      h('p', { text: 'Atme 3-mal tief ein und aus, mit dem Kreis zusammen.' }),
      h('button.btn.big', { text: 'Los geht\'s! 🚀', onclick: skip })
    ]));
    ov.hidden = false;
    Capy.say(line || Capy.phrase('start'), 'happy');
    if (S.training) setTimeout(() => Capy.say(U.t(U.pick(PHRASES.missionAsk), { mission: S.opt.training.mission }), 'think'), 4200);
  }

  /* ---------- Aufgaben ---------- */
  function next() {
    if (S.idx >= S.queue.length) return finish();
    const item = S.queue[S.idx];
    const sk = X.byId(item.id), st = Store.skill(item.id);
    const lvl = item.lvl || st.level;
    const task = sk.gen(lvl);
    S.cur = { item, sk, lvl, task, attempts: 0, helped: false, t0: Date.now(), done: false, value: '' };
    renderTask();
  }

  function renderTask() {
    const { task, sk } = S.cur;
    const app = document.getElementById('app');
    app.innerHTML = '';
    // Fortschrittspfad: Capy wandert zum Ziel
    const pct = Math.round(S.idx / S.queue.length * 100);
    const trail = h('div.trail', {}, [h('div.trail-fill', { style: `width:${pct}%` }), h('div.trail-capy', { html: Capy.svg({ mood: 'happy' }), style: `left:calc(${pct}% * .86)` }), h('div.trail-goal', { text: S.training ? '🏆' : '🍊' })]);
    const head = h('div.row', { style: 'justify-content:space-between' }, [
      h('button.btn.soft', { text: '✕ Pause', style: 'min-height:48px;font-size:1rem', onclick: () => pauseMenu(true) }),
      h('span.muted', { style: 'font-family:var(--font)', text: `${sk.emo} ${sk.title} · Stufe ${S.cur.lvl}` })
    ]);
    const card = h('div.card.task-card');
    const say = task.say || [task.q, task.eq].filter(Boolean).join(' ');
    card.appendChild(h('div.task-q', {}, [h('p', { text: task.q }), h('button.icon-btn.small', { text: '🔈', 'aria-label': 'Aufgabe vorlesen', onclick: () => Sound.speak(say, true) })]));
    if (task.eq) { S.eqEl = h('div.eq'); card.appendChild(S.eqEl); drawEq(); } else S.eqEl = null;
    const stage = h('div.stage'); card.appendChild(stage);
    const api = { submit: (v, el) => submit(v, el) };
    S.widget = task.render ? task.render(stage, api) : null;
    S.helpBox = h('div.helpbox', { hidden: true }); card.appendChild(S.helpBox);
    const ans = h('div.answer-area'); card.appendChild(ans);
    buildInput(ans);
    card.appendChild(h('div.task-tools', {}, [h('button.btn.lila', { text: '💡 Hilfe', onclick: () => { if (!S.cur.done) showHelp(true); } })]));
    app.append(head, trail, card);
    S.card = card;
    Capy.hide(); Capy.setMood('happy'); Capy.bounce(); Sound.speak(say);
    clearTimeout(S.idle);
    S.idle = setTimeout(() => { if (!S.cur.done) Capy.say('Alles gut? Wenn du magst, tipp auf Hilfe. Ich bin da!', 'comfort'); }, 45000);
  }

  function drawEq() {
    const t = S.cur.task.eq;
    if (!S.eqEl) return;
    S.eqEl.innerHTML = '';
    const parts = t.split('_');
    S.eqEl.append(parts[0]);
    if (parts.length > 1) { S.eqEl.appendChild(h('span.gap', { text: S.cur.task.input === 'numpad' ? (S.cur.value || '?') : '?' })); S.eqEl.append(parts[1]); }
  }

  function buildInput(box) {
    const { task } = S.cur;
    if (task.input === 'numpad') {
      if (!task.eq || !task.eq.includes('_')) { S.display = h('div.display', { text: '?' }); box.appendChild(S.display); } else S.display = null;
      const pad = h('div.numpad');
      const upd = () => { drawEq(); if (S.display) S.display.textContent = S.cur.value || '?'; };
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(d => pad.appendChild(h('button', { text: d, onclick: () => { if (S.cur.done) return; if (S.cur.value.length < 3) { S.cur.value += d; Sound.play('tap'); upd(); } } })));
      pad.appendChild(h('button.del', { text: '⌫', 'aria-label': 'Löschen', onclick: () => { S.cur.value = S.cur.value.slice(0, -1); upd(); } }));
      pad.appendChild(h('button.ok', { text: '✓', 'aria-label': 'Fertig', style: 'grid-column: span 4', onclick: () => { if (S.cur.value !== '' && !S.cur.done) submit(Number(S.cur.value)); } }));
      box.appendChild(pad);
    } else if (task.input === 'choice') {
      const wrap = h('div.choices' + (task.clocks ? '.clock-choices' : ''));
      task.choices.forEach(c => {
        const b = h('button.choice' + (task.text ? '.text' : ''), { onclick: () => { if (!S.cur.done && !b.classList.contains('wrong')) submit(c, b); } });
        if (task.label) b.innerHTML = task.label(c); else b.textContent = c;
        wrap.appendChild(b);
      });
      box.appendChild(wrap);
    } else if (task.input === 'widget') {
      box.appendChild(h('button.btn.big', { text: 'Fertig ✓', onclick: () => { if (!S.cur.done) submit(S.widget.getValue()); } }));
    }
  }

  /* ---------- Antwort prüfen ---------- */
  function isRight(v) {
    const t = S.cur.task;
    if (t.check) return t.check(v);
    return String(v) === String(t.answer);
  }

  // Fehlerart merken (für Förderplan und Trainingsmissionen)
  function recordError(code) {
    const s = Store.skill(S.cur.item.id);
    s.errors[code] = (s.errors[code] || 0) + 1;
    s.errLog = [...(s.errLog || []), code].slice(-30);
    Store.save();
  }
  // Ergebnis einer Aufgabe merken
  function record(firstTry, solved) {
    const id = S.cur.item.id, s = Store.skill(id);
    s.tries++; s.lastSeen = U.today();
    s.hist = [...(s.hist || []), firstTry ? 1 : 0].slice(-30);
    if (firstTry) s.first++;
    if (solved) s.solved++;
    s.days[U.today()] = (s.days[U.today()] || 0) + 1;
    const r = S.results[id] || (S.results[id] = { n: 0, first: 0, solved: 0 });
    r.n++; if (firstTry) r.first++; if (solved) r.solved++;
    // Stufe anpassen (nur wenn die Aufgabe auf der aktuellen Stufe war)
    if (S.cur.lvl === s.level) {
      if (firstTry) { s.streak = (s.streak || 0) + 1; s.down = 0; if (s.streak >= 3 && s.level < 4) { s.level++; s.streak = 0; S.levelUp = X.byId(id).title; } }
      else { s.streak = 0; s.down = (s.down || 0) + 1; if (s.down >= 2 && s.level > 1) { s.level--; s.down = 0; } }
    }
    Store.save();
  }

  async function submit(v, el) {
    const c = S.cur, t = c.task;
    clearTimeout(S.idle);
    const fast = Date.now() - c.t0 < 1500;
    if (isRight(v)) {
      c.done = true;
      const firstTry = c.attempts === 0 && !c.helped;
      record(firstTry, true);
      S.hardRow = 0;
      S.coins += firstTry ? 2 : 1; Store.state.coins += firstTry ? 2 : 1;
      const afterExplain = S.afterExplain; S.afterExplain = false;
      if (!firstTry || afterExplain) { S.stars++; Store.state.stars++; }
      Store.save();
      Sound.play('ok');
      const r = (el || S.card).getBoundingClientRect();
      U.sparkle(r.left + r.width / 2, r.top + Math.min(r.height / 2, 200));
      if (el) el.classList.add('picked');
      S.card.classList.add('pop');
      let msg;
      if (!firstTry || afterExplain) msg = Capy.phrase('comeback');
      else if (t.strat && PHRASES.strategy[t.strat] && Math.random() < .5) msg = U.pick(PHRASES.strategy[t.strat]);
      else msg = Capy.phrase('correct');
      if (S.levelUp) { msg += ' Du bist bereit für die nächste Stufe!'; S.levelUp = null; }
      Capy.say(msg, 'cheer');
      await wait(1700);
      if (S && S.cur === c) { S.idx++; next(); }
      return;
    }
    // falsch
    c.attempts++;
    if (fast) S.fastWrong++;
    const code = t.analyze ? t.analyze(v) : 'sonst';
    recordError(code || 'sonst');
    Sound.play('oops');
    if (el) el.classList.add('wrong');
    if (t.onWrong) t.onWrong(v, el);
    S.card.classList.remove('shake'); void S.card.offsetWidth; S.card.classList.add('shake');
    c.value = ''; drawEq(); if (S.display) S.display.textContent = '?';
    if (c.attempts === 1) Capy.say(Capy.phrase('wrong') + ' ' + (t.hint || ''), 'comfort');
    else if (c.attempts === 2) { showHelp(false); }
    else { await explain(); return; }
    if (S.fastWrong >= 3 && S.pauses < 2) { S.fastWrong = 0; pauseMenu(false); }
  }

  function showHelp(asked) {
    const c = S.cur;
    c.helped = true;
    const box = S.helpBox;
    if (c.task.help) {
      box.innerHTML = '';
      const res = c.task.help(box);
      if (typeof res === 'string') { box.hidden = true; Capy.say(res, 'think'); return; }
      box.hidden = false;
    }
    Capy.say(asked ? 'Klar! Hilfe holen ist eine super Strategie. Schau mal!' : 'Schau, ich hab dir eine Hilfe hingelegt.', 'think');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* Dritter Fehler: gemeinsam Schritt für Schritt, dann leichtere Aufgabe */
  async function explain() {
    const c = S.cur;
    c.done = true;
    record(false, false); // gezählt als nicht gelöst
    S.hardRow++; S.afterExplain = true;
    Capy.say(Capy.phrase('manyWrong'), 'comfort');
    const box = S.helpBox; box.innerHTML = ''; box.hidden = false;
    if (c.task.help && !c.task.reveal) { const r = c.task.help(box); if (typeof r === 'string') box.innerHTML = ''; }
    const steps = h('div.steps'); box.appendChild(steps);
    for (const [i, s] of (c.task.steps || []).entries()) {
      steps.appendChild(h('div', { text: s, style: `animation-delay:${i * .9}s` }));
    }
    if (c.task.reveal) c.task.reveal();
    else if (c.task.input !== 'widget' && !c.task.check) { c.value = String(c.task.answer); drawEq(); if (S.display) S.display.textContent = c.task.answer; }
    await wait(1200);
    Sound.speak((c.task.steps || []).join('. '));
    // leichtere Aufgabe direkt danach einschieben (garantiert Erfolg am Ende)
    if (S.queue.length < 14) S.queue.splice(S.idx + 1, 0, { id: c.item.id, lvl: Math.max(1, c.lvl - 1) });
    box.appendChild(h('button.btn.big', { text: 'Jetzt ich! ➜', onclick: () => {
      if (S.hardRow >= 2 && S.pauses < 2) { S.hardRow = 0; S.idx++; c.advance = true; pauseMenu(false); }
      else { S.idx++; next(); }
    } }));
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- Pausen ---------- */
  function pauseMenu(asked) {
    S.pauses++;
    const ov = document.getElementById('overlay');
    const close = () => { ov.hidden = true; ov.innerHTML = ''; };
    const resume = () => { close(); if (!S) return; Capy.say(Capy.phrase('back'), 'happy'); if (S.cur && S.cur.advance) { S.cur.advance = false; next(); } };
    ov.innerHTML = '';
    const modal = h('div.modal', {}, [
      h('div.big-emoji', { text: '🌴' }),
      h('h2', { text: asked ? 'Pause' : 'Kurze Pause?' }),
      h('p', { text: asked ? 'Was möchtest du machen?' : 'Das war gerade ganz schön knifflig. Dein Gehirn freut sich über eine Mini-Pause.' }),
      h('div.row', { style: 'justify-content:center' }, [
        h('button.btn', { text: '💃 Tanzpause', onclick: () => App.breakDance(resume) }),
        h('button.btn', { text: '😂 Witz', onclick: () => App.joke(resume) }),
        h('button.btn', { text: '🌬️ Atmen', onclick: () => App.breathe(resume) })
      ]),
      h('button.btn.lila', { text: 'Weiter rechnen', onclick: resume }),
      asked ? h('button.btn.soft', { text: 'Für heute aufhören', onclick: () => { close(); finish(true); } }) : null
    ]);
    ov.appendChild(modal); ov.hidden = false;
    Capy.say(asked ? 'Klar, Pause ist wichtig!' : U.pick(PHRASES.pauseOffer), 'comfort');
  }

  /* ---------- Abschluss ---------- */
  function finish(early) {
    clearTimeout(S.idle);
    document.body.classList.remove('in-session');
    const st = Store.state;
    const ids = Object.keys(S.results);
    const solved = ids.reduce((a, id) => a + S.results[id].solved, 0);
    if (early && solved === 0) { S = null; App.go('map'); return; }
    const news = Coach.afterSession(ids, S.results);
    // Geschenke: 1 Gegenstand, Trainingsmission 2
    if (S.training) { S.stars++; st.stars++; }
    const gifts = [];
    const pool = ITEMS.filter(i => i.gift && !st.items.includes(i.id));
    const n = S.training ? 2 : 1;
    for (let i = 0; i < n; i++) {
      if (pool.length) { const it = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; st.items.push(it.id); gifts.push(it); }
      else { st.coins += 5; S.coins += 5; }
    }
    // Kapitel freischalten (Training: Bonus-Kapitel)
    const w = S.world, before = st.chapters[w] || 0;
    st.chapters[w] = Math.min(STORIES[w].chapters.length, before + (S.training ? 2 : 1));
    const newChapters = st.chapters[w] - before;
    // Sonder-Belohnung bei geschlossener Lücke
    news.forEach(nw => { if (nw.closedGap) st.unlocked.push('special-' + nw.id); });
    const firstTotal = ids.reduce((a, id) => a + S.results[id].first, 0);
    st.sessions.push({ date: new Date().toISOString(), world: w, skills: ids, solved, first: firstTotal, tasks: ids.reduce((a, id) => a + S.results[id].n, 0), stars: S.stars, coins: S.coins, training: S.training, newGems: news.map(x => x.id) });
    Store.save();
    const summary = { solved, stars: S.stars, coins: S.coins, gifts, world: w, newChapters, news, training: S.training };
    S = null;
    Screens.end(summary);
  }

  /* ---------- Startcheck: kurze Einstufung ohne Bewertung ---------- */
  function startcheck() {
    const plan = [['blitz', 2], ['freunde', 3], ['plus20', 1], ['plus20', 3], ['minus20', 3], ['buendeln', 1], ['analogie', 2], ['plus100', 3], ['mal', 1]];
    let i = 0; const res = [];
    document.body.classList.add('in-session');
    const run = () => {
      if (i >= plan.length) return done();
      const [id, lvl] = plan[i], sk = X.byId(id), task = sk.gen(lvl);
      const app = document.getElementById('app'); app.innerHTML = '';
      const card = h('div.card.task-card');
      card.appendChild(h('p.muted', { text: `Aufgabe ${i + 1} von ${plan.length} · Du darfst auch „Weiß ich nicht“ drücken.` }));
      card.appendChild(h('div.task-q', {}, [h('p', { text: task.q })]));
      let val = '';
      const eq = task.eq ? h('div.eq') : null;
      const drawE = () => { if (!eq) return; const p = task.eq.split('_'); eq.innerHTML = ''; eq.append(p[0]); if (p.length > 1) { eq.appendChild(h('span.gap', { text: val || '?' })); eq.append(p[1]); } };
      if (eq) { card.appendChild(eq); drawE(); }
      const stage = h('div.stage'); card.appendChild(stage);
      const answer = v => { const ok = task.check ? task.check(v) : String(v) === String(task.answer); res.push({ id, lvl, ok }); if (!ok && task.analyze) { const s = Store.skill(id); const c = task.analyze(v); if (c) s.errLog = [...(s.errLog || []), c]; } Sound.play('tap'); Capy.say(U.pick(['Danke!', 'Super, weiter!', 'Notiert!', 'Toll gemacht!', 'Okay, nächste!']), 'happy', { ms: 1500 }); i++; setTimeout(run, 600); };
      const w = task.render ? task.render(stage, { submit: v => answer(v) }) : null;
      const box = h('div.answer-area');
      if (task.input === 'numpad') {
        const pad = h('div.numpad');
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(d => pad.appendChild(h('button', { text: d, onclick: () => { if (val.length < 3) { val += d; drawE(); } } })));
        pad.appendChild(h('button.del', { text: '⌫', onclick: () => { val = val.slice(0, -1); drawE(); } }));
        pad.appendChild(h('button.ok', { text: '✓', style: 'grid-column: span 4', onclick: () => val !== '' && answer(Number(val)) }));
        box.appendChild(pad);
      } else if (task.input === 'choice') {
        const wrap = h('div.choices'); task.choices.forEach(c => { const b = h('button.choice' + (task.text ? '.text' : ''), { onclick: () => answer(c) }); if (task.label) b.innerHTML = task.label(c); else b.textContent = c; wrap.appendChild(b); }); box.appendChild(wrap);
      } else if (task.input === 'widget') box.appendChild(h('button.btn.big', { text: 'Fertig ✓', onclick: () => answer(w.getValue()) }));
      box.appendChild(h('button.btn.soft', { text: 'Weiß ich nicht 🤷', onclick: () => { res.push({ id, lvl, ok: false }); i++; run(); } }));
      card.appendChild(box); app.appendChild(card);
      Sound.speak(task.say || [task.q, task.eq].filter(Boolean).join(' '));
    };
    const done = () => {
      document.body.classList.remove('in-session');
      res.forEach(r => { const s = Store.skill(r.id); if (r.ok) s.level = Math.max(s.level, Math.min(4, r.lvl + (r.lvl >= 2 ? 0 : 1))); });
      const k1 = res.slice(0, 5).filter(r => r.ok).length, k2 = res.slice(5).filter(r => r.ok).length;
      const rec = k1 <= 3 ? 'w1' : k2 <= 2 ? 'w2' : 'w3';
      Store.state.recommended = rec; Store.state.startcheckDone = true; Store.save();
      Screens.startcheckResult(rec, k1, k2);
    };
    Capy.say('Ich will wissen, was du schon kannst. Das ist kein Test, nur zum Kennenlernen!', 'happy');
    run();
  }

  return { start, startcheck, get active() { return !!S; }, get current() { return S && S.cur; } };
})();
