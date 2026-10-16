/* Kleine Hilfsfunktionen, die überall gebraucht werden. */
window.U = (function () {
  // Element bauen: h('div.card', {onclick}, [kinder])
  function h(sel, attrs, kids) {
    const m = sel.split(/(?=[.#])/);
    const e = document.createElement(m[0] || 'div');
    m.slice(1).forEach(p => p[0] === '.' ? e.classList.add(p.slice(1)) : (e.id = p.slice(1)));
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style') e.style.cssText = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    (Array.isArray(kids) ? kids : kids != null ? [kids] : []).flat().forEach(k => {
      if (k == null || k === false) return;
      e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
    });
    return e;
  }
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = a => [...new Set(a)];
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dateDE = (d = new Date()) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  function season(d = new Date()) {
    const m = d.getMonth() + 1;
    return m >= 3 && m <= 5 ? 'fruehling' : m <= 8 && m >= 6 ? 'sommer' : m >= 9 && m <= 11 ? 'herbst' : 'winter';
  }
  const seasonName = { fruehling: 'Frühling', sommer: 'Sommer', herbst: 'Herbst', winter: 'Winter' };
  // {name} und {buddy} in Texten ersetzen
  function t(s, extra) {
    const st = window.Store ? Store.state : {};
    let out = String(s).replace(/\{name\}/g, st.name || 'Reporterin').replace(/\{buddy\}/g, st.buddy || 'Capy');
    if (extra) for (const k in extra) out = out.replace(new RegExp('\\{' + k + '\\}', 'g'), extra[k]);
    return out;
  }
  // Glitzer-Effekt an einer Stelle (oder Bildschirmmitte)
  function sparkle(x, y, n = 16) {
    if (document.body.classList.contains('calm')) return;
    const box = document.getElementById('glitter');
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2.4; }
    const sym = ['✨', '⭐', '💜', '💙', '🌟', '✦'];
    for (let i = 0; i < n; i++) {
      const s = h('span.spark', { text: pick(sym) });
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 140;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      box.appendChild(s);
      setTimeout(() => s.remove(), 1300);
    }
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // Zahlwort für die Vorlesefunktion (deutsche Sprechweise, bis 100)
  function zahlwort(n) {
    const e = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
    const z = ['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'];
    if (n < 20) return e[n];
    if (n === 100) return 'hundert';
    const t1 = Math.floor(n / 10), o = n % 10;
    return o === 0 ? z[t1] : (o === 1 ? 'ein' : e[o]) + 'und' + z[t1];
  }
  return { h, rnd, pick, shuffle, uniq, today, dateDE, season, seasonName, t, sparkle, wait, zahlwort };
})();
