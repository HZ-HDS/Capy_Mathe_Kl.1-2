/* App: Navigation, Zähler, Pausen (Tanz, Witz, Atmen) und Start. */
window.App = (function () {
  const { h } = U;
  const ov = () => document.getElementById('overlay');

  function go(name) {
    Sound.stop();
    if (name !== 'parents') Screens.lockParents();
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.go === name));
    const app = document.getElementById('app');
    ({ map: Screens.map, room: Screens.room, stories: Screens.stories, treasure: Screens.treasure, parents: Screens.parents })[name]();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function refreshCounters() {
    const st = Store.state;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('cStars', st.stars); set('cCoins', st.coins); set('cGems', st.gems.length);
  }
  function refreshBrand() {
    document.getElementById('brandCapy').innerHTML = Capy.svg({ mood: 'happy' });
    Capy.setMood('happy');
  }
  function applySettings() {
    const s = Store.state.settings;
    document.getElementById('soundBtn').textContent = s.sound ? '🔊' : '🔇';
    document.body.classList.toggle('calm', !!s.calm);
  }

  /* Tanzpause mit Countdown */
  function breakDance(done) {
    const m = U.pick(MOVES); let t = 20;
    const cd = h('div.countdown', { text: t });
    const close = () => { clearInterval(iv); ov().hidden = true; ov().innerHTML = ''; done && done(); };
    ov().innerHTML = '';
    ov().appendChild(h('div.modal', {}, [h('div.big-emoji', { text: m.emo }), h('h2', { text: 'Tanzpause!' }), h('p', { style: 'font-family:var(--font);font-size:1.3rem', text: m.text }), cd, h('button.btn', { text: 'Fertig! ✓', onclick: close })]));
    ov().hidden = false;
    Capy.say(m.text, 'cheer'); Capy.bounce('dance');
    const iv = setInterval(() => { t--; cd.textContent = t; if (t <= 0) { Sound.play('win'); close(); } }, 1000);
  }
  function joke(done) {
    const j = U.pick(JOKES), [q, ...rest] = j.split('?');
    const ans = h('p', { style: 'font-family:var(--font);font-size:1.4rem', text: rest.join('?').trim(), hidden: true });
    const close = () => { ov().hidden = true; ov().innerHTML = ''; done && done(); };
    ov().innerHTML = '';
    ov().appendChild(h('div.modal', {}, [h('div.big-emoji', { text: '😂' }), h('p', { style: 'font-family:var(--font);font-size:1.4rem', text: q + (rest.length ? '?' : '') }), ans,
      rest.length ? h('button.btn.lila', { text: 'Auflösung!', onclick: e => { ans.hidden = false; e.target.remove(); Sound.speak(ans.textContent, true); } }) : null,
      h('button.btn', { text: 'Weiter', onclick: close })]));
    ov().hidden = false;
    Sound.speak(q + '?');
  }
  function breathe(done) {
    const close = () => { ov().hidden = true; ov().innerHTML = ''; done && done(); };
    ov().innerHTML = '';
    ov().appendChild(h('div.modal', {}, [h('h2', { text: 'Capy-Atmung' }), h('div.breathe', { text: 'ein … aus' }), h('p', { text: 'Wenn der Kreis groß wird: einatmen. Wird er klein: ausatmen. 3-mal.' }), h('button.btn', { text: 'Fertig ✓', onclick: close })]));
    ov().hidden = false;
    Capy.say('Atme mit dem Kreis. Ganz ruhig.', 'comfort');
  }

  function init() {
    refreshBrand(); refreshCounters(); applySettings();
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { if (!Engine.active) go(t.dataset.go); }));
    document.getElementById('homeBtn').addEventListener('click', () => { if (!Engine.active) go('map'); });
    document.getElementById('soundBtn').addEventListener('click', () => { const s = Store.state.settings; s.sound = !s.sound; Store.save(); applySettings(); if (!s.sound) Sound.stop(); else { Sound.unlock(); Sound.play('ok'); } });
    document.getElementById('speakBtn').addEventListener('click', () => Capy.repeat());
    // Capy antippen: Mutmach-Satz, eigene Geschichte oder Witz
    document.getElementById('buddyCapy').addEventListener('click', () => {
      Sound.unlock();
      const r = Math.random();
      if (r < .4) Capy.say(Capy.phrase('start'), 'cheer');
      else if (r < .75) Capy.say(U.pick(PHRASES.capyStory), 'happy');
      else Capy.say(U.pick(JOKES), 'cheer');
    });
    document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
    // Rückkehr nach längerer Abwesenheit
    const st = Store.state;
    const away = st.lastVisit ? Date.now() - st.lastVisit : 0;
    st.lastVisit = Date.now(); Store.save();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (Date.now() - Store.state.lastVisit > 10 * 60e3) Capy.say(Capy.phrase('back'), 'happy'); Store.state.lastVisit = Date.now(); Store.save(); } });

    if (!st.name) Screens.welcome();
    else if (!st.introSeen) Screens.intro();
    else if (!st.startcheckDone) Screens.startcheckIntro();
    else go('map');
    // Offline-Nutzung (nur wenn als echte Website geladen)
    try { if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|anthropic/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
  }

  return { go, refreshCounters, refreshBrand, applySettings, breakDance, joke, breathe, init, greeted: false };
})();
document.addEventListener('DOMContentLoaded', App.init);
