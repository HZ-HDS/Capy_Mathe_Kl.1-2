/* Capy, der Capybara-Lernbuddy: eigene SVG-Figur mit Gesichtsausdrücken
   und die Sprechblase. Stimmungen: happy, think, comfort, cheer, wow. */
window.Capy = (function () {
  function svg(opt = {}) {
    const mood = opt.mood || 'happy';
    const line = opt.outline; // Ausmalbild: nur Linien
    const fur = line ? '#fff' : '#c4895a', furD = line ? '#fff' : '#a8703f', snout = line ? '#fff' : '#b47a4a';
    const dark = line ? '#fff' : '#4a2c18', st = line ? 'stroke="#222" stroke-width="3"' : '';
    const cheek = line ? '' : `<ellipse cx="62" cy="112" rx="11" ry="7" fill="#f6a6b2" opacity=".75"/><ellipse cx="138" cy="112" rx="11" ry="7" fill="#f6a6b2" opacity=".75"/>`;
    let eyes, mouth, extra = '';
    const ink = line ? '#222' : '#2b1a10';
    if (mood === 'cheer' || mood === 'wow') {
      eyes = `<path d="M60 80 q10 -12 20 0" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M120 80 q10 -12 20 0" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
      mouth = `<path d="M84 118 q16 20 32 0 z" fill="${line ? '#fff' : '#7a2f2f'}" stroke="${ink}" stroke-width="3"/>`;
      if (!line) extra = `<text x="160" y="40" font-size="26">✨</text><text x="20" y="44" font-size="20">✨</text>`;
    } else if (mood === 'think') {
      eyes = `<circle cx="72" cy="78" r="8" fill="${ink}"/><circle cx="132" cy="78" r="8" fill="${ink}"/><circle cx="75" cy="74" r="3" fill="#fff"/><circle cx="135" cy="74" r="3" fill="#fff"/>`;
      mouth = `<ellipse cx="104" cy="122" rx="6" ry="5" fill="${ink}"/>`;
      if (!line) extra = `<text x="160" y="42" font-size="30" fill="#9a72dd" font-family="sans-serif" font-weight="bold">?</text>`;
    } else if (mood === 'comfort') {
      eyes = `<path d="M62 80 q10 8 20 0" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M118 80 q10 8 20 0" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
      mouth = `<path d="M90 120 q10 8 20 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
      if (!line) extra = `<text x="156" y="46" font-size="24">💜</text>`;
    } else {
      eyes = `<circle cx="72" cy="80" r="9" fill="${ink}"/><circle cx="128" cy="80" r="9" fill="${ink}"/><circle cx="75" cy="76" r="3.5" fill="#fff"/><circle cx="131" cy="76" r="3.5" fill="#fff"/>`;
      mouth = `<path d="M88 118 q12 12 24 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
    }
    const hat = opt.hat ? `<g transform="translate(86 6)"><circle cx="14" cy="22" r="16" fill="${line ? '#fff' : '#ff9a2e'}" ${line ? st : ''}/><path d="M14 6 q6 -10 14 -6 q-6 6 -14 6" fill="${line ? '#fff' : '#4fae74'}" ${line ? st : ''}/></g>` : '';
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="100" cy="190" rx="70" ry="8" fill="${line ? 'none' : 'rgba(43,37,80,.12)'}"/>
      <ellipse cx="100" cy="150" rx="74" ry="44" fill="${furD}" ${st}/>
      <ellipse cx="62" cy="186" rx="16" ry="9" fill="${furD}" ${st}/><ellipse cx="138" cy="186" rx="16" ry="9" fill="${furD}" ${st}/>
      <ellipse cx="54" cy="40" rx="13" ry="11" fill="${furD}" ${st}/><ellipse cx="146" cy="40" rx="13" ry="11" fill="${furD}" ${st}/>
      <rect x="38" y="30" width="124" height="118" rx="56" fill="${fur}" ${st}/>
      <ellipse cx="100" cy="112" rx="44" ry="30" fill="${snout}" ${st}/>
      <ellipse cx="100" cy="98" rx="20" ry="11" fill="${dark}" ${st}/>
      <ellipse cx="93" cy="98" rx="3" ry="4" fill="${line ? '#222' : '#2b1a10'}"/><ellipse cx="107" cy="98" rx="3" ry="4" fill="${line ? '#222' : '#2b1a10'}"/>
      ${eyes}${mouth}${cheek}${hat}${extra}
    </svg>`;
  }

  let timer = null, lastText = '';
  function say(text, mood = 'happy', opts = {}) {
    const msg = U.t(text);
    lastText = msg;
    const b = document.getElementById('bubble');
    document.getElementById('bubbleText').textContent = msg;
    b.hidden = false;
    setMood(mood);
    bounce(mood === 'cheer' ? 'dance' : 'bounce');
    if (!opts.silent) Sound.speak(msg);
    clearTimeout(timer);
    if (!opts.stay) timer = setTimeout(() => (b.hidden = true), opts.ms || Math.max(4500, msg.length * 85));
  }
  function setMood(mood) {
    document.getElementById('buddyCapy').innerHTML = svg({ mood, hat: Store.state.items.includes('mandarine') });
  }
  function bounce(kind = 'bounce') {
    const c = document.getElementById('buddyCapy');
    c.classList.remove('bounce', 'dance'); void c.offsetWidth; c.classList.add(kind);
  }
  function hide() { document.getElementById('bubble').hidden = true; }
  function repeat() { if (lastText) Sound.speak(lastText, true); }
  // zufälliger Satz aus einer Liste
  const phrase = (key, extra) => U.t(U.pick(PHRASES[key]), extra);
  return { svg, say, setMood, bounce, hide, repeat, phrase };
})();
