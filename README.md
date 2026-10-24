# OpenSpype

> Smart screen recorder with professional audio enhancement, an offline voice studio, and true audio/video sync — for Windows, macOS, and Linux. Free and open source.

**OpenSpype** is a free, privacy-first screen recorder and video editor. Record your screen with microphone and system audio, enhance your voice with one click, optionally replace your voice with synthetic voices offline, and export polished videos for YouTube, TikTok, Reels, and more — all without paid subscriptions, cloud accounts, or uploads.

---

## Quick Start

**Windows 10 (19041+) / macOS 14+ / Linux**

Download the latest installer from the [Releases](https://github.com/jawadsafi123/OpenSpype/releases) page (published once Phase 1 builds pass).

Build from source:

```bash
git clone https://github.com/jawadsafi123/OpenSpype.git openspype
cd openspype
npm install
npm run dev
```

Packaged builds:

```bash
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage
```

---

## Features

### Recording & Editing (all offline)
- Full-screen, single-window, and custom region recording
- Microphone + system audio capture
- Webcam bubble overlay
- Pause / resume recording
- Timeline editing: trim, split, speed regions, annotations
- Auto-zoom suggestions and manual zooms with easing controls
- Cursor smoothing, click effects, and motion blur
- Styled frames, wallpapers, and backgrounds
- MP4, GIF, and WebM export
- Autosave and recording crash recovery
- Customizable keyboard shortcuts

### Audio Enhancement (offline)
- One-click **Enhance Voice** preset for laptop microphones
- Loudness normalization to a configurable target
- Compressor + limiter to prevent clipping
- Steady noise reduction (fan noise, hiss) with optional speech-focused mode
- De-rumble, DC offset removal, and optional speech EQ
- Before/after preview, per-effect toggles, strength slider
- Live recording level meter and clipping warnings

### Voice Studio (offline, optional model pack)
- Replace your spoken voice with a synthetic voice, preserving the transcript
- 2–4 bundled voice presets (English first)
- Segment-by-segment alignment with natural pauses
- Pitch-preserving time stretching to fit original timing
- Revert to original audio at any time; non-destructive editing

### True Audio/Video Speed Sync (offline)
- Apply 0.75×, 1.0×, 1.25×, 1.5×, and 2.0× speed changes to both video and audio together
- Pitch-preserving stretching so sped-up speech stays natural
- Zero-drift exports that match the editor preview exactly

### Portrait & Social Export (offline)
- 9:16 vertical export for TikTok/Reels/Shorts with 4 modes:
  - **Smart Follow** — cursor-tracking auto-reframe that follows the action
  - **Blurred Fill** — blurred background fill, nothing cropped
  - **Styled Card** — title + animated captions on a styled background
  - **Facecam + Screen** — stacked layout
- One-click multi-format batch export: 16:9, 9:16, 1:1, 4:5
- TikTok-style word-by-word animated subtitles
- Export presets for YouTube, TikTok, LinkedIn, tutorials

### Optional AI Features (clearly labeled 🌐)
- AI auto-edit suggestions, AI chapters, auto-titles, YouTube description generator
- Local models by default; optional online mode uses **your own** free-tier API key
- Settings → "Online features" master switch (default **Off**)
- No telemetry, no uploads, no account required

---

## Privacy Promise

OpenSpype works fully offline. Recording, editing, audio enhancement, voice studio, captions, and export never touch the internet. Online-capable features are labeled with a 🌐 badge and disabled by default. We do not collect telemetry.

---

## Attribution & License

OpenSpype is licensed under the **AGPL-3.0** license.

OpenSpype is based on [Recordly](https://github.com/webadderallorg/Recordly) by webadderall, which started as a fork of [OpenScreen](https://github.com/siddharthvaddem/openscreen) by Siddharth Vaddem. See [ATTRIBUTION.md](ATTRIBUTION.md) for details.

---

## Roadmap

- [x] Phase 1: Fork, rebrand, attribution, build pipeline
- [ ] Phase 2: Recording stability — fix audio drift, dropped frames, permission loops
- [ ] Phase 3: Rebuild speed sync engine (0.75×–2.0×, pitch-preserving, zero drift)
- [ ] Phase 4: Audio Enhancement panel (FFmpeg + RNNoise DSP chain)
- [ ] Phase 5: Voice Studio (offline TTS, segment alignment) — Beta
- [ ] Phase 6: Portrait/social export (4 vertical modes, batch export)
- [ ] Phase 7: Polish — silence removal, music ducking, brand kit, crash recovery, autosave
- [ ] Phase 8: Optional online features (clearly labeled) + share links via user's own storage
- [ ] Phase 9: Browser extension one-click record

See [PHASE1.md](PHASE1.md) for the current work plan.
