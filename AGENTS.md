# AGENTS.md

**Coco** — a Video.js v10 player skin, built for the Video.js Skins Design Challenge. It starts as a copy of an earlier skin (the liquid-glass "docomo" player) and is where the next, more ambitious design gets built.

## Vocabulary

The user's words, so we always mean the same thing:

- **"control"** — the **deck**: the row of cards at the foot of the picture. In code that is `src/video/shared/deck.tsx` plus the `.vo-deck*` rules in `src/video/glass.css`, mounted from `shared/controls.tsx` inside `.vo-bar`. Not the whole player.
- **"player"** — the whole tile: `.ko-skin` (the video plus the deck floating over it).
- **"menu" / "settings"** — the card and its option panels (`.media-menu-popup`).

## What this is

- A custom skin for Video.js v10 (Vite + React, `@videojs/react` 10.3.0).
- The skin lives in `src/video/` — `skin.tsx` is the React tree, `skin.css` is the Scaffold base every skin starts from, and each design mark gets its own small file next to it. `glass.css` is the current design layer.
- The preview page lives in `apps/preview/` — `index.html` mounts the player alone at `/`.

## Where coco starts

- Copied from the docomo skin at commit `7094343`, renamed to Coco (`package.json`, workbench `skin.name`, `videojs-skin-workbench:coco`). Unrelated leftovers from that repo were **not** copied: no test media, no `dist`, no `.vercel` link.
- Everything that follows in "The player right now" is the working code, not a design brief — Coco's own direction is the deck described there, and anything in it can still be replaced.

## The player right now

