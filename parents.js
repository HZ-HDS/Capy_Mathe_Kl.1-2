/* Eltern-Bereich: Fortschritt, Förderplan, Tipps, Links, Datenschutz, Einstellungen.
   Geschützt durch eine kleine Rechenfrage. */
window.Screens = window.Screens || {};
(function () {
  const { h } = U;
  const app = () => document.getElementById('app');
  let unlocked = false, tab = 'overview';

  Screens.parents = function () {
    if (!unlocked) return gate();
    const a = app(); a.innerHTML = '';
    a.classList.add('parents');
    const tabs = [['overview', 'Überblick'], ['plan', 'Förderplan'], ['tips', 'Tipps & Lernstoff'], ['links', 'Links & Material'], ['privacy', 'Datenschutz & KI'], ['settings', 'Einstellungen']];
    a.appendChild(h('div.screen-title', {}, [h('h1', { text: '👪 Eltern-Bereich' })]));
    a.appendChild(h('div.ptabs', {}, tabs.map(([id, t]) => h('button' + (tab === id ? '.on' : ''), { text: t, onclick: () => { tab = id; Screens.parents(); } }))));
    ({ overview, plan, tips, links, privacy, settings })[tab](a);
    Capy.hide();
  };

  function gate() {
    const a = app(); a.innerHTML = '';
    const x = U.rnd(6, 9), y = U.rnd(6, 9);
    const inp = h('input#gateIn', { inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Ergebnis' });
    const msg = h('p.muted');
    const tryIt = e => { e && e.preventDefault(); if (Number(inp.value) === x * y) { unlocked = true; Screens.parents(); } else { msg.textContent = 'Das stimmt leider nicht. Bitte nochmal versuchen.'; inp.value = ''; } };
    a.appendChild(h('form.card.center.gate', { onsubmit: tryIt }, [
      h('div.big-emoji', { text: '👪' }),
      h('h1', { text: 'Nur für Erwachsene' }),
      h('label', { for: 'gateIn', text: `Bitte rechnen Sie: ${x} × ${y} = ?` }),
      inp, h('button.btn', { type: 'submit', text: 'Öffnen' }), msg
    ]));
    Capy.say('Das ist der Bereich für deine Eltern.', 'happy', { silent: true });
  }

  const pill = (rate, tries) => tries < 5 ? h('span.pill.none', { text: tries ? 'wenig Daten' : 'noch nicht geübt' }) : rate >= .8 ? h('span.pill.good', { text: 'sicher' }) : rate >= .6 ? h('span.pill.mid', { text: 'auf dem Weg' }) : h('span.pill.need', { text: 'üben' });
  const pct = r => r == null ? '–' : Math.round(r * 100) + ' %';

  function overview(a) {
    const st = Store.state;
    const last14 = st.sessions.filter(s => Date.now() - new Date(s.date).getTime() < 14 * 864e5);
    const days = U.uniq(last14.map(s => s.date.slice(0, 10))).length;
    a.appendChild(h('div.grid', {}, [
      h('div.card', {}, [h('h3', { text: 'Einheiten gesamt' }), h('p', { style: 'font-size:2rem;font-family:var(--font)', text: st.sessions.length })]),
      h('div.card', {}, [h('h3', { text: 'Übungstage (14 Tage)' }), h('p', { style: 'font-size:2rem;font-family:var(--font)', text: days })]),
      h('div.card', {}, [h('h3', { text: 'Edelsteine' }), h('p', { style: 'font-size:2rem;font-family:var(--font)', text: `${st.gems.length} / ${SKILLS.length}` })]),
      h('div.card', {}, [h('h3', { text: 'Mutmach-Sterne' }), h('p', { style: 'font-size:2rem;font-family:var(--font)', text: st.stars }), h('p.muted', { text: 'Für Weitermachen nach Fehlern und Hilfe holen.' })])
    ]));
    Screens.WORLDS.forEach(w => {
      const rows = SKILLS.filter(s => s.world === w.id).map(sk => {
        const s = Coach.stat(sk.id), raw = st.skills[sk.id];
        const errs = raw ? Object.entries(raw.errors).filter(([c]) => c !== 'sonst').sort((x, y) => y[1] - x[1]).slice(0, 2).map(([c, n]) => `${X.ERR[c].text} (${n}×)`) : [];
        return h('tr', {}, [h('td', {}, [h('b', { text: `${sk.emo} ${sk.title}` }), Coach.isGem(sk.id) ? ' 💎' : '']), h('td', { text: `${s.level || 1}/4` }), h('td', { text: s.tries }), h('td', { text: pct(s.recent) }), h('td', {}, [pill(s.recent, s.tries)]), h('td', { text: errs.join('; ') || '–' })]);
      });
      a.appendChild(h('div.card', {}, [h('h3', { text: `${w.emo} ${w.title} (${w.sub})` }), h('div.table-wrap', {}, [h('table.skilltable', {}, [h('thead', {}, [h('tr', {}, ['Thema', 'Stufe', 'Aufgaben', 'Zuletzt richtig*', 'Status', 'Häufigste Fehlermuster'].map(t => h('th', { text: t })))]), h('tbody', {}, rows)])]), h('p.muted', { style: 'margin-top:8px;font-size:.9rem', text: '* Anteil der letzten 10 Aufgaben, die im ersten Versuch ohne Hilfe gelöst wurden.' })]));
    });
    const refl = st.reflections.slice(-8).reverse();
    if (refl.length) a.appendChild(h('div.card', {}, [h('h3', { text: 'Selbsteinschätzung Ihres Kindes' }), h('ul', {}, refl.map(r => h('li', { text: `${new Date(r.date).toLocaleDateString('de-DE')}: ${r.easy || '–'}, fühlt sich ${r.feel || '–'}` })))]));
  }

  function plan(a) {
    const st = Store.state, sw = Coach.suggestWorld(), str = Coach.strengths(), gaps = Coach.gaps();
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Stärken' }), str.length ? h('ul', {}, str.map(s => h('li', { text: `${s.title}: ${s.desc}` }))) : h('p', { text: 'Noch zu wenige Daten. Nach einigen Einheiten erscheinen hier die sicheren Themen.' })]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Nächste Schritte' }), gaps.length ? h('ul', {}, gaps.slice(0, 4).map(g => {
      const e = X.ERR[g.code] || X.ERR.sonst, base = e.train.map(X.byId).filter(Boolean).map(s => s.title);
      return h('li', { text: `${g.skill.title}: zuletzt ${pct(g.rate)} richtig. Auffällig: ${e.text}. ${base.length ? 'Capy schlägt dazu eine Trainingsmission mit „' + base.join('“ und „') + '“ vor.' : ''}` });
    })) : h('p', { text: 'Aktuell keine auffälligen Lücken. Capy schlägt neue Themen in der empfohlenen Welt vor.' })]));
    // Ideen für zu Hause passend zu Fehlermustern
    const homeIdeas = { zaehlt: 'Würfelbilder und Fingerbilder blitzartig zeigen (1 Sekunde) und benennen lassen. Halli Galli spielen.', fuenf: 'Eierkarton mit 10 Mulden: Mengen legen, „Wie viele? Ohne Zählen!“', zehner: 'Zehnerfreunde-Memory, dann Aufgaben wie 8 + 5 mit dem Eierkarton legen: erst voll machen.', dreher: 'Zahlen mit Zehnerstangen (z. B. Strohhalm-Bündel) legen, Zehner zuerst sprechen lassen.', uebertrag: 'Mit Geld rechnen: 10-€-Scheine und 1-€-Münzen. Wann wird ein neuer Zehner voll?', stelle: 'Hundertertafel ausdrucken, Zahlen suchen lassen, „eine Reihe tiefer = 10 mehr“.', zeiger: 'Bastel-Uhr (in den Schätzen) nutzen, mehrmals am Tag die echte Uhr ablesen.', halb: 'Bei jeder halben Stunde laut sagen: „Halb auf dem Weg zur …“.', viertel: 'Uhr als Pizza: Viertel einzeichnen.', geld: 'Kaufladen mit Spielgeld: genau passend bezahlen.', muenzen: 'Spiel: „Wer bezahlt mit den wenigsten Münzen?“', cent: 'Echte Kassenzettel anschauen: Euro vor dem Komma, Cent dahinter.', reihe: 'Einmaleins-Reihen hüpfen oder klatschen, Kernaufgaben (2×, 5×, 10×) zuerst.' };
    const codes = U.uniq(gaps.map(g => g.code)).filter(c => homeIdeas[c]);
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Ideen für zu Hause (ohne Bildschirm)' }), h('ul', {}, (codes.length ? codes.map(c => homeIdeas[c]) : PARENTS.games.slice(0, 4).map(g => `${g[0]}: ${g[1]}`)).map(t => h('li', { text: t })))]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Mutmach-Sätze, die Capy auch benutzt' }), h('p', { style: 'margin-bottom:8px', text: 'Wenn Sie zu Hause dieselben Sätze verwenden, sprechen Kind, Capy und Eltern dieselbe Sprache:' }), h('ul', {}, PARENTS.mutmach.map(m => h('li', { text: m })))]));
    // Weltempfehlung
    const sel = h('select#worldSel', { style: 'font:inherit;padding:10px;border-radius:12px;min-height:48px' }, Screens.WORLDS.map(w => h('option', { value: w.id, text: w.title + ' – ' + w.sub, selected: Store.state.recommended === w.id })));
    sel.onchange = () => { Store.state.recommended = sel.value; Store.save(); };
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Welche Welt passt?' }), h('p', { style: 'margin-bottom:10px', text: `Empfehlung nach den bisherigen Ergebnissen: ${Screens.WORLDS.find(w => w.id === sw.world).title}. ${sw.why}` }), h('label', { for: 'worldSel', text: 'Startpunkt für die Mission des Tages: ' }), sel]));
  }

  function tips(a) {
    a.appendChild(h('div.card', {}, [h('h3', { text: 'So unterstützen Sie Ihr Kind' }), h('ul', {}, PARENTS.tips.map(([t, d]) => h('li', {}, [h('b', { text: t + ': ' }), d])))]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Wann ist ein Gespräch mit der Lehrkraft sinnvoll?' }), h('ul', {}, PARENTS.signs.map(s => h('li', { text: s }))), h('p', { style: 'margin-top:10px', text: PARENTS.signsNote })]));
    const c = PARENTS.curriculum;
    a.appendChild(h('div.grid', {}, [
      h('div.card', {}, [h('h3', { text: 'Klasse 1' }), h('ul', {}, c.k1.map(t => h('li', { text: t })))]),
      h('div.card', {}, [h('h3', { text: 'Klasse 2' }), h('ul', {}, c.k2.map(t => h('li', { text: t })))]),
      h('div.card', {}, [h('h3', { text: 'Ausblick Klasse 3' }), h('ul', {}, c.k3.map(t => h('li', { text: t })))])
    ]));
    a.appendChild(h('p.muted', { text: c.note }));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Was fördert welche Übung?' }), h('ul', {}, SKILLS.map(s => h('li', {}, [h('b', { text: `${s.emo} ${s.title}: ` }), s.komp])))]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'So arbeitet Capy' }), h('ul', {}, [
      'Gestufte Hilfe: 1. Fehler → Mutmach-Satz und Tipp. 2. Fehler → Hilfe-Bild (Zwanzigerfeld, Rechenstrich, Uhr …). 3. Fehler → Capy rechnet Schritt für Schritt vor, danach kommt sofort eine leichtere Aufgabe.',
      'Jede Einheit endet mit einer gelösten Aufgabe. Es gibt keine Punktabzüge und kein rotes „Falsch“.',
      'Vier Stufen je Thema: Nach 3 Treffern im ersten Versuch geht es eine Stufe höher, bei wiederholten Schwierigkeiten eine Stufe zurück.',
      'Fehlermuster werden erkannt (z. B. „um 1 daneben“ als Hinweis auf zählendes Rechnen) und führen zu Trainingsmissionen: 70 % sichere Aufgaben, 30 % Förderung.',
      'Ein Edelstein gibt es erst, wenn ein Thema an zwei verschiedenen Tagen sicher gelöst wurde.',
      'Bei schnellem Raten oder mehreren schweren Aufgaben hintereinander schlägt Capy eine Pause vor.'
    ].map(t => h('li', { text: t })))]));
  }

  function links(a) {
    PARENTS.links.forEach(g => a.appendChild(h('div.card', {}, [h('h3', { text: g.group }), h('ul', {}, g.items.map(l => h('li', {}, [l.url ? h('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.name }) : h('b', { text: l.name }), ' – ' + l.desc])))])));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Bücher und Materialien' }), h('ul', {}, PARENTS.books.map(b => h('li', { text: b })))]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Spiele für die ganze Familie' }), h('ul', {}, PARENTS.games.map(([t, d]) => h('li', {}, [h('b', { text: t + ': ' }), d])))]));
    a.appendChild(h('p.muted', { text: 'Alle Links wurden mit Sorgfalt ausgewählt. Inhalte externer Seiten können sich ändern, bitte gelegentlich prüfen.' }));
  }

  function privacy(a) {
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Datenschutz' }), h('ul', {}, PARENTS.privacy.map(t => h('li', { text: t })))]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'KI-Unterstützung' }), h('ul', {}, PARENTS.ai.map(t => h('li', { text: t })))]));
    a.appendChild(dataCard());
  }

  function dataCard() {
    const msg = h('p.muted', { 'aria-live': 'polite' });
    const file = h('input#importFile', { type: 'file', accept: 'application/json,.json', hidden: true });
    file.onchange = () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { Store.importData(r.result); msg.textContent = 'Fortschritt wurde geladen.'; } catch (e) { msg.textContent = 'Die Datei konnte nicht gelesen werden: ' + e.message; } }; r.readAsText(f); };
    let armed = false;
    const del = h('button.btn.soft', { text: '🗑️ Alle Daten löschen', onclick: () => {
      if (!armed) { armed = true; del.textContent = 'Wirklich alles löschen? Nochmal tippen'; msg.textContent = 'Name, Fortschritt und Belohnungen werden auf diesem Gerät gelöscht.'; return; }
      Store.reset();
    } });
    return h('div.card', {}, [h('h3', { text: 'Daten verwalten' }), h('div.row', {}, [
      h('button.btn', { text: '💾 Fortschritt sichern', onclick: () => { const b = new Blob([Store.exportData()], { type: 'application/json' }); PDF.download(b, `capy-mathe-sicherung-${U.today()}.json`); msg.textContent = 'Die Sicherungsdatei wurde erstellt.'; } }),
      h('button.btn.soft', { text: '📂 Sicherung laden', onclick: () => file.click() }), file, del
    ]), msg]);
  }

  function settings(a) {
    const st = Store.state;
    const name = h('input.namefield#setName', { value: st.name, maxlength: 20 });
    const buddy = h('input.namefield#setBuddy', { value: st.buddy, maxlength: 16 });
    const chk = (id, label, key) => { const c = h('input#' + id, { type: 'checkbox', style: 'width:28px;height:28px' }); c.checked = !!st.settings[key]; c.onchange = () => { st.settings[key] = c.checked; Store.save(); App.applySettings(); }; return h('label.row', { for: id, style: 'min-height:48px' }, [c, label]); };
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Namen' }), h('div.row', {}, [h('label', { for: 'setName', text: 'Kind:' }), name, h('label', { for: 'setBuddy', text: 'Lernbuddy:' }), buddy, h('button.btn', { text: 'Speichern', onclick: () => { st.name = name.value.trim() || 'Reporterin'; st.buddy = buddy.value.trim() || 'Capy'; Store.save(); App.refreshBrand(); Capy.say(`Hallo ${st.name}, ich bin ${st.buddy}!`, 'cheer'); } })])]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Ton und Bewegung' }), chk('setSound', 'Töne und Vorlesen an', 'sound'), chk('setSpeech', 'Capy liest Aufgaben automatisch vor', 'speech'), chk('setCalm', 'Ruhiger Modus (weniger Animationen)', 'calm')]));
    a.appendChild(h('div.card', {}, [h('h3', { text: 'Neu starten' }), h('div.row', {}, [
      h('button.btn.soft', { text: '🧠 „Was ist Lernen?“ zeigen', onclick: () => Screens.intro() }),
      h('button.btn.soft', { text: '🔍 Startcheck wiederholen', onclick: () => Engine.startcheck() })
    ])]));
    a.appendChild(dataCard());
  }

  Screens.lockParents = () => { unlocked = false; document.getElementById('app').classList.remove('parents'); };
})();
