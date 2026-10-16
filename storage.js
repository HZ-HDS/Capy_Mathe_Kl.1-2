/* Speicher: alles bleibt im localStorage dieses Geräts.
   Funktioniert auch, wenn der Speicher gesperrt ist (dann nur bis zum Neuladen). */
window.Store = (function () {
  const KEY = 'capy-mathe-v1';
  const fresh = () => ({
    version: 1,
    name: '', buddy: 'Capy', created: U.today(),
    settings: { sound: true, speech: true, calm: false },
    introSeen: false, startcheckDone: false, recommended: 'w1',
    skills: {},          // je Übungstyp: Stufe, Versuche, Fehlertypen, Tage
    sessions: [],        // Verlauf der Einheiten
    stars: 0, coins: 0,  // Mutmach-Sterne, Capy-Geld
    items: [], room: {}, // Gegenstände und Positionen im Zimmer
    chapters: { w1: 0, w2: 0, w3: 0 },
    gems: [],            // gemeisterte Übungstypen (Stärken-Schatzkiste)
    reflections: [],
    unlocked: [],        // freigeschaltete Sonder-PDFs
    lastVisit: null, letterWeek: null
  });
  let state = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(fresh(), JSON.parse(raw));
  } catch (e) { /* Speicher nicht verfügbar: mit frischem Zustand weiter */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorieren */ }
    if (window.App) App.refreshCounters();
  }
  function skill(id) {
    if (!state.skills[id]) state.skills[id] = { level: 1, tries: 0, first: 0, solved: 0, errors: {}, days: {}, streak: 0, lastSeen: null, goodDays: [] };
    return state.skills[id];
  }
  function reset() { state = fresh(); save(); location.reload(); }
  function exportData() { return JSON.stringify(state, null, 2); }
  function importData(txt) {
    const d = JSON.parse(txt);
    if (!d || typeof d !== 'object' || !('skills' in d)) throw new Error('Keine gültige Sicherungsdatei.');
    state = Object.assign(fresh(), d); save();
  }
  return { get state() { return state; }, save, skill, reset, exportData, importData };
})();
