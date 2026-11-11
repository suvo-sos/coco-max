# AGENTS.md

We are building this for the Video.js hackathon, where we have to build the next video player — like we are redesigning the wheel.

## Vocabulary

- **"control"** — the user's word for **the control panel**: the glass bar with play/pause, the timeline, time, volume/mute and the screen keys. In code that is `.vo-bar` in `src/video/glass.css` plus the layout in `src/video/shared/controls.tsx`. When they say "the control", "wider control" or "the control bar", they mean this panel — not the whole player and not the settings card.
- **"player"** — the whole tile: `.ko-skin` (the video plus the floating control panel over it).
- **"menu" / "settings"** — the card and its option panels (`.media-menu-popup`).

## What this is

- A custom skin for the Video.js v10 player (Vite + React, Video.js 10.3.0).
- The skin lives in `src/video/` (edit `src/video/skin.tsx` and `src/video/skin.css`).
- The preview page lives in `apps/preview/` — `apps/preview/index.html` mounts the player alone at `/`.

## The player right now

- **The preview mounts the custom skin**: `apps/preview/src/frame/player.tsx` imports `VideoSkin` from `@/video/skin`.
- The skin is a fresh build on the Scaffold base: `src/video/skin.css` is the Scaffold component CSS, and each new design mark gets its own small file next to it (`src/video/glass.css` is the current design layer). The old K.O. II deck CSS was cut back to the Scaffold base (git history: `3454849`).
- **The bar is liquid glass**: `src/video/shared/liquid-glass.tsx` renders one SVG filter, `#glass-distortion` (`feTurbulence` → `feGaussianBlur` → `feDisplacementMap`, with `FREQUENCY = 0.006` and `SCALE = 38` at the top of that file: the two numbers that set how wide the ripple is and how hard it bends — keep both low for a crystal sheet). Inside the bar, a `.vo-glass` layer carries `backdrop-filter: blur(0px) saturate(150%) brightness(1.06)` plus `filter: url(#glass-distortion)`, so the picture under the panel ripples with no frost; the tint, gloss and rim stay on `.vo-bar` itself, content sits above at `z-index: 1`, and reduced transparency removes the layer.
- **The icons are Hugeicons**: `@hugeicons/react` + `@hugeicons/core-free-icons` (free set, ~14.9k glyphs). They are wrapped once in `src/video/shared/icons.tsx`, which exports them under the lucide-style names the components already use (`Play`, `Pause`, `Volume2`, `VolumeX`, `Maximize`, `ChevronRight`…), so nothing else imports the pack directly. Only the used glyphs end up in the bundle. Size and colour stay in CSS: the SVG `width`/`height` attributes lose to the class rules, and the glyphs inherit `currentColor`.
- `src/skins/docomo/` is an older saved snapshot and is unused.
- One page, just the player — no header, no picker — with an **Upload a video** pill under it (`apps/preview/src/frame/main.tsx`) that swaps in a local file via an object URL and a **Back to the Mux clip** key to return. The page is a pastel gradient under a full-screen liquid-glass sheet (`apps/preview/src/frame/preview.css`: `body` gradients + `.hop-page::before` with `backdrop-filter` and `filter: url(#glass-distortion)`), so the background behind the player ripples.
- It plays one video: the Mux HLS asset `pEPlVJYPMuiTQFXHuBrxKEou2702HeT1zLxkhRp0098uE` (streamed from `stream.mux.com`, so the deployed page needs no bundled file). A local cut, `apps/preview/public/1794394115060191.mp4` (H.264/AAC, 2688×1512, gitignored), can be swapped in from `apps/preview/src/frame/home.tsx`; the Mux asset is the submission's playback ID.
- **The look: a liquid-glass tile with a frosted glass bar** (`src/video/glass.css`). The player itself is the same liquid glass (`glass.css`): `--vo-radius-plate` (43px), a transparent tint, `backdrop-filter: blur(0px) url(#glass-distortion) blur(0px) saturate(1.5) brightness(1.1)` (with the plain-frost `-webkit-` fallback) under the picture, and the given edge stack on `::before` — `inset 0 0 0 1px white/.15`, `inset 1.5px 1.5px 0 white/.5`, `inset 0 0 12px white/.2`, `0 8px 32px black/.2`. The plate has `padding: 0`, so the picture runs edge to edge inside the rounding and inherits the plate's radius; `:fullscreen` drops the rounding. Floating inside, above the video, is **the control** — full width of the dock (no `max-width`), inset 8px from the picture, `border-radius: var(--vo-radius-panel)` (33px), the shared `--vo-dark` tint with `backdrop-filter: var(--vo-liquid)` and the same four-part edge stack — that slides up and un-blurs when it appears. Inside: current time / thin white rail / duration on one row, then transport, mute and a 96px volume fader on the left, plus the settings and screen keys on the right, and the settings key. There are no speed chips in the bar: the playback rate lives only in the settings card, whose rows are Audio, Quality, Captions and Speed (the Video.js rate control owns it). Buttons are 34px ghost circles (40px on touch) with 22px Hugeicons, except the transport: a solid white 52px circle (46px on narrow players, 56px on touch) with a 26px dark glyph and a soft drop shadow, so play/pause is the first thing the eye finds. The settings card and the option panels inside it wear the same glass — the same tint, the same `var(--vo-liquid)` refraction and edge stack on the popup itself — with pill rows on a transparent content panel (one refraction per popup, so each submenu is a pane of the same material) and one highlight pill per panel that glides between rows (`shared/menu-glow.tsx`, driven by `data-highlighted`, so pointer and keyboard share it); the fader goes under 26rem, and the panel flattens to solid black under reduced transparency and loses its slide/blur under reduced motion.
- **The skin reads the picture** (`src/video/behaviors/video-palette.tsx`): a 24×14 offscreen canvas samples the frame every 1.2s, bins the pixels by hue (weighted by brightness and saturation), and writes `--vo-accent`, `--vo-tint`, `--vo-rim`, `--vo-water` and `--vo-glow` onto `.ko-skin`, which every glass tint reads. Registered with `@property`, so a scene change glides over 900ms (instant under reduced motion). Greyscale or flat frames leave the white glass alone; a tainted canvas (no CORS) switches it off rather than throwing.
- The layout lives in `src/video/shared/controls.tsx` (`vo-progress`, `vo-keys`), with `shared/menu-glow.tsx` as the menu highlight.
- **The timeline and the fader are one shared slider**: `src/components/ui/slider.tsx` + `slider-utils/` (a motion/react slider — thumb follows the pointer 1:1, rubber-bands past the ends, settles with the release velocity, rolling-digit bubble while dragging or key-focused, arrows/Shift/PageUp/PageDown/Home/End). It is styled by its own CSS module with token fallbacks, so the skin themes it through `--control-track`, `--control-fill`, `--control-thumb`, `--focus-ring` and `--bubble-*` set on `.ko-skin` in `glass.css`; it needs no Tailwind (the project has it wired, but this component ships CSS modules). `shared/progress-slider.tsx` binds it to `video.currentTime`/`duration` (seeking on every step, following playback on a throttled frame loop) and `shared/volume-slider.tsx` to `video.volume`/`muted`. The Video.js `TimeSlider` primitive was removed; `renderThumbnail` is still accepted by the skin's API and ignored.

