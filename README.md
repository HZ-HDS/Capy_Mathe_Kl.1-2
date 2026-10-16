# Capys Mathe-Regenwald 🦫

Eine spielerische Mathe-Lernwebsite für Klasse 1 und 2 (Baden-Württemberg) mit Capy, dem Capybara-Lernbuddy.
Schwerpunkt: Mengen sehen statt einzeln zählen, Zehnerfreunde und der Zehnerübergang.

Die Seite läuft komplett im Browser, braucht keinen Server, keine Anmeldung und speichert alles nur auf dem eigenen Gerät.

---

## Auf GitHub Pages veröffentlichen (ohne Vorkenntnisse)

1. **GitHub-Konto anlegen:** Auf <https://github.com> auf „Sign up“ tippen und ein kostenloses Konto erstellen.
2. **Neues Repository erstellen:** Oben rechts auf „+“ → „New repository“.
   - Name, zum Beispiel: `capy-mathe`
   - „Public“ auswählen (GitHub Pages ist für öffentliche Repositories kostenlos).
   - Auf „Create repository“ tippen.
3. **Dateien hochladen:** Auf der neuen, leeren Seite auf „uploading an existing file“ klicken.
   - Die ZIP-Datei vorher auf dem Computer entpacken.
   - **Den Inhalt** des Ordners `capy-mathe` (also `index.html`, `css`, `js`, `icons` usw.) in das Upload-Feld ziehen. Wichtig: `index.html` muss ganz oben liegen, nicht in einem Unterordner.
   - Unten auf „Commit changes“ klicken.
4. **GitHub Pages einschalten:** Im Repository auf „Settings“ → links „Pages“.
   - Bei „Source“: „Deploy from a branch“.
   - Bei „Branch“: `main` und `/ (root)` wählen, dann „Save“.
5. **Warten und öffnen:** Nach 1 bis 2 Minuten erscheint oben auf der Pages-Seite der Link, etwa
   `https://IHR-NAME.github.io/capy-mathe/`.

### Auf dem iPad wie eine App nutzen
1. Den Link in **Safari** öffnen.
2. Auf das Teilen-Symbol (Quadrat mit Pfeil) tippen → „Zum Home-Bildschirm“.
3. Jetzt startet Capy wie eine App, im Vollbild und auch ohne Internet.

> Tipp: Den Fortschritt speichert das iPad im Browser. Wenn Sie die Safari-Daten löschen, ist der Fortschritt weg. Im Eltern-Bereich unter „Datenschutz & KI“ können Sie den Fortschritt als Datei sichern.

### Später etwas ändern
Im Repository auf eine Datei tippen → Stift-Symbol → ändern → „Commit changes“. Nach einer Minute ist die Änderung online.
Nach größeren Änderungen in `sw.js` die Zeile `const CACHE = 'capy-mathe-v1'` hochzählen (z. B. `v2`), damit iPads die neue Version laden.

---

## Was steckt drin?

| Bereich | Inhalt |
|---|---|
| **Einstieg** | Bildergeschichte „Wie funktioniert Lernen?“ (Gehirn als Regenwald, Fehler als Spuren, Motivation, Lerntricks) und ein Startcheck ohne Noten |
| **Welt 1: Der Zahlenfluss** | Blitzblick, Zehnerfreunde, Plus und Minus bis 20 mit Zehnerübergang, Verdoppeln, Regenwald-Kiosk (Geld bis 20 €), Uhrzeit (volle und halbe Stunden) |
| **Welt 2: Die Hängebrücke** | Zehner bündeln, Analogieaufgaben (3 + 4 → 33 + 4), Hundertertafel, Ergänzen bis zum Zehner |
| **Welt 3: Land der großen Zahlen** | Plus und Minus bis 100 mit Rechenstrich, Einmaleins und Teilen, Markt mit Wechselgeld und Cent, Turmuhr (Viertel, Minuten, Uhr stellen, Zeitspannen) |
| **Capys Kino** | 7 animierte Erklärfilme mit Vorlesefunktion |
| **Capy als Motivator** | gestufte Hilfe, Fehleranalyse, Trainingsmissionen, Mission des Tages, Stärken-Schatzkiste, Mutmach-Sterne, Pausen bei Frust |
| **Belohnungen** | Capys Zimmer zum Einrichten, Shop mit Capy-Geld, 30 Geschichtenkapitel, PDFs (Ausmalbild, Bastelidee der Jahreszeit, Lied, Experiment, Steckbrief, Bastel-Uhr, Spielgeld, Urkunden, Capy-Brief) |
| **Eltern-Bereich** | Fortschritt je Thema, Förderplan, Tipps, Lernstoff Klasse 1 bis 3, Links, Spiele, Datenschutz, KI-Hinweis, Sicherung |

