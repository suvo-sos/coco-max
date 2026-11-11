# Docomo

A Video.js v10 video skin for React, styled with CSS. It started from the Scaffold skin.

## Design thinking

The player is a pane of the same liquid glass — transparent tint, `blur(0px)`, the SVG displacement layer under the picture and an 8px glass rim the video sits inside — with a floating liquid-glass control panel in it — time either side of the timeline, then the transport, mute and a short volume fader. Both the timeline and the fader are the same custom slider (`src/components/ui/slider.tsx`): the thumb follows the pointer, rubber-bands past the ends, settles with the speed of the release, and carries a bubble of rolling digits while it is dragged or moved by keyboard. It slides up and un-blurs when it appears; the buttons are small ghost circles with white icons, apart from the transport, which is a solid white circle. Everything is real Video.js UI underneath — the timeline, volume, captions and menus all keep their keyboard, focus and screen-reader behaviour. Icons come from Hugeicons' free set, wrapped once in `src/video/shared/icons.tsx` so every key, menu and indicator reads as one family.

Mux playback ID (bonus): the preview plays Mux asset `pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE` (`https://stream.mux.com/pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE.m3u8`, HLS). Keep the asset live through judging.

## One minimal page

One page with the player on it, nothing else: no header, no icons, no picker, no upload, and no video file bundled with the site. The page itself is pastel light under a full-screen sheet of liquid glass, so the colour behind the player ripples.

## Develop

```sh
npm run dev
```

The workbench opens your skin in a slimmed-down version of the Video.js sandbox. It plays NASA's Cosmic Dawn trailer from Mux, with chapters; change the media in `apps/preview/src/frame/player`. The options panel sets the player's width and aspect ratio, the color scheme, text direction, and language, and playback options such as autoplay, muted, loop, and preload. The arrow button opens the preview on its own. The settings live in the URL, so a link such as `/?width=384&ratio=9:16&dir=rtl&locale=ar` opens the workbench in that state, and `/preview.html#width=384&ratio=9:16` opens the preview alone.

## Deploy

```sh
npm run deploy
```

It asks where to deploy the workbench: Vercel, Netlify, or Cloudflare Pages. Name one to skip the question, such as `npm run deploy vercel`. The first time, the host's CLI signs you in and creates the project, then every run prints the URL. Vercel and Netlify deploy to a preview URL you can share; to deploy to production instead, add `--prod` to the `deploy:netlify` script, or to both commands in `deploy:vercel`.

To deploy on every push instead, put the project on GitHub and import it on Vercel or Netlify; `vercel.json` and `netlify.toml` already describe the build. The build uses relative URLs, so `dist/` also works on any static host, including in a subfolder.

## Where things live

- `src/`: your skin, and only your skin. Keep, rewrite, or delete any of it.
  - `src/video/`: the skin component and its parts.
  - `src/styles/`: theme tokens and shared styles the skin imports, when it started from a packaged skin.
  - `src/skin.css`: global styles for the skin.
- `apps/preview/`: the workbench that previews the skin. You don't need to change it.
  - `src/shell/`: the Shadcn shell.
  - `src/frame/`: the page the shell frames. `player` mounts your skin in a player and sets the media it plays.
  - `public/`: files the preview serves, such as the chapters track.
- `vercel.json`, `netlify.toml`: how those hosts build the workbench.
- `skin.json`: what this skin is built from. Keep it; it records the Video.js version the skin was created with.

## Learn more

- [Build your own skin](https://videojs.org/docs/framework/react/guides/build-your-own-skin)
- [Customize skins](https://videojs.org/docs/framework/react/guides/customize-skins)
- [UI components](https://videojs.org/docs/framework/react/guides/ui-components)