## Commands

- `npm install`, then `npm run dev` to run it.
- `npm run typecheck` and `npm run build` must stay clean.

and we are building this for this hackathon - Tag badge
#Video.js Skins Design Challenge
Join to submit!
$10K
Cash prize
9hr 38m 54s
Until it starts
Trending

Recent

Social

Guidelines

Guidelines
Everything you need to know to participate

Open source license 
By entering this challenge and accepting the guidelines, you license your entry under the Apache License, Version 2.0, so Video.js and others may use, adapt, and redistribute it with credit. You keep ownership of your entry. Any submission may be chosen and inclusion isn’t guaranteed. You accept the guidelines by checking the box when you join the challenge.
Why enter
$10,000 in prizes, judged by the creators of Video.js and Plyr
A chance to see your skin featured by Video.js
Hands-on time with Video.js v10, the ground-up rewrite of the open source player behind video on millions of websites
Theme
Design a custom skin for the Video.js v10 player.
In Video.js v10, a skin is the player’s interface: the UI components plus the styles that present them. Video.js is open source and community-driven, and the player can end up on almost any website, so every skin makes a choice: how much personality it has, how well it fits into someone else’s design, and how far it pushes the controls. The built-in v10 skins show this range. Default is deliberately distinctive, Neutral is quieter and fits more places, Compat keeps things plain for broader browser support, and Scaffold has minimal styling and is a good starting point if you're designing your own skin.
Now show us your design! This is all about craft and fun: the best player, the most unconventional player, the one nobody saw coming. Anything goes, as long as it works and stays usable for everyone.
Design your skin in any tool, then build it one of three ways (see How to enter):
With AI: Describe your design to your coding agent (Claude Code, Codex, Cursor, or your tool of choice) using the Video.js skill.
By hand: Start a skin project with the Video.js CLI and follow the Build your own skin guide.
From scratch: Any framework (HTML, React, Vue, Svelte, or another) and styling approach (CSS, Tailwind, or another), as long as it uses Video.js v10.
Need some inspiration? A player for a video podcast app, a meditation site, a museum archive, or a design portfolio. Anything you can imagine!
Submission requirements
Every submission must include:
A working, publicly accessible URL (no login or local setup) showing your skin on a Video.js v10 player playing video.
A visual and short written description of your design thinking (a few sentences).
Minimum requirements
Each entry is reviewed against these requirements before it's scored. Ensure your skin:
Works: Your URL loads, uses the Video.js v10 player, and plays video.
Has essential controls: Play/pause, seek bar, time, volume/mute, and fullscreen are present and working.
Is responsive: Controls stay visible and usable at desktop and mobile player sizes.
Works with a keyboard: Controls can be reached and operated with a keyboard, and menus can be exited.
Accessibility tips - Several small touches make a skin work for everyone:
Readable over any video: Keep text and icons legible over both bright and dark footage.
Easy to tap: Make controls big enough for a thumb on a phone.
Visible focus: Leave the focus outline on, so keyboard users can see where they are.
Calm on request: If your skin animates, tone it down when reduced motion is turned on.
Evaluation criteria
Entries are scored out of 25 points, plus up to 2 bonus points.
Visual design and originality (10 pts): A distinctive concept with cohesive typography, color, iconography, and layout. Top scores go to memorable, original designs with a clear visual direction and carefully resolved details.
Usability and interaction (5 pts): Intuitive controls and a layout that works across player sizes and touch devices. Controls should be easy to discover and operate, with clear feedback on desktop and mobile.
Accessibility (5 pts): Controls stay readable over any video, keyboard focus is visible, touch targets are comfortable, and motion calms down when reduced motion is on.
Execution and polish (5 pts): A complete, functional skin with consistent styling across controls, menus, and player states. No bugs, broken layouts, or unfinished states.
Bonus points
+1 pt: Host your video on Mux and include the asset’s public playback ID. Your player must play that video, and the asset must stay live through judging. Why Mux? They're the corporate shepherd of Video.js (learn more below).
+1 pt: Put your skin to work. Share the URL of a real, live website of yours (a portfolio, a project, a client site) that plays video with your skin.
Account creation - Video.js is free and open source. Mux’s Free Plan offers you what you need to earn the bonus point, with no promo code or credit card needed. To host your video on Mux:
Sign up at mux.com.
In the dashboard, go to Video > Assets and click Create New Asset to upload a video.
When the status shows Ready, open the ⋮ menu on your asset and choose Copy > Playback ID.
Paste the Playback ID into the submission form, and keep the asset live through judging.
How to enter
Start with your idea: sketch your design in any tool, or skip straight to building.
Get set up: Install Node.js (a free download that the setup commands run on; with AI you won’t use it directly). To build with AI, also have a coding agent such as Claude Code, Codex, or Cursor. To deploy, make a free account with a host such as Vercel or Netlify.
Build your skin. Pick a route:
With AI (easiest if you design more than you code): Paste the AI quickstart prompt from the Build with AI guide into your coding agent to install the Video.js skill, then start a new session. Ask it to help you design your own Video.js skin and choose the video preset when it asks. Then describe your design, share your own icons or images, and iterate.
By hand: Run npx @videojs/cli skin create, choose the video preset when prompted, then follow the Build your own skin guide to preview and build it.
From scratch: Any framework (HTML, React, Vue, Svelte, or another) and styling approach (CSS, Tailwind, or another), as long as it uses Video.js v10.
Optional bonuses (see Bonus points above): 
Mux: Host your video on Mux and play it in your player. 
Live-site:  Move your skin into a real site of yours. If your submitted URL is already a real site, use that.
Check your work: Test your player over a bright and a dark video, resized, and with only a keyboard. With AI, also ask your agent, “Audit my skin for working controls, responsive layout, keyboard access, visible focus, contrast over bright and dark video, tap-friendly controls, and reduced motion. Fix any issues.”
Deploy your skin to Vercel or Netlify for a public URL by running npm run deploy, or ask your agent to do it.
Submit your URL and description. For the bonuses, include your Mux playback ID and live-site URL.
Resources
Video.js skins design inspiration: Read Sam's blog post on how he designed the v10 skins.
Build your own skin: Step-by-step guide to creating a skin project, previewing it, and deploying it. Start from Scaffold, Default, Neutral, or Compat. Want a quick look first? Try the skin sandbox.
Skill + prompts: The Build with AI guide has a quickstart prompt that installs the Video.js skill in your coding agent (Claude Code, Codex, Cursor, or tool of your choice). Then try: “Help me design my own Video.js skin for a podcast player.”
Docs: Read about skins and how to customize them, and a handy icons reference.
Video walkthrough: Watch Sam go from design to a working skin.
Questions?
Questions about the challenge or your submission? Contact Contra at hello@contra.com. Contra will pass technical questions about Video.js v10 to the Video.js team.
The prizes
The following prizes will be distributed to the winners selected by our judges.
🏆 Total: $10,000
$5,000 for 1st place
$3,000 for 2nd place
$2,000 for 3rd place
Video.js Skins Design Challenge Sponsor: Mux is the proud corporate shepherd of Video.js. Mux is video infrastructure for developers. From video streaming to video intelligence and AI-powered context, Mux helps teams do more with video. Stream it, moderate it, search it, analyze it, transform it. https://www.mux.com/
Meet the judges
Industry experts who will evaluate your submissions


Sam Potts
