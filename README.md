# Coco

A Video.js v10 video skin for React, styled with CSS. It started from the Scaffold skin, and began life as a copy of the liquid-glass "docomo" player — this repo is where the next design direction gets built.

## Design thinking

The player is a pane of liquid glass with a **24px corner** (`--vo-radius-plate`), a dark tint under an SVG displacement filter — `backdrop-filter: blur(0px) url(#glass-distortion) blur(0px) saturate(1.5) brightness(1.1)`, never `filter`, so the picture under the panel actually bends — and one edge stack shared by every glass pane: a 1px white line, a bright bead along the top-left, a soft inner bloom and a deep drop shadow. The picture runs edge to edge inside the plate, and the skin samples the frame to tint that plate toward the picture, scene by scene.

Floating along the foot of the picture is **the control: a deck**. Six slim cards in a row, one per feature — play, volume, progress, quality, speed and screen — like the strip of photographs in an accordion gallery. Collapsed, each is a 44×44 square of liquid glass carrying nothing but its mark, white and drawn at a 2.4 stroke, with 4px of air between them. Point at one (or Tab to it) and that card swells to ~340px over 620ms while the others stay squares; inside, the feature blooms: a rail for volume, progress, quality and speed, two keys for picture-in-picture and fullscreen. The play key is the exception — a fixed square that never folds or widens, marked by the solid white play/pause glyph. The deck is centred, 16px off the bottom edge.

The rails are all one material: a grey `#a8a492` capsule with a `#fcf2e5` cream fill running from the left and the value printed in ink in the middle — a bare percent for volume, the elapsed time for progress, the current option for quality and speed. Drag anywhere on one to set it; arrows step, Home and End jump to the ends. The screen card merges picture-in-picture and fullscreen behind a single gear mark and opens onto two cream keys. Opened or closed, a card is the same liquid glass — the open one is only wider — so the picture never stops bending through it. Under reduced transparency or increased contrast the cards fall back to a solid dark surface.

When the pointer leaves the player or rests for 1.5s, the deck drops out of the tile and fades back up on movement; it stays up while something inside it has keyboard focus — the video itself is never touched. Every card is reachable by Tab, Enter or Space opens one, and the player's own hotkeys keep working around it.

The deck is real Video.js UI underneath: play, volume, quality, rate, picture-in-picture, fullscreen and the menus all go through the player's primitives, so keyboard, focus and screen-reader behaviour come from the player itself; only the rails drive the media element directly. Icons come from Hugeicons' free set, wrapped once in `src/video/shared/icons.tsx` so every card reads as one family.

The shared motion slider (`src/components/ui/slider.tsx`) is still in the repo — thumb follows the pointer, rubber-bands past the ends, settles with the speed of the release, rolling digits in a bubble — but the deck no longer mounts it: its rails are the replacement.

Mux playback ID (bonus): the preview plays Mux asset `ClA94sikONPeAkP5tJX0061EAGzjqi9YSE26I00BF02cQE` (`https://stream.mux.com/ClA94sikONPeAkP5tJX0061EAGzjqi9YSE26I00BF02cQE.m3u8`, HLS). Keep the asset live through judging.

## One minimal page

One page with the player on it, nothing else: no header, no picker, and no video file bundled with the site. The page itself is warm cream (`#FCF2E5`) under a full-screen sheet of liquid glass, so the light behind the player ripples. Under the player sits an **Upload a video** pill for screening a local file, with **Back to the Mux clip** to return.

## Develop

```sh
npm run dev
```

The preview mounts the skin alone at `/`. Its settings live in the URL — `/?width=384&ratio=9:16&dir=rtl&locale=ar` — and the stage otherwise fills the viewport.

## Deploy

```sh
npm run deploy
```

It asks where to deploy: Vercel, Netlify, or Cloudflare Pages. Name one to skip the question, such as `npm run deploy vercel`. The first time, the host's CLI signs you in and creates the project, then every run prints the URL.

To deploy on every push instead, import the repo on Vercel or Netlify; `vercel.json` and `netlify.toml` already describe the build. The build uses relative URLs, so `dist/` also works on any static host, including in a subfolder.

## Where things live

- `src/video/`: the skin — `skin.tsx` is the React tree, `skin.css` the Scaffold base, `glass.css` the design layer.
- `src/components/ui/`: the shared motion slider (kept, no longer mounted) and the radial command wheel (unmounted).
- `apps/preview/`: the one-page preview that mounts the skin.
- `vercel.json`, `netlify.toml`: how those hosts build the site.
- `skin.json`: records the Video.js version the skin was created with. Keep it.

## Learn more

- [Build your own skin](https://videojs.org/docs/framework/react/guides/build-your-own-skin)
- [Customize skins](https://videojs.org/docs/framework/react/guides/customize-skins)
- [UI components](https://videojs.org/docs/framework/react/guides/ui-components)
