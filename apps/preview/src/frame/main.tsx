import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerStyles } from '../shell/params';
import { initialParams, onParamsChange } from './frame';
import { type ChosenVideo, SINGLE_VIDEO } from './home';
import { Player } from './player';

function Preview() {
  const [params, setParams] = useState(initialParams);
  const [video, setVideo] = useState<ChosenVideo>(SINGLE_VIDEO);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => onParamsChange(setParams), []);

  // Object URLs live as long as the page, so they are released on unmount.
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const load = (file: File | undefined) => {
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setVideo({ id: 'upload', title: file.name, src: url, kind: 'mp4' });
  };

  const reset = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setVideo(SINGLE_VIDEO);
  };

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      <div className="hop-page">
        <div className="preview-stage">
          <div className="preview-player" style={playerStyles(params) as CSSProperties}>
            {/* A new source needs a fresh player, so the element is keyed by it. */}
            <Player key={video.src} media={playbackProps(params)} video={video} />
          </div>

          <div className="preview-upload">
            <label className="preview-upload-button">
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={(event) => load(event.target.files?.[0])}
              />
              Upload a video
            </label>

            {video.id === 'upload' ? (
              <button type="button" className="preview-upload-reset" onClick={reset}>
                Back to the Mux clip
              </button>
            ) : null}

            <span className="preview-upload-note">
              {video.id === 'upload' ? video.title : 'Plays the Mux clip — drop in your own file to test it'}
            </span>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);
