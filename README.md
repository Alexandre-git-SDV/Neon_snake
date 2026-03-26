# Neon Snake

Classic Snake gameplay with an original arcade-style interface, responsive controls, and static-host deployment support.

## Run locally

```powershell
cd "C:\Users\Alexandre GOURAUD\Documents\CODEX DEV"
npm.cmd test
node server.mjs
```

Then open `http://127.0.0.1:5173`.

## Controls

- Move: Arrow keys or WASD
- Pause/Resume: `P` or `Space`
- Start/Resume: `Enter` or `Start` button
- Restart: `R` or `Restart` button
- Touch: On-screen directional buttons (mobile)
- Speed: Chill / Classic / Rush buttons

## Deploy on GitHub Pages

1. Push the repository to GitHub on branch `main`.
2. In GitHub, go to `Settings > Pages` and set source to `GitHub Actions`.
3. The workflow `.github/workflows/deploy-pages.yml` deploys automatically on each push to `main`.

## Full-version readiness

- Deterministic game engine with test coverage (`src/snake-logic.js`, `tests/snake-logic.test.js`).
- Tests live in `tests/` for cleaner deployment output.
- Responsive UI and mobile touch controls.
- Local high-score persistence via `localStorage`.
- Deployment workflow for continuous publishing.
