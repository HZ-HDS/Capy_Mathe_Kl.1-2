/* Willkommen, Einstieg „Was ist Lernen?“, Erklärfilme, Startcheck-Ergebnis. */
window.Screens = window.Screens || {};
(function () {
  const { h } = U;
  const app = () => document.getElementById('app');

  /* ---------- Erster Start: Namen ---------- */
  Screens.welcome = function () {
    const a = app(); a.innerHTML = '';
    const nameIn = h('input.namefield#kidName', { placeholder: 'Dein Name', maxlength: 20, autocomplete: 'off' });
    const buddyIn = h('input.namefield#buddyName', { value: Store.state.buddy || 'Capy', maxlength: 16, autocomplete: 'off' });
    a.appendChild(h('div.card.center', {}, [
      h('div', { html: Capy.svg({ mood: 'cheer', hat: true }), style: 'width:180px' }),
      h('h1', { text: 'Willkommen im Mathe-Regenwald!' }),
      h('p', { text: 'Hallo! Ich bin ein Capybara und suche eine Tierreporterin, die mit mir den Regenwald der Zahlen erforscht.' }),
      h('label', { for: 'kidName', style: 'font-family:var(--font);font-size:1.2rem', text: 'Wie heißt du?' }), nameIn,
      h('label', { for: 'buddyName', style: 'font-family:var(--font);font-size:1.2rem', text: 'Wie soll ich heißen?' }), buddyIn,
      h('button.btn.big', { text: 'Los geht\'s! 🎤', onclick: () => {
        Sound.unlock();
        Store.state.name = nameIn.value.trim().slice(0, 20) || 'Reporterin';
        Store.state.buddy = buddyIn.value.trim().slice(0, 16) || 'Capy';
        Store.save(); App.refreshBrand();
        Screens.intro();
      } })
    ]));
    Capy.say('Hallo! Wie heißt du? Tipp deinen Namen ein.', 'happy', { silent: true });
  };

  /* ---------- Bildergeschichte: Was ist Lernen? ---------- */
  const forest = (path) => `<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="520" height="300" rx="30" fill="#dff4e7"/>
    ${[40, 120, 400, 470, 300, 200].map((x, i) => `<g transform="translate(${x} ${i % 2 ? 40 : 170})"><rect x="-6" y="30" width="12" height="40" fill="#8a5a36"/><circle r="34" cy="20" fill="${i % 3 ? '#4fae74' : '#6cc28a'}"/></g>`).join('')}
    ${path}
    <text x="40" y="270" font-size="40">🦫</text><text x="440" y="90" font-size="40">⭐</text></svg>`;
  const SLIDES = [
    { svg: `<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="300" rx="30" fill="#efe6fd"/><path d="M260 60 C150 40 90 110 110 170 C90 230 170 270 260 250 C350 270 430 230 410 170 C430 110 370 40 260 60 Z" fill="#fbe3f0" stroke="#9a72dd" stroke-width="6"/><path d="M260 70 L260 245" stroke="#9a72dd" stroke-width="4" stroke-dasharray="8 8"/>${[[170, 140], [210, 200], [320, 120], [350, 200], [190, 100]].map(p => `<text x="${p[0]}" y="${p[1]}" font-size="34">🌳</text>`).join('')}<text x="290" y="170" font-size="30">✨</text></svg>`, text: 'Weißt du, was in deinem Kopf passiert, wenn du lernst? In deinem Gehirn wächst ein ganzer Regenwald!' },
    { svg: forest('<path class="path-grow" d="M90 250 C180 230 200 150 280 160 S400 110 450 80" fill="none" stroke="#c9a16b" stroke-width="5" stroke-dasharray="6 8" stroke-linecap="round"/>'), text: 'Wenn du etwas Neues lernst, entsteht ein kleiner Trampelpfad. Am Anfang ist er schmal und man kommt nur langsam durch.' },
    { svg: forest('<path class="path-grow" d="M90 250 C180 230 200 150 280 160 S400 110 450 80" fill="none" stroke="#c9a16b" stroke-width="28" stroke-linecap="round"/>'), text: 'Jedes Mal, wenn du übst, wird der Pfad breiter. Bald ist er ein richtiger Weg, und du flitzt ganz schnell ans Ziel!' },
    { svg: `<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="300" rx="30" fill="#dcf1ff"/>${[[60, 240], [120, 200], [110, 140], [180, 110], [250, 150], [300, 100], [370, 80]].map((p, i) => `<text x="${p[0]}" y="${p[1]}" font-size="34" opacity="${0.4 + i * 0.09}">🐾</text>`).join('')}<text x="420" y="80" font-size="56">🌟</text><text x="150" y="270" font-size="22" fill="#5b3a99" font-family="Arial Rounded MT Bold, Arial">Fehler = Spuren zum Ziel</text></svg>`, text: 'Fehler sind wie Fußspuren. Sie zeigen, wo du schon gesucht hast. Ohne Fehler kein Lernen! Darum sagen wir: Noch nicht. Aber bald!' },
    { svg: `<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="300" rx="30" fill="#fff4dc"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${60 + i * 80}" y="${230 - i * 40}" width="80" height="${40 + i * 40}" fill="${i % 2 ? '#b393ea' : '#a9dcfb'}" rx="8"/>`).join('')}<text x="70" y="220" font-size="40">🦫</text><text x="400" y="60" font-size="50">🍊</text></svg>`, text: 'Motivation ist wie Hunger auf Abenteuer. Große Ziele schaffst du mit kleinen Schritten. Jeder Schritt macht dich stolz und stärker.' },
    { el: () => V.field20(5, 3, { rows: 1 }), text: 'Unser Supertrick: Nicht einzeln zählen, sondern Mengen sehen! Hier siehst du sofort: eine volle Fünf und noch drei. Das sind acht.' },
    { svg: `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="220" rx="30" fill="#efe6fd"/><text x="50" y="130" font-size="70">⏱️</text><text x="200" y="130" font-size="70">💃</text><text x="350" y="130" font-size="70">🔁</text><text x="40" y="190" font-size="20" font-family="Arial Rounded MT Bold, Arial" fill="#5b3a99">kurz üben</text><text x="195" y="190" font-size="20" font-family="Arial Rounded MT Bold, Arial" fill="#5b3a99">Pause</text><text x="335" y="190" font-size="20" font-family="Arial Rounded MT Bold, Arial" fill="#5b3a99">wiederholen</text></svg>`, text: 'So wächst dein Gehirn am besten: kurz üben, Pause machen, morgen wiederholen. Und ich bin immer dabei!' }
  ];
  Screens.intro = function () {
    let i = 0;
    const a = app();
    const show = () => {
      a.innerHTML = '';
      const s = SLIDES[i];
      const pic = s.el ? h('div', { style: 'padding:24px' }, [s.el()]) : h('div', { html: s.svg, style: 'width:100%;display:flex;justify-content:center' });
      const last = i === SLIDES.length - 1;
      a.appendChild(h('div.card.slide', {}, [
        h('h2', { text: i < 4 ? 'Wie funktioniert Lernen?' : i === 4 ? 'Was ist Motivation?' : 'Capys Lerntricks' }),
        pic,
        h('p.stxt', { text: s.text }),
        h('div.dots-nav', {}, SLIDES.map((_, k) => h('i' + (k === i ? '.on' : '')))),
        h('div.row', { style: 'justify-content:center' }, [
          i > 0 ? h('button.btn.soft', { text: '◀ Zurück', onclick: () => { i--; show(); } }) : null,
          h('button.icon-btn', { text: '🔈', 'aria-label': 'Vorlesen', onclick: () => Sound.speak(s.text, true) }),
          h('button.btn.big', { text: last ? 'Fertig! ✓' : 'Weiter ▶', onclick: () => {
            if (!last) { i++; show(); return; }
            Store.state.introSeen = true; Store.save();
            if (!Store.state.startcheckDone) Screens.startcheckIntro(); else App.go('map');
          } })
        ])
      ]));
      Capy.say(s.text, i === 3 ? 'comfort' : 'happy', { ms: 9000 });
    };
    show();
  };

  Screens.startcheckIntro = function () {
    const a = app(); a.innerHTML = '';
    a.appendChild(h('div.card.center', {}, [
      h('div.big-emoji', { text: '🔍' }),
      h('h1', { text: 'Capy will dich kennenlernen' }),
      h('p', { text: 'Ich zeige dir ein paar Aufgaben. Das ist kein Test! Ich will nur wissen, wo unser Abenteuer starten soll. Wenn du etwas noch nicht weißt, ist das völlig okay.' }),
      h('button.btn.big', { text: 'Startcheck beginnen', onclick: () => Engine.startcheck() }),
      h('button.btn.soft', { text: 'Überspringen', onclick: () => { Store.state.startcheckDone = true; Store.save(); App.go('map'); } })
    ]));
    Capy.say('Bevor wir losziehen, will ich wissen, was du schon kannst. Ganz ohne Noten!', 'happy');
  };

  Screens.startcheckResult = function (rec, k1, k2) {
    const names = { w1: 'den Zahlenfluss (Zahlen bis 20)', w2: 'die Hängebrücke (auf dem Weg zur 100)', w3: 'das Land der großen Zahlen (Klasse 2)' };
    const a = app(); a.innerHTML = '';
    a.appendChild(h('div.card.center', {}, [
      h('div', { html: Capy.svg({ mood: 'cheer' }), style: 'width:160px' }),
      h('h1', { text: 'Danke, Reporterin!' }),
      h('p', { text: `Du hast ${k1 + k2} Aufgaben gelöst. Ich schlage vor, wir starten bei: ${names[rec]}.` }),
      h('p.muted', { text: 'Die Eltern können den Startpunkt im Eltern-Bereich ändern.' }),
      h('button.btn.big', { text: 'Zur Abenteuer-Karte 🗺️', onclick: () => App.go('map') })
    ]));
    Capy.say(`Super! Wir starten bei ${names[rec]}. Ich freu mich!`, 'cheer');
  };

  /* ---------- Erklärfilme (animierte Bildergeschichten) ---------- */
  const FILMS = [
    { id: 'zehner', emo: '🌉', title: 'So geht der Zehnerübergang', frames: [
      { el: () => V.field20(8, 0), text: 'Wir rechnen 8 plus 5. Hier sind 8 rote Plättchen.' },
      { el: () => V.field20(8, 2), text: 'Bis zur 10 fehlen noch 2. Die füllen wir zuerst auf. 8 plus 2 ist 10.' },
      { el: () => V.field20(8, 5), text: 'Von den 5 sind noch 3 übrig. Die kommen in die zweite Reihe.' },
      { el: () => h('div.eq', { text: '8 + 5 = 8 + 2 + 3 = 13' }), text: '10 und 3 sind 13. Erst zur 10, dann weiter. Das ist der Zehnertrick!' }
    ]},
    { id: 'minus', emo: '↩️', title: 'Minus über die 10', frames: [
      { el: () => V.field20(13, 0, { rows: 2 }), text: 'Wir rechnen 13 minus 5. Hier sind 13 Plättchen.' },
      { el: () => V.field20(13, 0, { rows: 2, cross: 3 }), text: 'Zuerst gehen wir zurück bis zur 10. Dafür nehmen wir 3 weg.' },
      { el: () => V.field20(13, 0, { rows: 2, cross: 5 }), text: 'Wir müssen 5 wegnehmen, 3 haben wir schon. Also noch 2.' },
      { el: () => h('div.eq', { text: '13 − 5 = 13 − 3 − 2 = 8' }), text: '10 minus 2 ist 8. Erst zur 10 zurück, dann weiter!' }
    ]},
    { id: 'buendeln', emo: '🪵', title: 'Zehner bündeln', frames: [
      { el: () => V.tensOnes(0, 14), text: 'Hier sind ganz viele Einer. Einzeln zählen dauert lange.' },
      { el: () => V.tensOnes(1, 4), text: 'Immer 10 Einer binden wir zu einem Zehner zusammen. Jetzt sieht man es sofort.' },
      { el: () => V.zeTafel(1, 4), text: '1 Zehner und 4 Einer. Das ist die Zahl 14.' },
      { el: () => V.tensOnes(4, 7), text: 'Und das hier? 4 Zehner und 7 Einer: 47. Zuerst die Zehner, dann die Einer.' }
    ]},
    { id: 'strich', emo: '📏', title: 'Der Rechenstrich', frames: [
      { el: () => V.strich(47, [5]), text: 'Wir rechnen 47 plus 5. Ein großer Sprung ist schwierig.' },
      { el: () => V.strich(47, [3]), text: 'Erst springen wir 3 bis zur 50.' },
      { el: () => V.strich(47, [3, 2]), text: 'Dann noch 2 weiter. 47 plus 5 ist 52!' }
    ]},
    { id: 'mal', emo: '✖️', title: 'Malaufgaben sehen', frames: [
      { el: () => V.array(3, 4, '🦫'), text: 'Hier sind 3 Capybara-Familien. Jede hat 4 Babys.' },
      { el: () => h('div.eq', { text: '4 + 4 + 4 = 12' }), text: '4 plus 4 plus 4. Das ist 12.' },
      { el: () => h('div.eq', { text: '3 × 4 = 12' }), text: 'Kürzer schreibt man: 3 mal 4 ist 12. Drei Reihen mit je vier.' }
    ]},
    { id: 'uhr', emo: '⏰', title: 'Die Uhr lesen', frames: [
      { el: () => h('div', { html: V.clockSVG(3, 0, { hlHour: true }) }), text: 'Der kurze rote Zeiger zeigt die Stunde. Er steht auf der 3.' },
      { el: () => h('div', { html: V.clockSVG(3, 0, { hlMin: true }) }), text: 'Der lange Zeiger zeigt die Minuten. Steht er oben auf der 12, ist es eine volle Stunde: 3 Uhr.' },
      { el: () => h('div', { html: V.clockSVG(3, 30, { hlMin: true }) }), text: 'Steht der lange Zeiger unten, ist es halb. Halb auf dem Weg zur 4. Wir sagen: halb 4.' },
      { el: () => h('div', { html: V.clockSVG(3, 15, { hlMin: true }) }), text: 'Zeigt er auf die 3, ist es Viertel nach 3. Von Zahl zu Zahl sind es 5 Minuten.' }
    ]},
    { id: 'wechsel', emo: '💶', title: 'Wechselgeld', frames: [
      { el: () => h('div.price-tag', {}, [h('span.emo', { text: '🍉' }), '7 €']), text: 'Die Melone kostet 7 Euro. Du bezahlst mit 10 Euro.' },
      { el: () => V.strich(7, [3]), text: 'Wir rechnen von 7 hoch bis 10. Das sind 3.' },
      { el: () => h('div.eq', { text: '7 + 3 = 10' }), text: 'Du bekommst 3 Euro zurück. Rückgeld ist das, was bis zum bezahlten Betrag fehlt.' }
    ]}
  ];
  Screens.films = function () {
    const a = app(); a.innerHTML = '';
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: '🎬 Capys Kino' }), h('p.sub', { text: 'Kleine Erklärfilme zum Anschauen und Anhören. Du tippst weiter, wann du willst.' })]));
    a.appendChild(h('div.grid', {}, [
      h('button.skill-tile', { onclick: () => Screens.intro() }, [h('div.st-emoji', { text: '🧠' }), h('div', {}, [h('h3', { text: 'Wie funktioniert Lernen?' }), h('div.st-meta', { text: 'Gehirn, Motivation, Lerntricks' })])]),
      ...FILMS.map(f => h('button.skill-tile', { onclick: () => Screens.film(f.id) }, [h('div.st-emoji', { text: f.emo }), h('div', {}, [h('h3', { text: f.title }), h('div.st-meta', { text: f.frames.length + ' Bilder' })])]))
    ]));
    Capy.say('Popcorn bereit? Such dir einen Film aus!', 'happy');
  };
  Screens.film = function (id) {
    const f = FILMS.find(x => x.id === id); let i = 0;
    const a = app();
    const show = () => {
      a.innerHTML = '';
      const fr = f.frames[i], last = i === f.frames.length - 1;
      a.appendChild(h('div.film-frame.card', {}, [
        h('h2', { text: `${f.emo} ${f.title}` }),
        h('div', { style: 'animation:growIn .4s;display:flex;justify-content:center;width:100%' }, [fr.el()]),
        h('p.stxt', { style: 'font-family:var(--font);font-size:1.3rem;max-width:36ch;text-align:center', text: fr.text }),
        h('div.dots-nav', {}, f.frames.map((_, k) => h('i' + (k === i ? '.on' : '')))),
        h('div.row', { style: 'justify-content:center' }, [
          i > 0 ? h('button.btn.soft', { text: '◀', 'aria-label': 'Zurück', onclick: () => { i--; show(); } }) : null,
          h('button.icon-btn', { text: '🔈', 'aria-label': 'Vorlesen', onclick: () => Sound.speak(fr.text, true) }),
          h('button.btn.big', { text: last ? 'Zurück ins Kino' : 'Weiter ▶', onclick: () => { if (last) Screens.films(); else { i++; show(); } } })
        ])
      ]));
      Capy.say(fr.text, 'think', { ms: 9000 });
    };
    show();
  };
  Screens.FILMS = FILMS;
})();
