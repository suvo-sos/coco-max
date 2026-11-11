/** @jsxImportSource react */

import { useEffect, useRef } from 'react';

/**
 * The menu's highlight, as one pill that flows between rows instead of each
 * row fading its own background in and out. It lives inside the panel, under
 * the rows (they are lifted above it in CSS) and ignores pointer events, so
 * hovering and clicking still land on the row itself.
 *
 * `data-highlighted` is the single source of truth: the menu sets it for
 * pointer movement and for the keyboard alike, so one mutation observer
 * covers both and nothing can drift out of sync.
 */
const ROW = ':is(.media-menu-item, .media-menu-back-item, .media-menu-radio-item)';

export function MenuGlow() {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const pill = ref.current;
    const panel = pill?.parentElement;
    if (!pill || !panel) return;

    let placed = false;

    const place = (row: HTMLElement | null) => {
      if (!row) {
        pill.removeAttribute('data-on');
        return;
      }

      const area = panel.getBoundingClientRect();
      const box = row.getBoundingClientRect();
      if (!box.height || !area.height) return;

      // The pill lives inside the panel, which scrolls: the rects are viewport
      // coordinates, so the panel's own scroll offset has to go back in or the
      // pill lands near the top instead of under the row that was hovered.
      const offsetX = panel.scrollLeft;
      const offsetY = panel.scrollTop;

      // The first appearance lands instantly; every move after it tweens.
      if (!placed) pill.style.transition = 'none';
      pill.style.top = `${box.top - area.top + offsetY}px`;
      pill.style.left = `${box.left - area.left + offsetX}px`;
      pill.style.width = `${box.width}px`;
      pill.style.height = `${box.height}px`;
      pill.setAttribute('data-on', '');

      if (!placed) {
        placed = true;
        // Commit that position before the transition goes back on.
        void pill.offsetWidth;
        pill.style.transition = '';
      }
    };

    const sync = () => place(panel.querySelector<HTMLElement>(`${ROW}[data-highlighted]`));

    const observer = new MutationObserver(sync);
    observer.observe(panel, { attributes: true, attributeFilter: ['data-highlighted'], subtree: true });

    const leave = () => pill.removeAttribute('data-on');
    panel.addEventListener('pointerleave', leave);

    // A panel that is already highlighted when it opens should not wait for a move.
    sync();

    return () => {
      observer.disconnect();
      panel.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <span className={'vo-menu-glow'} aria-hidden="true" ref={ref} />;
}
