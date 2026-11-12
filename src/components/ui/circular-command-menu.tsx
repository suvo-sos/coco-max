"use client";

/**
 * A circular command menu: a round trigger that blooms into a ring of keys
 * when it opens, each key springing out from the centre with a short stagger,
 * exactly like the shadcn/local component it is adapted from.
 *
 * The original copy-paste used Tailwind utility classes, `framer-motion` and
 * `@/lib/utils`. This project already ships `motion` (the framer-motion
 * successor, imported from `motion/react`), a `cn` helper in
 * `@/lib/resolve-class-name`, and no Tailwind layer in the player styles, so
 * the markup keeps the behaviour and moves the paint into
 * `circular-command-menu.module.css`. The `--vo-*` tokens it reads are Coco's
 * sand palette with neutral fallbacks, so the component still reads if it is
 * dropped somewhere else.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/resolve-class-name";

import styles from "./circular-command-menu.module.css";

export interface CommandItem {
  id: string;
  icon?: ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  /** A ready-made control (e.g. a Video.js button primitive) to sit in this slot instead of the default key. */
  control?: ReactNode;
  /** Close the ring after this item runs. Defaults to `true`; a list item that opens a page sets it false. */
  dismiss?: boolean;
  disabled?: boolean;
}

export interface CircularCommandMenuProps {
  items?: CommandItem[];
  /** The glyph inside the round trigger. */
  trigger?: ReactNode;
  className?: string;
  /** Requested ring radius in px; shrinks when the player is too small for it. */
  radius?: number;
  onSelect?: (item: CommandItem) => void;
  /** Controlled open state. Omit to let the menu own it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
  triggerLabel?: string;
  centerLabel?: string;
  centerIcon?: ReactNode;
  /** A page shown in place of the ring, e.g. a list of quality options. */
  panel?: ReactNode;
  /** Identity of the current panel, so focus can follow page changes. */
  panelKey?: string;
  onBack?: () => void;
  /** Where the overlay mounts. Defaults to `document.body`; pass the player element to stay inside it. */
  resolveContainer?: (trigger: HTMLElement) => HTMLElement;
}

const DEFAULT_RADIUS = 128;
const START_ANGLE = -90;
/** Keep the ring clear of the tile edge so a label pill never has to leave the picture. */
const EDGE = 24;

function DefaultCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Component({
  items = [],
  trigger,
  className,
  radius = DEFAULT_RADIUS,
  onSelect,
  open,
  onOpenChange,
  triggerClassName,
  triggerLabel = "Menu",
  centerLabel = "Close",
  centerIcon,
  panel,
  panelKey,
  onBack,
  resolveContainer,
}: CircularCommandMenuProps) {
  const reduced = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;

  const [activeIndex, setActiveIndex] = useState(0);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const safeItems = items ?? [];
  const itemCount = safeItems.length;
  const angleStep = itemCount > 0 ? 360 / itemCount : 0;

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    // The trigger may have unmounted with the island; focus it only if it is still there.
    triggerRef.current?.focus?.();
  }, [setOpen]);

  // Mount inside the player when we can, so the ring is clipped by the tile it
  // belongs to and survives fullscreen (a body portal would not).
  useEffect(() => {
    if (!isOpen) return;
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;
    setContainer(resolveContainer ? resolveContainer(triggerElement) : document.body);
  }, [isOpen, resolveContainer]);

  // The ring is sized from the tile, not the viewport: a small player gets a
  // small wheel instead of keys sliding off the picture.
  useEffect(() => {
    if (!isOpen || !container) return;

    const measure = () => setBox({ width: container.clientWidth, height: container.clientHeight });
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isOpen, container]);

  const keySize = Math.min(box.width || 0, box.height || 0) < 360 ? 36 : 44;
  const roomiest = Math.min(box.width || radius * 2, box.height || radius * 2) / 2 - keySize / 2 - EDGE;
  const ringRadius = Math.max(keySize, Math.min(radius, roomiest || radius));

  const positionFor = (index: number) => {
    const angle = ((START_ANGLE + index * angleStep) * Math.PI) / 180;
    return {
      angle,
      x: Math.cos(angle) * ringRadius,
      y: Math.sin(angle) * ringRadius,
    };
  };

  const focusSlot = useCallback((index: number) => {
    const slot = ringRef.current?.querySelectorAll<HTMLElement>("[data-command-slot]")[index];
    slot?.querySelector<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")?.focus();
  }, []);

  // Opening lands focus on the first key; changing page moves it to the new page.
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      if (panel) {
        layerRef.current?.querySelector<HTMLElement>("[data-command-panel] button")?.focus();
      } else {
        focusSlot(activeIndex);
      }
    }, 80);
    return () => window.clearTimeout(timer);
    // `panelKey` is the page identity; `panel` itself is a fresh node every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, panelKey, focusSlot]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Keep the player's hotkeys out of the menu.
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      if (panel && onBack) onBack();
      else close();
      return;
    }

    if (event.key === "Tab") {
      const focusable = layerRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (panel || itemCount === 0) return;

    const move = (next: number) => {
      event.preventDefault();
      const index = (next + itemCount) % itemCount;
      setActiveIndex(index);
      focusSlot(index);
    };

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        move(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        move(activeIndex - 1);
        break;
      case "Home":
        move(0);
        break;
      case "End":
        move(itemCount - 1);
        break;
    }
  };

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <div ref={layerRef} className={cn(styles.layer, className)} data-vo-wheel="" onKeyDown={handleKeyDown}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            onClick={close}
          />

          <div className={styles.stage}>
            <AnimatePresence mode="wait" initial={false}>
              {panel ? (
                <motion.div
                  key={panelKey ?? "panel"}
                  className={styles.panel}
                  data-command-panel=""
                  initial={reduced ? false : { opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }}
                  transition={{ duration: reduced ? 0 : 0.16, ease: [0.32, 0.72, 0, 1] }}
                >
                  {panel}
                </motion.div>
              ) : (
                <motion.div
                  key="ring"
                  ref={ringRef}
                  className={styles.ring}
                  role="menu"
                  aria-label={triggerLabel}
                  initial={false}
                >
                  <motion.button
                    type="button"
                    className={styles.center}
                    onClick={close}
                    aria-label={centerLabel}
                    initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 26 }}
                  >
                    <motion.span
                      className={styles.centerGlyph}
                      initial={false}
                      animate={{ rotate: 45 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                    >
                      {centerIcon ?? <DefaultCenterIcon />}
                    </motion.span>
                  </motion.button>

                  {safeItems.map((item, index) => {
                    const { x, y, angle } = positionFor(index);
                    const isActive = activeIndex === index;
                    const labelOffset = keySize / 2 + 10;
                    const labelStyle = {
                      "--label-x": `${Math.cos(angle) * labelOffset}px`,
                      "--label-y": `${Math.sin(angle) * labelOffset}px`,
                    } as CSSProperties;

                    return (
                      <motion.div
                        key={item.id}
                        data-command-slot=""
                        data-active={isActive || undefined}
                        className={styles.slot}
                        style={{ width: keySize, height: keySize, marginLeft: -keySize / 2, marginTop: -keySize / 2 }}
                        initial={reduced ? false : { x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x, y, scale: 1, opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { x: 0, y: 0, scale: 0, opacity: 0 }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }
                        }
                        onPointerEnter={() => setActiveIndex(index)}
                        onFocusCapture={() => setActiveIndex(index)}
                      >
                        {item.control ?? (
                          <button
                            type="button"
                            className={styles.key}
                            aria-label={item.label}
                            disabled={item.disabled}
                            onClick={() => {
                              item.onClick?.();
                              onSelect?.(item);
                              if (item.dismiss !== false) close();
                            }}
                          >
                            {item.icon}
                          </button>
                        )}

                        <span className={styles.label} style={labelStyle} aria-hidden="true">
                          {item.label}
                          {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(styles.trigger, triggerClassName)}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        data-open={isOpen || undefined}
      >
        {trigger}
      </button>

      {container ? createPortal(overlay, container) : null}
    </>
  );
}

const CircularCommandMenu = Component;

export { Component, CircularCommandMenu };

export default CircularCommandMenu;
