/* Coach: die regelbasierte Lernlogik hinter Capy.
   Erkennt Stärken und Lücken, schlägt Trainingsmissionen vor, entscheidet über Edelsteine.
   Alles nachvollziehbar, ohne KI, direkt im Browser. */
window.Coach = (function () {
  const MIN_TRIES = 5;

  function stat(id) {
    const s = Store.state.skills[id];
    if (!s || !s.hist || !s.hist.length) return { tries: 0, rate: null, recent: null, level: s ? s.level : 1 };
    const recent = s.hist.slice(-10);
    return {
      tries: s.tries, level: s.level,
      rate: s.first / Math.max(1, s.tries),
      recent: recent.reduce((a, b) => a + b, 0) / recent.length,
      errors: s.errors, goodDays: (s.goodDays || []).length
    };
  }
  const isGem = id => Store.state.gems.includes(id);

  // Stärken: Edelsteine oder sicher gelöst
  function strengths() {
    return SKILLS.filter(sk => { const s = stat(sk.id); return isGem(sk.id) || (s.tries >= MIN_TRIES && s.recent >= .8); });
  }
  // Lücken: oft geübt, aber noch unsicher. Mit häufigstem Fehlertyp.
  function gaps() {
    const out = [];
    SKILLS.forEach(sk => {
      const s = stat(sk.id), raw = Store.state.skills[sk.id];
      if (s.tries < MIN_TRIES || s.recent >= .65) return;
      const log = (raw.errLog || []).slice(-12);
      const count = {}; log.forEach(c => (count[c] = (count[c] || 0) + 1));
      const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
      out.push({ skill: sk, rate: s.recent, code: top ? top[0] : 'sonst' });
    });
    return out.sort((a, b) => a.rate - b.rate);
  }
  // Trainingsmission: Grundlagen zur Lücke + Stärken (Sandwich 70/30)
  function training() {
    const g = gaps()[0];
    if (!g) return null;
    const err = X.ERR[g.code] || X.ERR.sonst;
    let base = err.train.map(X.byId).filter(Boolean);
    // Grundlagen nur, wenn sie nicht schwerer sind als die Lücke selbst
    if (!base.length) base = [g.skill];
    const focus = U.uniq([...base.map(b => b.id), g.skill.id]);
    const strong = strengths().filter(s => !focus.includes(s.id)).map(s => s.id);
    return { gap: g, focus, strong, mission: err.mission };
  }

  // Welche Welt passt gerade?
  function worldReady(world) {
    const ids = SKILLS.filter(s => s.world === world).map(s => s.id);
    const good = ids.filter(id => isGem(id) || (stat(id).tries >= MIN_TRIES && stat(id).recent >= .8));
    return { total: ids.length, good: good.length, gems: ids.filter(isGem).length };
  }
  function suggestWorld() {
    const w1 = worldReady('w1'), w2 = worldReady('w2');
    const core1 = ['freunde', 'plus20', 'minus20'].every(id => isGem(id) || (stat(id).tries >= MIN_TRIES && stat(id).recent >= .8));
    if (!core1) return { world: 'w1', why: 'Zehnerfreunde und Rechnen über die 10 sind noch nicht ganz sicher. Das ist die wichtigste Grundlage für alles Weitere.' };
    const core2 = ['buendeln', 'analogie', 'ergaenzen'].every(id => isGem(id) || (stat(id).tries >= MIN_TRIES && stat(id).recent >= .8));
    if (!core2) return { world: 'w2', why: `Klasse-1-Kern ist sicher (${w1.good} von ${w1.total} Themen). Jetzt lohnt sich die Brücke: Bündeln, Analogien, Ergänzen zum Zehner.` };
    return { world: 'w3', why: `Auch die Brücke sitzt (${w2.good} von ${w2.total}). Bereit für den Stoff der 2. Klasse.` };
  }

  // Mission des Tages: Förderbedarf vor Neuem, sonst nächstes ungeübtes Thema der aktuellen Welt
  function missionOfDay() {
    const tr = training();
    if (tr) return { type: 'training', ...tr, title: 'Trainingsmission', text: U.t(U.pick(PHRASES.missionAsk), { mission: tr.mission }) };
    const w = Store.state.recommended || 'w1';
    const list = SKILLS.filter(s => s.world === w);
    const next = list.find(s => !isGem(s.id) && stat(s.id).tries < 12) || list.find(s => !isGem(s.id)) || U.pick(list);
    return { type: 'skill', skill: next, title: next.title, text: `Heute erforschen wir: ${next.title}. ${next.desc}.` };
  }

  // Nach einer Einheit: guter Tag? Edelstein verdient?
  function afterSession(skillIds, results) {
    const st = Store.state, news = [];
    skillIds.forEach(id => {
      const r = results[id]; if (!r || r.n < 3) return;
      const s = Store.skill(id);
      const wasGap = gaps().some(g => g.skill.id === id);
      if (r.first / r.n >= .8) { s.goodDays = U.uniq([...(s.goodDays || []), U.today()]).slice(-10); }
      const recent = (s.hist || []).slice(-8);
      const ok = recent.length >= 6 && recent.filter(Boolean).length >= 6 && (s.goodDays || []).length >= 2;
      if (ok && !st.gems.includes(id)) { st.gems.push(id); news.push({ id, closedGap: wasGap || (s.wasGap === true) }); }
      if (wasGap) s.wasGap = true;
    });
    Store.save();
    return news;
  }

  // Stärke, an die Capy zu Beginn erinnert
  function strengthLine() {
    const s = strengths();
    if (!s.length) return null;
    const sk = U.pick(s);
    return `Du bist schon richtig gut bei „${sk.title}“. Das hilft uns heute!`;
  }

  // Wochenbrief-Inhalt
  function weekSummary() {
    const st = Store.state, since = Date.now() - 7 * 864e5;
    const sess = st.sessions.filter(s => new Date(s.date).getTime() >= since);
    const solved = sess.reduce((a, s) => a + s.solved, 0), stars = sess.reduce((a, s) => a + (s.stars || 0), 0);
    const newGems = st.gems.filter(id => sess.some(s => (s.newGems || []).includes(id))).map(id => X.byId(id).gem);
    const m = missionOfDay();
    const p = [];
    p.push(sess.length ? `diese Woche hast du ${sess.length} Reportage${sess.length > 1 ? 'n' : ''} mit mir gemacht und ${solved} Aufgaben gelöst. Wow!` : 'diese Woche haben wir uns noch nicht so oft gesehen. Ich freu mich schon auf dich!');
    if (stars) p.push(`Du hast ${stars} Mutmach-Sterne gesammelt. Die gibt es fürs Dranbleiben, auch wenn es knifflig war. Darauf bin ich besonders stolz.`);
    if (newGems.length) p.push(`Neu in deiner Schatzkiste: ${newGems.join(', ')}. 💎`);
    else { const s = strengths()[0]; if (s) p.push(`Besonders gut kannst du schon: ${s.title}.`); }
    p.push(`Als Nächstes wartet: ${m.title}. ${m.type === 'training' ? 'Da brauche ich deine Hilfe!' : 'Das wird ein Abenteuer!'}`);
    p.push(U.pick(PHRASES.capyStory));
    return p;
  }

  return { stat, strengths, gaps, training, worldReady, suggestWorld, missionOfDay, afterSession, strengthLine, weekSummary, isGem };
})();
