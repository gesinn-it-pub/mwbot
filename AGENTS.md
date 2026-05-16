<!-- THIS FILE IS AUTO-GENERATED. Edit AGENTS-source.adoc instead. -->

# Coding Conventions

**Coding Conventions — General**

All source files regardless of language must follow these baseline
rules.

- Encoding: UTF-8 without BOM

- Line endings: Unix-style LF (not CR+LF)

- Maximum line length: 120 characters

- No trailing whitespace

- Newline at end of file

**Coding Conventions — JavaScript**

Tooling: [ESLint v9](https://eslint.org/) (code quality) +
[Prettier](https://prettier.io/) (formatting). Run locally:
`npm run lint` / `npm run format:check` (or `npm test`).

Target: Node.js 20+. Declare in `package.json`:

``` json
"engines": { "node": ">=20.0.0" }
```

**ESLint — flat config (v9+)**

New repositories use [flat
config](https://eslint.org/docs/latest/use/configure/configuration-files)
(`eslint.config.js`). Install:
`npm install --save-dev eslint @eslint/js globals eslint-config-prettier`

``` js
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: globals.node,
            ecmaVersion: 2022,
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'error',
        },
    },
    prettier, // disables ESLint rules that conflict with Prettier
];
```

<div class="note">

Projects with `"type": "commonjs"` in `package.json` must use CJS syntax
in `eslint.config.js` (`require` / `module.exports`).

</div>

Run: `npm run lint` (`eslint src/ test/`).

**Prettier — code formatting**

Formatting (indentation, quotes, line length) is owned by Prettier, not
ESLint rules. Install: `npm install --save-dev --save-exact prettier`

``` json
// .prettierrc
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 4,
  "printWidth": 120,
  "trailingComma": "es5"
}
```

Format: `prettier --write src/ test/`  
Check (CI): `prettier --check src/ test/`

**Module system**

- New projects: ES Modules (`import` / `export`) with `"type": "module"`
  in `package.json`

- Existing CommonJS code (`require` / `module.exports`) does not need to
  migrate

- One concern per file; filename reflects its exported symbol
  (`BotRequest.js` for class `BotRequest`)

**Naming**

- Variables and functions: lowerCamelCase

- Constructors / classes: UpperCamelCase

- Constants: `ALL_CAPS`

- Acronyms as single words: `getHtmlSource`, not `getHTMLSource`

**Code style**

- `const` and `let` — never `var`

- `===` and `!==` always; no Yoda conditions

- Arrow functions for callbacks; async/await over raw Promise chains

- Optional chaining (`?.`) and nullish coalescing (`??`) over manual
  null checks

- Early returns over deeply nested `if` blocks

- JSDoc type annotations on public API functions encouraged

# Test Workflow

Tests require Docker and Make. All tests run inside a containerized
environment with a real MediaWiki instance managed via
`docker-compose.yml`.

**Full CI pipeline**

``` console
make ci
```

This runs: `make build` → `make up` (starts MediaWiki) →
`make test-coverage` → `make down`.

**Step by step**

Build Docker images (defaults: `NODE_VERSION=18`, `MW_VERSION=1.43`):

``` console
make build
# or: NODE_VERSION=20 MW_VERSION=1.43 make build
```

Start the MediaWiki wiki container and wait until it is ready:

``` console
make up
```

Run lint (`grunt lint`) and integration tests with coverage
(`grunt test-coverage`):

``` console
make test-coverage
```

Stop and remove containers:

``` console
make down
```

**Interactive shell**

Bash into the running mwbot container to run individual Grunt targets:

``` console
make bash
> npx grunt lint
> npx grunt mochacli
```

**Test matrix**

CI runs against multiple Node.js / MediaWiki version combinations. See
`.github/workflows/ci.yml` for the current matrix.

# Commit Convention

# Conventional Commits Policy

Commit messages follow the [Conventional Commits
specification](https://www.conventionalcommits.org/).

Commit format:

`type(scope): short description`

The scope is optional and should describe the affected subsystem,
module, or dependency when useful.

Examples:

- feat(api): add autocomplete endpoint

- fix(parser): handle empty token lists

- docs(readme): explain input architecture

- refactor(parser): simplify token parsing

- deps(smw): bump from 5.1.0 to 5.2.0

- ci(github): update workflow configuration

- test(api): add autocomplete tests

Recommended commit types:

- `feat` — new functionality

- `fix` — bug fixes

- `deps` — dependency updates

- `docs` — documentation changes

- `refactor` — internal code changes without behavioral change

- `test` — tests added or updated

- `ci` — changes to continuous integration configuration

- `chore` — repository maintenance tasks without impact on runtime
  behavior

Dependency updates:

- Use the `deps` type for dependency upgrades

- The scope should identify the dependency being updated

- Include the version change when applicable

Example:

- deps(smw): bump from 5.1.0 to 5.2.0

Guidelines:

- Use the imperative mood (e.g. "add feature", not "added feature")

- Keep the subject line concise

- Use the commit body to explain **why**, not only **what**

- Scopes should be short, lowercase identifiers (e.g. `api`, `parser`,
  `smw`, `mediawiki`, `docker`)

- Use `chore` only for repository maintenance tasks that do not affect
  runtime behavior, dependencies, CI configuration, or tests

# Versioning

# Versioning and Releases

This project follows [Semantic Versioning](https://semver.org/).

Version numbers follow the format:

`MAJOR.MINOR.PATCH`

Version increment rules:

- MAJOR — incompatible or breaking changes

- MINOR — backwards-compatible feature additions

- PATCH — backwards-compatible bug fixes

Breaking changes include (but are not limited to):

- incompatible API changes

- removal or renaming of public interfaces

- behavior changes that may break existing integrations

- increased minimum runtime or dependency requirements

- incompatible configuration or data format changes

- dependency upgrades that introduce breaking changes for users

Breaking changes must always increment the MAJOR version.