- **The preview mounts the skin**: `apps/preview/src/frame/player.tsx` imports `VideoSkin` from `@/video/skin`, inside Video.js's `VideoPlayer`.
- **The glass is one SVG filter**: `src/video/shared/liquid-glass.tsx` renders `#glass-distortion` (`feTurbulence` → `feGaussianBlur` → `feDisplacementMap`, `FREQUENCY = 0.006`, `SCALE = 38`, and `color-interpolation-filters="sRGB"` — without sRGB the picture greys out). Keep both numbers low for a crystal sheet. It dresses the tile and the deck: the tile's recipe lives on `.ko-skin::after`, and each deck card declares the same value locally (the tile's `--vo-liquid` is not inherited) at saturate 1.6 / brightness 1.08.
- **It must ride inside `backdrop-filter`, never `filter`**: an element with `filter` becomes its own backdrop root, so the displacement would run on an empty box. The value lives in a custom property (`.ko-skin` sets `--vo-liquid: blur(0px) url(#glass-distortion) blur(0px) saturate(1.5) brightness(1.1)` then `backdrop-filter: var(--vo-liquid)`) because the CSS minifier drops a raw `url()` value from `backdrop-filter` at build time — verified against `dist/assets/*.css`.
- **Roundness is one scale** on `.ko-skin`: `--vo-radius-plate: 24px` — the tile's corner — and the deck's cards at 12px, circles at `50%`. `--vo-radius-panel: 30px`, `--vo-radius-card: 18px` and `--vo-radius-row: 12px` are left over from the earlier island and its menu and nothing in the deck reads them. Keep nested corners parallel rather than inventing new numbers.
- **The tint** is one token: `--vo-dark: rgb(10 12 17 / 0.36)` under the plate, on top of the four-part edge stack (`inset 0 0 0 1px white/.15`, `inset 1.5px 1.5px 0 white/.5`, `inset 0 0 12px white/.2`, `0 8px 32px black/.2`).
- **The skin reads the picture** (`src/video/behaviors/video-palette.tsx`): a 24×14 offscreen canvas samples the frame every 1.2s, bins pixels by hue (weighted by brightness and saturation) and writes `--vo-accent`, `--vo-tint`, `--vo-rim`, `--vo-water`, `--vo-glow` onto `.ko-skin`. Registered with `@property`, so a scene change glides over 900ms (instant under reduced motion). Greyscale frames leave the glass alone; a tainted canvas switches the behaviour off instead of throwing. The deck's rails are fixed grey and cream, so no rail ever depends on the palette — the tint reaches the tile only.
- **The control is the deck** (`shared/deck.tsx`): a centred row of slim cards at the foot of the picture, one per feature — play, volume, progress, quality, speed, screen. Collapsed they are 44×44 squares of liquid glass in a 4px gap, each showing only its mark (22px, stroke 2.4, white); the card under the pointer or keyboard focus grows to `min(340px, 36vw)` over 620ms while the rest stay squares, and its body fades in after a 240ms delay (width transition removed under reduced motion). Cards whose options are missing — no renditions, no rate list — are not rendered at all. The play card is `[data-fixed]`: never folded, never widened, the one card outside the accordion, carrying the solid white play/pause glyph (both icons paint `fill: currentColor; stroke: none`, so the marks are filled shapes). The screen card merges picture-in-picture and fullscreen behind one gear mark and opens onto two cream keys. `.vo-dock` centres the deck with 16px of padding. When the pointer leaves the player or rests for 1.5s the deck drops out of the tile and fades back up on movement; `behaviors/idle-hide.tsx` sets `data-ko-panel-hidden` and keeps it up while a control has keyboard focus or a menu is open. Reduced motion keeps the fade only.
- **The deck's material**: a collapsed card is a dark tint (`rgb(16 20 26 / 0.34)`) under the same displacement filter as the tile — declared locally, since the tile's `--vo-liquid` lives on `.ko-skin::after` — plus a white rim and inner highlight. The opened card is the **same glass, only wider**: it must never swap to an opaque slab or a flat blur, so the picture keeps bending through it. The rails are one material: a grey `#a8a492` capsule, a `#fcf2e5` cream fill from the left, the value in ink (`--vo-ink`) in the middle — a bare percent for volume, the elapsed time for progress, the current option for quality and speed — and a small ink icon at the left where one applies. The screen keys are solid cream circles with ink glyphs. Under `prefers-reduced-transparency: reduce` or `prefers-contrast: more` the cards fall back to a solid `rgb(40 38 34 / 0.94)`.
- **The wash is parked** (`shared/ocean-wash.tsx`): nothing mounts it and `.vo-bar` paints no sand any more, so the deck sits straight on the picture. The behaviour that file still implements, if it is ever remounted — on pointer enter of the player the beach floods with a **real clip of the sea**, not a drawing. The `<video>` is muted, looping, `playsInline`, `preload="none"`, `aria-hidden`, `pointer-events: none`, and sits at z-index 0 inside `.vo-bar` under the row (z-index 1); `OceanWash` owns the wiring and the clip's URL arrives as `oceanSrc` on `VideoSkin` (default `./ocean.mp4`, served from `apps/preview/public/`; a missing file is caught by `onError`, logged once and the beach simply stays dry). `data-ko-ocean` on `.ko-skin` is the switch: `glass.css` fades the layer in and opens a `clip-path` downward from the picture edge over 720ms, so the sea spills in over the sand; one 2px foam line rides the arriving edge and fades. While the water is in, the bar's ink flips to white (`--vo-ink`, times, the timeline and the focus rings) over a dark scrim, so no ink ever sits on moving blue; the chrome cross-fades over 220ms. On pointer leave (or when keyboard focus leaves the panel) the clip closes again and the video is parked after the 780ms drain. The clip is never fetched under `prefers-reduced-motion` or Save-Data — the behaviour returns before setting the attribute, so the beach stays dry — and the layer is hidden under forced colours. It also pauses while `data-ko-panel-hidden` is set or the tab is hidden.
- **The old settings card is dead code**: nothing mounts `shared/settings-menu.tsx` (it still imports the radial `components/ui/circular-command-menu.*` wheel, also unmounted), and `shared/menu-glow.tsx` / `menu-item.tsx` were deleted. What follows is what that card used to be — cut from the same beach: the same `--vo-sand-surface` (speckle grain + `--vo-sand-deep` → `--vo-sand` (#ffe185) → `--vo-sand-crest` gradient), the same `--vo-sand-edge` rim and drop shadow, at an 18px corner, with ink type (no glass, no tint, no text-shadow). Scrollbars go warm (`rgb(120 84 40 / 0.35)`), the single gliding highlight pill is `rgb(120 84 40 / 0.18)` (`shared/menu-glow.tsx`, driven by `data-highlighted`, so pointer and keyboard share it), and the one badge gets a warm chip. Rows are Audio, Quality, Captions and Speed; a **footer row** (`.media-menu-screen`) carries the two keys the island no longer has — mute and fullscreen — as 34px ink circles with a 22px glyph. Submenus get a short fixed window (`min(available, 13rem)`) that scrolls with a 6px rail, so every row stays reachable. Quality rows show the label only — no bitrate badges.
- **The icons are Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`), wrapped once in `src/video/shared/icons.tsx` under the lucide-style names the components already use. Nothing else imports the pack; size and colour stay in CSS.
- **Sliders**: `src/components/ui/slider.tsx` + `slider-utils/` is the motion/react slider (thumb follows the pointer, rubber-bands past the ends, settles with the release velocity, rolling-digit bubble, arrows/Shift/PageUp/PageDown/Home/End), themed through `--control-*`, `--focus-ring` and `--bubble-*`. The deck no longer mounts it: its own `DeckRail` replaces both `shared/progress-slider.tsx` and `shared/volume-slider.tsx`, which are on disk but unused. Rails and the media element are driven directly rather than through the Video.js store; everything else (play, menus, rate, quality, PiP, fullscreen, hotkeys, gestures) goes through Video.js primitives. `renderThumbnail` is still accepted by the skin's API and ignored.
- **The preview page** is just the player — no header, no picker — with an **Upload a video** pill under it (`apps/preview/src/frame/main.tsx`) that swaps in a local file through an object URL, plus **Back to the Mux clip** to return. It plays the Mux HLS asset `ClA94sikONPeAkP5tJX0061EAGzjqi9YSE26I00BF02cQE` from `stream.mux.com`, so the deployed page bundles no video. The stage fills the viewport (`calc(100vw - 32px)`), so size is not a fixed workbench width.
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
