# AGENTS.md

**Coco** — a Video.js v10 player skin, built for the Video.js Skins Design Challenge. It starts as a copy of an earlier skin (the liquid-glass "docomo" player) and is where the next, more ambitious design gets built.

## Vocabulary

The user's words, so we always mean the same thing:

- **"control"** — the **control panel**: the bar carrying play/pause, the timeline, time, volume/mute and the screen keys. In code that is `.vo-bar` in `src/video/glass.css` plus the layout in `src/video/shared/controls.tsx`. Not the whole player, not the settings card.
- **"player"** — the whole tile: `.ko-skin` (the video plus the floating control panel over it).
- **"menu" / "settings"** — the card and its option panels (`.media-menu-popup`).

## What this is

- A custom skin for Video.js v10 (Vite + React, `@videojs/react` 10.3.0).
- The skin lives in `src/video/` — `skin.tsx` is the React tree, `skin.css` is the Scaffold base every skin starts from, and each design mark gets its own small file next to it. `glass.css` is the current design layer.
- The preview page lives in `apps/preview/` — `index.html` mounts the player alone at `/`.

## Where coco starts

- Copied from the docomo skin at commit `7094343`, renamed to Coco (`package.json`, workbench `skin.name`, `videojs-skin-workbench:coco`). Unrelated leftovers from that repo were **not** copied: no test media, no `dist`, no `.vercel` link.
- Everything that follows in "The player right now" is inherited, working code — a starting point, not a design brief. Coco's own direction is still to be decided; anything here can be replaced.

## The player right now

- **The preview mounts the skin**: `apps/preview/src/frame/player.tsx` imports `VideoSkin` from `@/video/skin`, inside Video.js's `VideoPlayer`.
- **The glass is one SVG filter**: `src/video/shared/liquid-glass.tsx` renders `#glass-distortion` (`feTurbulence` → `feGaussianBlur` → `feDisplacementMap`, `FREQUENCY = 0.006`, `SCALE = 38`, and `color-interpolation-filters="sRGB"` — without sRGB the picture greys out). Keep both numbers low for a crystal sheet.
- **It must ride inside `backdrop-filter`, never `filter`**: an element with `filter` becomes its own backdrop root, so the displacement would run on an empty box. The value lives in a custom property (`.ko-skin`, `.vo-bar` and `.media-menu-popup` each set `--vo-liquid: blur(0px) url(#glass-distortion) blur(0px) saturate(1.5) brightness(1.1)` then `backdrop-filter: var(--vo-liquid)`) because the CSS minifier drops a raw `url()` value from `backdrop-filter` at build time — verified against `dist/assets/*.css`.
- **Roundness is one scale** on `.ko-skin`: `--vo-radius-plate: 43px` (the tile; the video inherits it), `--vo-radius-panel: 33px` (the control), `--vo-radius-card: 18px` (the settings card and its scrolling clip), `--vo-radius-row: 12px` (menu rows and the highlight pill), circles at `50%`. Keep nested corners parallel rather than inventing new numbers.
- **The tint** is one token: `--vo-dark: rgb(10 12 17 / 0.36)` under every pane of glass, on top of the four-part edge stack (`inset 0 0 0 1px white/.15`, `inset 1.5px 1.5px 0 white/.5`, `inset 0 0 12px white/.2`, `0 8px 32px black/.2`).
- **The skin reads the picture** (`src/video/behaviors/video-palette.tsx`): a 24×14 offscreen canvas samples the frame every 1.2s, bins pixels by hue (weighted by brightness and saturation) and writes `--vo-accent`, `--vo-tint`, `--vo-rim`, `--vo-water`, `--vo-glow` onto `.ko-skin`. Registered with `@property`, so a scene change glides over 900ms (instant under reduced motion). Greyscale frames leave the glass alone; a tainted canvas switches the behaviour off instead of throwing. The timeline and fader stay pure white (`--control-fill` / `--control-thumb`) — no palette tint there.
- **The control** is the glass panel itself (no helper layers: `.vo-glass` and `.vo-bar::after` are `display: none`), full width of the dock, inset 8px from the picture, `padding: 12px 14px`. Row one is current time / thin white rail / duration; row two is transport, mute and a 96px fader on the left plus settings and the screen keys on the right. Buttons are 34px ghost circles (40px on touch) with 22px glyphs; the transport is a solid white 52px circle (46px narrow, 56px on touch). No speed chips in the bar — the rate lives only in the settings card.
- **The settings card** rows are Audio, Quality, Captions and Speed, on a transparent content panel with one gliding highlight pill per panel (`shared/menu-glow.tsx`, driven by `data-highlighted`, so pointer and keyboard share it). Submenus get a short fixed window (`min(available, 13rem)`) that scrolls with a 6px rail, so every row stays reachable. Quality rows show the label only — no bitrate badges.
- **The icons are Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`), wrapped once in `src/video/shared/icons.tsx` under the lucide-style names the components already use. Nothing else imports the pack; size and colour stay in CSS.
- **The timeline and the fader are one shared slider**: `src/components/ui/slider.tsx` + `slider-utils/` (a motion/react slider — thumb follows the pointer, rubber-bands past the ends, settles with the release velocity, rolling-digit bubble while dragging or key-focused, arrows/Shift/PageUp/PageDown/Home/End). Themed through `--control-*`, `--focus-ring` and `--bubble-*` set on `.ko-skin`. `shared/progress-slider.tsx` binds it to `video.currentTime`/`duration`; `shared/volume-slider.tsx` to `video.volume`/`muted`. They drive the element directly rather than the Video.js store; everything else (play, mute, menus, rate, quality, captions, PiP, fullscreen, hotkeys, gestures) goes through Video.js primitives. `renderThumbnail` is still accepted by the skin's API and ignored.
- **The preview page** is just the player — no header, no picker — with an **Upload a video** pill under it (`apps/preview/src/frame/main.tsx`) that swaps in a local file through an object URL, plus **Back to the Mux clip** to return. It plays the Mux HLS asset `pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE` from `stream.mux.com`, so the deployed page bundles no video. The stage fills the viewport (`calc(100vw - 32px)`), so size is not a fixed workbench width.
- `src/skins/coco/` is a saved snapshot of an older version of this skin, kept for reference only — nothing imports it. It can be deleted whenever it stops being useful.

## The brief

Scored out of 25, plus up to 2 bonus points.

- **Visual design and originality (10)** — a distinctive concept with cohesive typography, colour, iconography and layout. Memorable, original, carefully resolved.
- **Usability and interaction (5)** — intuitive controls, works across player sizes and touch.
- **Accessibility (5)** — readable over bright and dark footage, visible keyboard focus, comfortable touch targets, motion calms down under reduced motion.
- **Execution and polish (5)** — complete and consistent across controls, menus and player states. No broken layouts or unfinished states.
- Hard requirements: a public URL with no login playing video on the Video.js v10 player; play/pause, seek, time, volume/mute and fullscreen all working; responsive; operable by keyboard with menus that can be exited.
- Bonus: `+1` for playing a Mux-hosted video and supplying its public playback ID; `+1` for the skin running on a real, live site of the user's.

## Commands

- `npm install`, then `npm run dev` to run it.
- `npm run typecheck` and `npm run build` must stay clean.
- `npm run deploy` / `deploy:vercel` for a public URL.

## Working rules

- **Never run automated verification** — no headless browser, no screenshots, no smoke tests, no "is it up" probes. Make the change, then ask the user to test and wait for their report. Only run a check if they ask for that specific check.
- Keep this file and `README.md` in sync with what the skin actually does.
