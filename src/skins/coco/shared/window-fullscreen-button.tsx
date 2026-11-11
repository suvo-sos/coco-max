/** @jsxImportSource react */

import { useEffect, useState } from 'react';
import { Expand, Shrink } from 'lucide-react';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

/** Attribute set on the skin root while the player fills the browser window. */
const WINDOW_FULLSCREEN_ATTR = 'data-hop-window-fullscreen';

/**
 * Fill browser window: the player grows to exactly the size of
 * the browser window — no display fullscreen, no new tab, just
 * the player filling the window. That is different from the
 * fullscreen button next to it, which takes over the whole
 * display. Click again (or press Esc) to go back to normal size.
 * Toggles `data-hop-window-fullscreen` on the skin root; skin.css
 * sizes it to the viewport while that is set. While it is on,
 * the page behind cannot scroll.
 */
export function WindowFullscreenButton() {
  const [active, setActive] = useState(false);

  const setWindowFullscreen = (next: boolean, root?: Element | null) => {
    const skin = root ?? document.querySelector('.blood-skin');
    if (!skin) return;
    if (next) {
      skin.setAttribute(WINDOW_FULLSCREEN_ATTR, '');
      document.body.style.overflow = 'hidden';
    } else {
      skin.removeAttribute(WINDOW_FULLSCREEN_ATTR);
      document.body.style.overflow = '';
    }
    setActive(next);
  };

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWindowFullscreen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  // Never leave the page stuck: if the button unmounts while the
  // player is filling the window, put it back.
  useEffect(() => {
    return () => {
      document.querySelector('.blood-skin')?.removeAttribute(WINDOW_FULLSCREEN_ATTR);
      document.body.style.overflow = '';
    };
  }, []);

  const label = active ? 'Exit fill window' : 'Fill browser window';

  return (
    <ButtonTooltip label={label} popupClassName={'media-tooltip-screen-popup'}>
      <Button
        className={'media-window-fullscreen-button'}
        aria-label={label}
        aria-pressed={active}
        onClick={(event) => {
          const skin = event.currentTarget.closest('.blood-skin');
          setWindowFullscreen(!active, skin);
        }}
      >
        {active ? (
          <Shrink className={cn('media-button-icon', 'media-window-fullscreen-exit-icon')} />
        ) : (
          <Expand className={cn('media-button-icon', 'media-window-fullscreen-enter-icon')} />
        )}
      </Button>
    </ButtonTooltip>
  );
}
