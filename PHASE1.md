# Phase 1 — Rebrand & Build Pipeline (Work Plan)

Objective: turn the forked Recordly codebase into **OpenSpype** and prove it builds on Windows with a working installer pipeline. No feature changes yet.

## Status

- [x] Fork created (jawadsafi123/Recordly, pending rename to `OpenSpype`)
- [x] Branch `phase-1-rebrand` created from `main`
- [x] README.md replaced with OpenSpype branding + roadmap
- [x] ATTRIBUTION.md added (AGPL-3.0 compliance)
- [ ] Repo renamed to `OpenSpype` in GitHub Settings
- [ ] package.json rebrand (below)

## Task 1 — package.json rebrand

In `package.json`, change:

- `"name": "recordly"` → `"openspype"`
- `"productName": "Recordly"` → `"OpenSpype"`
- `"description"` → `"A free, privacy-first screen recorder with audio enhancement and offline voice studio."`
- `"author": "webadderall"` → `"jawadsafi123"`
- `"homepage"` and `"repository.url"` / `"bugs.url"` → point to `jawadsafi123/OpenSpype`

## Task 2 — App-wide name replacement

Find every user-visible occurrence of `Recordly` / `recordly` and replace with `OpenSpype` / `openspype`:

- Window titles and menus (`BrowserWindow` title, menu templates)
- Tray / dock label
- About dialog + attribution text (see ATTRIBUTION.md)
- Settings UI strings, onboarding text
- Installer metadata in `electron-builder` config (appId, productName, artifact names)
- Project file extension handling: `.recordly` → `.openspype` (also check file association config)
- Auto-update feed URL (electron-updater config) — **must** point to `jawadsafi123/OpenSpype` releases
- User-data directory name (Electron `app.getPath('userData')` app name)

**Do NOT delete**: the attribution lines referencing Recordly (required by license). Keep them in About + ATTRIBUTION.md only.

## Task 3 — Branding assets

- New icon: `build/` icon set (ico/icns/png) — placeholder icon acceptable for Phase 1
- Splash/window titles use OpenSpype
- Remove Recordly marketplace URL references (marketplace.recordly.dev is a Recordly service; do not ship links to it)

## Task 4 — Build pipeline on Windows

Reference prerequisites: Node.js 22+, Visual Studio 2022 Build Tools (C++ workload), CMake, Git.

```bash
npm install
npm run build:platform-native-helpers   # builds native helpers (WGC capture, cursor monitor, etc.)
npm run build:win
```

Expected outputs: NSIS installer (.exe) and portable exe in `dist/`.

Then set up GitHub Actions (free CI) to run the build on every push — copy the upstream release workflow and adjust names/paths.

## Task 5 — Verification checklist

- [ ] `npm run dev` launches the app titled "OpenSpype"
- [ ] A test recording (screen + mic) completes without crash
- [ ] Export to MP4 works
- [ ] Project save/open uses `.openspype` extension
- [ ] Installer builds without errors
- [ ] About screen shows attribution text
- [ ] No Recordly branding remains in UI (search codebase for "Recordly")
- [ ] No telemetry/marketplace endpoints called

## Known upstream bugs to reproduce (Phase 2 targets)

Before fixing, reproduce on the rebranded build:

- Audio drift on long recordings (upstream issues #252, #809, #966)
- Webcam/audio gradual desync (#809)
- Dropped frames under CPU load (#966)
- macOS permission loop (#960 — not our priority; Windows first)

## Branch policy

- `main` stays clean — all work on `phase-1-rebrand` until the Phase 1 checklist passes
- Then merge via PR for a clean history

## Phase 2 preview — first engineering targets

1. Reproduce audio drift with a 10-minute screen + mic recording on Windows
2. Instrument timestamps: log audio/video frame arrival and mux offsets
3. Introduce drift-compensation at muxing time (FFmpeg `-itsoffset` / filter-based correction)
4. Add the speed-sync acceptance test (speech at start/middle/end × speeds 0.75–2.0)