## So arbeitet Capy (die Lernlogik)

- **Gestufte Hilfe:** 1. Fehler → Mutmach-Satz und Tipp. 2. Fehler → Hilfe-Bild. 3. Fehler → Capy rechnet vor, danach folgt sofort eine leichtere Aufgabe. Jede Einheit endet mit einem Erfolg.
- **Vier Stufen pro Thema:** 3 Treffer im ersten Versuch → eine Stufe höher. Mehrmals Schwierigkeiten → eine Stufe zurück.
- **Fehlermuster:** z. B. „um 1 daneben“ (zählt noch), „um 10 daneben“ (Zehner vergessen), Zahlendreher, Zeiger vertauscht, Euro und Cent verwechselt.
- **Trainingsmission:** Wird ein Thema unsicher, schlägt Capy eine Mission vor, die die Grundlagen übt (Sandwich: etwa 70 % sichere, 30 % Förderaufgaben) und doppelt belohnt.
- **Edelstein:** erst, wenn ein Thema an zwei verschiedenen Tagen sicher gelöst wurde.

Alles ist nachvollziehbare Regel-Logik in `js/core/coach.js` und `js/core/engine.js`. Es läuft keine KI im Browser.

## Inhalte selbst anpassen

Alle Texte liegen im Ordner `js/data/`:

- `phrases.js` – Capys Sätze, Witze, Bewegungspausen
- `stories.js` – die Fortsetzungsgeschichten (`{name}` und `{buddy}` werden ersetzt)
- `rewards-data.js` – Gegenstände, Bastelideen, Experimente, Lieder
- `parents-data.js` – Tipps, Links, Datenschutztexte

Die Übungen stehen in `js/exercises/world1.js`, `world2.js` und `world3.js`. Jeder Übungstyp ist ein Block mit `gen(stufe)`.

## Ordnerstruktur

```
index.html          Startseite
manifest.json, sw.js  App-Installation und Offline-Nutzung
css/style.css       Gestaltung
icons/              App-Symbole
js/data/            Texte und Inhalte
js/core/            Speicher, Ton, Capy, Mathe-Material, PDF, Lernlogik
js/exercises/       Übungen der drei Welten
js/screens/         Bildschirme (Einstieg, Karte, Belohnungen, Eltern)
js/app.js           Start und Navigation
PROMPT.md           der Prompt, nach dem die Seite gebaut wurde
```

## Datenschutz

Keine Cookies, kein Tracking, keine externen Schriften oder Skripte. Fortschritt nur im `localStorage` des Geräts.
PDFs entstehen direkt im Browser. Die Vorlesefunktion nutzt die Sprachausgabe des Geräts.
GitHub kann als Hosting-Anbieter technische Zugriffsdaten protokollieren.

## Hinweis zur Entstehung

Die Website wurde mit KI-Unterstützung (Claude von Anthropic) entworfen und programmiert. Inhalte bitte von einem Erwachsenen prüfen.

## Ideen für die nächsten Ausbaustufen

- Klasse 2: Längen messen (cm/m), Geometrie (Symmetrie, Würfelgebäude), Daten und Zufall
- Klasse 1: Zahlenstrahl bis 20, Rechengeschichten selbst erfinden, Wochentage und Monate
- Eigene Tonaufnahmen für Capys Stimme
