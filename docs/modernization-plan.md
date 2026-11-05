# mwbot – Modernisierungsplan

## Phase 1 – Toolchain ✅ (abgeschlossen in 2.2.0)

- Grunt ersetzt durch npm scripts + direktes `mocha`/`eslint`/`prettier`
- `grunt`, `grunt-cli`, `grunt-eslint`, `grunt-mocha-cli`, `grunt-mocha-istanbul`,
  `load-grunt-tasks`, `time-grunt`, `istanbul` entfernt
- `mocha`, `c8`, `eslint`, `@eslint/js`, `globals`, `eslint-config-prettier`, `prettier` hinzugefügt
- `Gruntfile.js` gelöscht
- `eslint.config.js` (flat config v9, CJS-Syntax)
- `.prettierrc` angelegt
- `package.json` scripts: `lint`, `test`, `test:coverage`, `format:check`
- `engines` auf `>=20.0.0`

## Phase 2 – Dependency-Ablösung ✅ (abgeschlossen in 2.2.0)

- `request` → native `fetch` (Node 20 built-in)
  - `rawRequest()` und `request()` auf `fetch` umgeschrieben
  - Cookie-Handling: `tough-cookie` explizit
  - Upload (multipart): `FormData` (built-in) statt HAR-1.2-Umweg
- `bluebird` → native Promises + `p-map`
  - `MWBot.Promise`, `MWBot.map`, `MWBot.mapSeries` auf `p-map` / interne `pMapSeries` umgestellt
- MW-Mindestsupport auf 1.39 angehoben; `rvslots: 'main'` ist jetzt bedingungslos gesetzt
- Lesen ohne Login funktioniert wieder (`_ensureMwVersion()` lazy via siteinfo)

## Phase 3 – Code-Stil (nicht-breaking, vorab releasebar)

- Alle Promise-Ketten in `src/index.js` → `async/await` (#81)
- Promise-Konstruktor-Antipattern beseitigen (#81)
- `const`/`let` Cleanup, Optional Chaining (`?.`) und Nullish Coalescing (`??`) einführen (#81)
- Tests vollständig auf `async/await` (kein `done`-Callback mehr) (#83)
- `batch()`: dynamisches `this[operation](...)` durch explizite Map ersetzen (#82)

Reine Refactorings ohne Verhaltensänderung, in kleinen Commits, nach jedem Schritt Testlauf.

## Phase 4 – Major-Release 3.0.0: ESM-only, Node ≥ 22 (breaking) (#84)

- ESM: `"type": "module"`, alle `require()` → `import`, `eslint.config.js` auf ESM
- Nur ESM, kein Dual-Package. `exports`-Feld und zusätzlich `export { MWBot as 'module.exports' }`, damit
  `const MWBot = require('mwbot')` (inkl. `MWBot.logStatus`) ab Node 22.12 weiter die Klasse liefert
- Prüfen, dass `require('mwbot')` unter Node 22.12+ keine ExperimentalWarning auf stderr ausgibt
- `engines` auf `>=22` (Node 20 ist seit April 2026 EOL); `require()` erst ab 22.12 dokumentieren
- Option-Namen (Bot- und Request-Optionen) bleiben stabil
- danach ESM-only-Dependencies möglich (`p-map` 7, `chai-as-promised` 8), Dependabot-Ignore für `p-map` entfernen
- README, `examples/` und Release Notes (Migrationshinweise) aktualisieren
- vorher Wartungszweig `2.x` für Sicherheitsfixes anlegen
- vorab `3.0.0-rc.1` veröffentlichen, damit abhängige Projekte dagegen testen können
- JSDoc verbessern oder vollständige `.d.ts` generieren

## Phase 5 – formatversion=2 (breaking, getrennt von ESM) (#3)

formatversion=2 ändert die Antwortstruktur (`query.pages` als Array statt Objekt, `missing: true` statt `''`,
Revisionsinhalt unter `content` statt `*`) und bricht abhängige Projekte still. Deshalb nicht in 3.0.0, damit
sich Fehler nicht überlagern.

- zuerst eine Option, mit der die Format-Version explizit gesetzt werden kann (Default bleibt 1)
- konkrete Feldänderungen im Changelog dokumentieren
- Default erst in einem eigenen Major umstellen

## Phase 6 – Features (MINOR, additiv)

Nach Phase 3, unabhängig von Phase 4 und 5 releasebar. Zuerst kleine Änderungen mit klarem Nutzen:

- `assert`-Parameter (#72), `move()`-Optionen (#63)
- `edit()`: Section-Editing, `appendtext`/`prependtext`, Konflikt-Erkennung (#64, #65, #66)
- `upload()`: Chunked- und URL-Upload (#67, #68)
- `protect()`: konfigurierbares Expiry (#69)
- neue Methoden `undelete()` (#70) und `purge()` (#71)
- Rate-Throttling und nobots-Unterstützung (#21)

## Reihenfolge & Risiko

| Phase | Risiko | Scope | Status |
|---|---|---|---|
| 1 – Toolchain | minimal | PATCH | ✅ 2.2.0 |
| 2 – fetch + p-map | mittel (HTTP/Cookie) | PATCH | ✅ 2.2.0 |
| 3 – async/await, batch-Map, Modulaufteilung | gering | MINOR | ✅ 2.4.0 |
| 4 – ESM-only, Node ≥ 22 | hoch für Nutzer | MAJOR (3.0.0) | offen |
| 5 – formatversion=2 | hoch (stille Fehler) | MAJOR | offen |
| 6 – Features | gering | MINOR | offen |
