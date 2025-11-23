# Copilot / AI Agent Instructions — Autoleadsa

This file gives concise, actionable guidance so an AI coding agent can be productive quickly.

Overview
- Project: Node.js HTTP server using Express and Google GenAI (`@google/genai`).
- Entry point: `index.js` (declared as `main` in `package.json`).

Key files
- `index.js` — app startup, Express routes, and examples of `@google/genai` usage. Search for `GEMINI_API_KEY` here.
- `package.json` — scripts, dependencies, and the `type` field (must match the module style).
- `vercel.json` — deployment hints/config for Vercel when present.

How to run (local, PowerShell)
- Temporary env + run (PowerShell):
  - `$env:GEMINI_API_KEY = "your_key"; node index.js`
- Recommended `package.json` script:
  - Add: `"start": "node index.js"` so `npm start` works.

Important repo-specific notes
- `index.js` is written with ESM `import` — the repo should use `"type": "module"` in `package.json`. There is currently a conflicting `type` entry; remove duplicates and keep one.
- `index.js` references `GEMINI_API_KEY` (Gemini client). Never commit secret keys; prefer env vars and a `.env.example`.

Patterns & conventions
- Use ESM (`import`/`export`) consistently. If you change module style, migrate repository-wide.
- Keep Express route handlers small; move business logic into `lib/` or `services/` modules.
- Initialize external clients (e.g., GenAI) during startup — avoid heavy side-effects at top-level module execution.

Troubleshooting
- "Cannot use import statement outside a module": confirm Node 18+ and `package.json` `"type": "module"`.
- GenAI auth errors: ensure `GEMINI_API_KEY` is set in the environment before running.

Edit rules for agents
- Preserve module-system consistency; do not mix ESM and CommonJS in new files.
- Do not commit secrets; add or update a `.env.example` and document env vars in `README.md`.
- If you add deps, update `package.json` and keep changes minimal and documented in the PR description.

If you modify this file
- Keep entries short and fact-based. Update paths and examples when files move or startup changes.

Questions for maintainers
- Preferred `package.json` `type`: `"module"` (recommended) or `"commonjs"`?
- Where should env setup be documented: `README.md` or a dedicated `.env.example`?
# Copilot / AI Agent Instructions for Autoleadsa1

This file contains concise, repo-specific guidance to help AI coding agents be productive in this project.

Overview
- **Project type**: Node.js server app using ECMAScript modules (ESM) in `index.js` — confirm `package.json` `"type"` (see notes below).
- **Entry point**: `index.js` (declared as `main` in `package.json`). Run with `node index.js` or `npm start` once a `start` script is added.
- **Framework & SDKs**: uses `express` and `@google/genai` (Gemini) — expect HTTP routes plus calls to Google GenAI APIs.

Key files to inspect
- `package.json` — scripts, `type` field, dependencies (`@google/genai`, `express`).
- `index.js` — application entry; shows ESM `import` usage and example Gemini call (search for `GEMINI_API_KEY`).

Important repo-specific notes
- `index.js` uses `import` from `@google/genai` and a comment that the client uses `GEMINI_API_KEY` from a `.env` file. Search for `GEMINI_API_KEY` or `.env` usage when adding credentials.
- The `package.json` currently contains conflicting `"type"` entries (`"module"` and `"commonjs"`). This is invalid JSON semantics for runtime behavior — pick one:
  - Keep `"type": "module"` to use ESM imports (recommended given `index.js`).
  - Or switch code to CommonJS `require()`/`module.exports` and set `"type": "commonjs"`.
  - Ensure only one `type` field exists.

Developer workflows & commands
- Run locally (ESM):

```powershell
node index.js
```

- Add `start` script in `package.json` to use `npm start`:

```json
"scripts": {
  "start": "node index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

- Node version: ensure Node 18+ for ESM and modern syntax; if imports fail, confirm `package.json` `type` and Node version.

Patterns & conventions
- The code base currently uses ESM `import` in `index.js`. Follow ESM syntax (`import` / `export`) unless you intentionally migrate to CommonJS — do the migration project-wide.
- Keep HTTP handlers small and move business logic into `lib/` or `services/` if adding features.
- Avoid side-effects at module top-level; initialize network clients (GenAI) inside startup code or exported async init functions.

Integration points & external dependencies
- `@google/genai`: index.js demonstrates usage; the client reads `GEMINI_API_KEY` (documented in the file). When adding integrations, search code for where the client is instantiated and add env-based configuration.
- `express`: standard request/response patterns; preserve middleware ordering and error handlers.

What agents should do first (priority list)
1. Fix `package.json` `type` field to match the code (`"module"` for current `import` usage) and remove the duplicate.
2. Open `index.js` to inspect GenAI usage and the expected env var `GEMINI_API_KEY`.
3. Search the repo for other modules that may need ESM/CommonJS normalization.
4. Add a `start` script to `package.json` and document any required env vars in a `README.md` or `.env.example`.

Examples & troubleshooting
- If you see "Cannot use import statement outside a module": check `package.json` `"type"` and Node version.
- If GenAI calls fail with auth errors: set `GEMINI_API_KEY` in the environment (or `.env`) and restart.

Agent behavior rules (project-specific)
- Preserve module style consistency: prefer ESM for this repo unless you perform a deliberate, repo-wide migration to CommonJS.
- Do not add secrets to files; use env vars and a `.env.example` to document expected keys (`GEMINI_API_KEY`).
- When adding SDKs or external services, update `package.json` and document setup in `README.md`.

If you update this file
- Merge thoughtfully: preserve any human notes and ensure concrete, repo-specific facts are still accurate.

Open questions for the maintainer
- Which module system do you prefer (ESM `"module"` or CommonJS `"commonjs"`)?
- Where should we document required environment variables (suggest `README.md` or `.env.example`)?

If anything above is inaccurate or incomplete, please reply with pointers and I'll update this file.
