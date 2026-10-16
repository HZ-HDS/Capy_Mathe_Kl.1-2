/* Gemeinsame Bausteine für alle Übungstypen.
   Jeder Übungstyp wird mit X.reg({...}) angemeldet und hat eine Funktion gen(stufe),
   die eine Aufgabe erzeugt:
   { q, say, eq, render(stage), input: 'numpad'|'choice'|'widget', choices, label(v),
     answer, check(v), hint, help(box), steps[], analyze(v), strat } */
window.SKILLS = [];
window.X = (function () {
  const { h, rnd, pick, shuffle } = U;
  function reg(s) { SKILLS.push(s); }
  const byId = id => SKILLS.find(s => s.id === id);

  // Fehlerarten mit Erklärung für Eltern und passender Trainingsmission
  const ERR = {
    zaehlt: { text: 'Um 1 daneben: zählt vermutlich noch einzeln', train: ['blitz', 'freunde'], mission: 'Die Frösche wollen in Fünfergruppen sitzen.' },
    fuenf: { text: 'Um 5 daneben: Fünferstruktur noch unsicher', train: ['blitz'], mission: 'Die Fünferbande hat sich versteckt.' },
    zehner: { text: 'Fehler beim Zehnerübergang (Auffüllen bis 10)', train: ['freunde', 'plus20'], mission: 'Die Tukane brauchen genau 10 Plätze im Nest.' },
    operation: { text: 'Plus und Minus verwechselt', train: [], mission: 'Die Papageien haben die Rechenzeichen vertauscht.' },
    dreher: { text: 'Zahlendreher (Zehner und Einer vertauscht)', train: ['buendeln', 'hunderter'], mission: 'Papagei Piet dreht wieder die Zahlen um.' },
    uebertrag: { text: 'Um 10 daneben: Zehner beim Übergang vergessen oder doppelt', train: ['ergaenzen', 'analogie'], mission: 'Auf der Brücke fehlen ein paar Bretter bis zum nächsten Zehner.' },
    stelle: { text: 'Zehner- und Einerstelle verwechselt', train: ['buendeln', 'hunderter'], mission: 'Der Biber hat seine Stöckchen durcheinandergebracht.' },
    zeiger: { text: 'Stunden- und Minutenzeiger vertauscht', train: ['uhr1'], mission: 'Papagei Piet kommt wieder zu spät.' },
    halb: { text: '„halb“ falsch gedeutet (halb 4 = 3:30)', train: ['uhr1'], mission: 'Die Turmuhr zeigt halb, und keiner weiß, was das heißt.' },
    viertel: { text: '„Viertel nach“ und „Viertel vor“ verwechselt', train: ['uhr2'], mission: 'Eule Ella verwechselt Viertel nach und Viertel vor.' },
    geld: { text: 'Betrag beim Bezahlen nicht passend', train: ['geld20'], mission: 'Momo am Kiosk braucht Hilfe beim Kassieren.' },
    muenzen: { text: 'Nicht mit möglichst wenigen Münzen bezahlt', train: ['geld20'], mission: 'Im Kiosk-Geldbeutel ist nur wenig Platz.' },
    cent: { text: 'Euro und Cent verwechselt', train: ['geld100'], mission: 'Das Gürteltier am Markt verwechselt Euro und Cent.' },
    reihe: { text: 'Einmaleins: eine Reihe daneben', train: ['mal'], mission: 'Die Capybara-Familien wollen gezählt werden.' },
    sonst: { text: 'Anderer Fehler', train: [], mission: 'Im Regenwald gibt es ein kniffliges Rätsel.' }
  };

  // Zahl-Ergebnis analysieren
  function analyzeNum(v, ans, o = {}) {
    v = Number(v);
    if (v === ans) return null;
    if (o.other != null && v === o.other) return 'operation';
    if (ans >= 10 && v >= 10 && ans < 100 && v < 100 && String(v) === String(ans).split('').reverse().join('')) return 'dreher';
    if (Math.abs(v - ans) === 1) return 'zaehlt';
    if (Math.abs(v - ans) === 10) return o.crossing ? 'uebertrag' : 'stelle';
    if (Math.abs(v - ans) === 5 && o.five) return 'fuenf';
    if (o.crossing) return 'zehner';
    return 'sonst';
  }
  // Ablenker für Auswahlantworten
  function distract(ans, cands, n = 3, min = 0, max = 100) {
    const set = new Set([ans]);
    cands.forEach(c => { if (set.size < n && c >= min && c <= max && c !== ans) set.add(c); });
    while (set.size < n) { const c = ans + rnd(-4, 4); if (c >= min && c <= max) set.add(c); }
    return shuffle([...set]);
  }
  const ANIMALS = [
    { e: '🐸', p: 'Frösche', s: 'sitzen am Fluss', d: 'hüpfen dazu', w: 'hüpfen weg' },
    { e: '🦜', p: 'Papageien', s: 'sitzen im Baum', d: 'fliegen dazu', w: 'fliegen weg' },
    { e: '🐒', p: 'Äffchen', s: 'schaukeln an Lianen', d: 'kommen dazu', w: 'klettern weg' },
    { e: '🦋', p: 'Schmetterlinge', s: 'sitzen auf Blüten', d: 'flattern dazu', w: 'flattern weg' },
    { e: '🐢', p: 'Schildkröten', s: 'sonnen sich', d: 'krabbeln dazu', w: 'krabbeln weg' },
    { e: '🍊', p: 'Mandarinen', s: 'liegen im Korb', d: 'kommen dazu', w: 'isst Capy auf' },
    { e: '🐞', p: 'Marienkäfer', s: 'krabbeln auf dem Blatt', d: 'krabbeln dazu', w: 'fliegen weg' }
  ];
  const animal = () => pick(ANIMALS);
  const helpText = (box, s) => box.appendChild(h('p', { style: 'font-family:var(--font);font-size:1.15rem', text: s }));

  return { reg, byId, ERR, analyzeNum, distract, animal, helpText, ANIMALS };
})();
