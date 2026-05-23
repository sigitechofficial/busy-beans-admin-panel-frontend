"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { HiInformationCircle, HiOutlineInformationCircle } from "react-icons/hi2";

/**
 * Info icon with a styled tooltip (rendered in a portal so table overflow does not clip it).
 */
export default function InfoTooltip({
  title,
  children,
  position = "left",
  variant = "success",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 10;

    if (position === "top") {
      setCoords({
        top: rect.top - gap,
        left: rect.left + rect.width / 2,
      });
      return;
    }

    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.left - gap,
    });
  }, [position]);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => setOpen(false), []);

  const transformClass =
    position === "top"
      ? "-translate-x-1/2 -translate-y-full"
      : "-translate-x-full -translate-y-1/2";

  const triggerClass =
    variant === "neutral"
      ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-gradient-to-b from-sky-50 to-white text-sky-600 shadow-sm ring-1 ring-sky-100/80 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-1"
      : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-emerald-600 shadow-sm ring-1 ring-emerald-100/80 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-1";

  const titleClass =
    variant === "neutral"
      ? "mb-1.5 text-xs font-semibold tracking-wide text-sky-800"
      : "mb-1.5 text-xs font-semibold tracking-wide text-emerald-800";

  const Icon = variant === "neutral" ? HiOutlineInformationCircle : HiInformationCircle;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={triggerClass}
        aria-label={title || "More information"}
      >
        <Icon className="h-[1.35rem] w-[1.35rem]" aria-hidden />
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className={`pointer-events-none fixed z-[9999] w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-slate-200/90 bg-white px-3.5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.12)] ${transformClass}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {title ? <p className={titleClass}>{title}</p> : null}
            {children ? (
              typeof children === "string" ? (
                <p className="text-xs font-normal leading-relaxed text-slate-600">{children}</p>
              ) : (
                <div>{children}</div>
              )
            ) : null}
          </div>,
          document.body
        )}
    </>
  );
}
