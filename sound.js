/* Töne (selbst erzeugt, keine Audiodateien) und Vorlesefunktion. */
window.Sound = (function () {
  let ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type = 'sine', vol = .18) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + start + .02);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + .05);
  }
  const on = () => Store.state.settings.sound;
  function play(kind) {
    if (!on()) return;
    if (kind === 'ok') { tone(660, 0, .15); tone(880, .1, .25); }
    else if (kind === 'oops') { tone(392, 0, .18, 'triangle', .12); tone(330, .12, .22, 'triangle', .1); }
    else if (kind === 'tap') tone(520, 0, .07, 'triangle', .08);
    else if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .3));
    else if (kind === 'coin') { tone(988, 0, .08, 'square', .06); tone(1319, .07, .18, 'square', .06); }
  }
  // Vorlesen mit deutscher Stimme, falls vorhanden
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
    voice = vs.find(v => /anna|helena|petra|marlene|female|google/i.test(v.name)) || vs[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, force) {
    if (!('speechSynthesis' in window)) return;
    if (!force && !(Store.state.settings.speech && on())) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '').replace(/×/g, ' mal ').replace(/(\d) : (\d)/g, '$1 geteilt durch $2').replace(/−/g, ' minus ').replace(/\+/g, ' plus ').replace(/_/g, ' wie viel '));
      u.lang = 'de-DE'; if (voice) u.voice = voice; u.rate = .95; u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch (e) { /* Sprachausgabe nicht verfügbar */ }
  }
  function stop() { try { speechSynthesis.cancel(); } catch (e) {} }
  return { play, speak, stop, unlock: ac };
})();
