/** The one video this page plays. */
export interface ChosenVideo {
  id: string;
  title: string;
  src: string;
  poster?: string;
  kind: 'mux' | 'mp4';
}

/**
 * Hosted on Mux, so the deployed page streams a real video with no file
 * bundled: the asset stays live through judging, and the URL is the same in
 * dev and in the build. `1794394115060191.mp4` is still in
 * `apps/preview/public/` if you want to play the local cut instead — set
 * `kind: 'mp4'` and `src: './1794394115060191.mp4'`.
 */
export const SINGLE_VIDEO: ChosenVideo = {
  id: 'docomo-mux',
  title: 'Docomo',
  src: 'https://stream.mux.com/WgQub02xMCjA3vR8A1idUkooFLeOlW8zn65pHyCvI01c8.m3u8',
  kind: 'mux',
};
