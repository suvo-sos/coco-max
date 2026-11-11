# Coco skin — saved copy

This folder is a **snapshot of the custom Coco skin** taken before the preview was
switched back to the stock Video.js default skin. Nothing here is imported by the app
right now, so it has no effect on the running player.

What's in it:

- `skin.tsx` — the skin container (`VideoSkin`), wiring the behaviours, poster, error
  dialog, controls and indicators together.
- `skin.css` — all of the custom styling: the dark slate glass bar, pale neumorphic
  keys, the orange lava-lamp play tab docked to the bar's left edge, and the toggle-switch
  seekbar with the orange fill and knurled cap.
- `controls.tsx` — which controls render and where.
- `behaviors/` — clean-mode idle hiding, hotkeys, gestures, wheel volume, play/pause and
  skip flashes, and the right-drag seek.
- `shared/` — the individual controls (play button, volume, time slider, menus, screen
  controls, feedback layers).
- `coco.tsx` — the older decorative staircase seekbar idea (unused, kept for reference).

## How to switch back to it

In `apps/preview/src/frame/player.tsx`, replace the stock skin import and CSS:

```diff
-import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
-import '@videojs/react/video/skin.css';
+import { Video, VideoPlayer } from '@videojs/react/video';
+import { VideoSkin } from '@/skins/coco/skin';
```

The skin imports `../../styles/video/scaffold.css` and `./skin.css` itself, so no extra
CSS import is needed. The media element stays a child of `VideoSkin`, exactly as before.
