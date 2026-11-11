# Coco

A Video.js v10 video skin for React, styled with CSS. It started from the Scaffold skin, and began life as a copy of the liquid-glass "docomo" player — this repo is where the next design direction gets built.

## Design thinking

*This section describes the inherited starting point and will be rewritten once Coco has its own direction.*

The player is a pane of liquid glass: `--vo-radius-plate` (43px) corners, a dark tint under an SVG displacement filter — `backdrop-filter: blur(0px) url(#glass-distortion) blur(0px) saturate(1.5) brightness(1.1)`, never `filter`, so the picture under the panel actually bends — and one edge stack shared by every pane: a 1px white line, a bright bead along the top-left, a soft inner bloom and a deep drop shadow. The picture runs edge to edge inside the rounding.

Floating over it is **the control**, full width of the dock: time either side of the timeline, then the transport, mute and a short volume fader, with the settings and screen keys on the right. Buttons are ghost circles with white icons, apart from the transport, which is a solid white circle. The settings card wears the same glass at an 18px corner, with pill rows and a single highlight pill that glides between them as you move with a pointer or the keyboard. The skin also samples the frame to tint the glass toward the picture, scene by scene.

Both the timeline and the fader are the same custom slider (`src/components/ui/slider.tsx`): the thumb follows the pointer, rubber-bands past the ends, settles with the speed of the release, and carries a bubble of rolling digits while it is dragged or moved by keyboard. Everything else is real Video.js UI — play, mute, menus, rate, quality, captions, PiP, fullscreen, hotkeys — so keyboard, focus and screen-reader behaviour come from the player itself. Icons come from Hugeicons' free set, wrapped once in `src/video/shared/icons.tsx` so every key, menu and indicator reads as one family.

Mux playback ID (bonus): the preview plays Mux asset `pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE` (`https://stream.mux.com/pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE.m3u8`, HLS). Keep the asset live through judging.

## One minimal page

One page with the player on it, nothing else: no header, no picker, and no video file bundled with the site. The page itself is cool white under a full-screen sheet of liquid glass, so the light behind the player ripples. Under the player sits an **Upload a video** pill for screening a local file, with **Back to the Mux clip** to return.

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
- `src/components/ui/`: the shared motion slider used for the timeline and the fader.
- `apps/preview/`: the one-page preview that mounts the skin.
- `vercel.json`, `netlify.toml`: how those hosts build the site.
- `skin.json`: records the Video.js version the skin was created with. Keep it.

## Learn more

- [Build your own skin](https://videojs.org/docs/framework/react/guides/build-your-own-skin)
- [Customize skins](https://videojs.org/docs/framework/react/guides/customize-skins)
- [UI components](https://videojs.org/docs/framework/react/guides/ui-components)
