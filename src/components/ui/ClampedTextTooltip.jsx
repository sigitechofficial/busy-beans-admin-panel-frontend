"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiCopy } from "react-icons/fi";

/**
 * Clamps text to N lines with ellipsis. On hover/tap (when overflowing),
 * shows an interactive viewport-clamped popover you can interact with,
 * with smooth animation and a copy action. Mobile-safe (no overflow).
 */
export default function ClampedTextTooltip({
  text = "",
  title = "Note",
  lines = 2,
  className = "",
  maxWidth = "100%",
}) {
  const displayText = text == null || text === "" ? "-" : String(text);
  const rawTitle =
    title == null || title === "" || title === "-" ? "Note" : String(title);
  const displayTitle =
    rawTitle === "Note"
      ? rawTitle
      : rawTitle
          .trim()
          .split(/\s+/)
          .map((word) =>
            word
              ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              : word,
          )
          .join(" ");
  const canCopy = displayText !== "-";
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: null });
  const triggerWrapRef = useRef(null);
  const textRef = useRef(null);
  const tooltipRef = useRef(null);
  const hideTimerRef = useRef(null);
  const copiedTimerRef = useRef(null);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.innerWidth < 640;

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [displayText, lines, checkOverflow]);

  const updatePosition = useCallback(() => {
    const el = triggerWrapRef.current;
    const tip = tooltipRef.current;
    if (!el || !tip) return;

    const rect = el.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const gap = 8;
    const pad = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 640;

    if (mobile) {
      const width = Math.min(vw - pad * 2, 420);
      let top = rect.bottom + gap;
      let nextPlacement = "bottom";

      if (top + tipRect.height > vh - pad) {
        nextPlacement = "top";
        top = rect.top - tipRect.height - gap;
      }
      if (top < pad) {
        top = Math.max(pad, vh - tipRect.height - pad);
      }

      const left = Math.max(pad, (vw - width) / 2);
      setPlacement(nextPlacement);
      setCoords({ top, left, width });
      return;
    }

    let nextPlacement = "bottom";
    let top = rect.bottom + gap;
    if (top + tipRect.height > vh - pad) {
      nextPlacement = "top";
      top = rect.top - tipRect.height - gap;
    }
    if (top < pad) {
      top = Math.max(pad, vh - tipRect.height - pad);
    }

    const maxPanelWidth = Math.min(416, vw - pad * 2);
    let left = rect.left;
    left = Math.min(Math.max(pad, left), vw - maxPanelWidth - pad);

    setPlacement(nextPlacement);
    setCoords({ top, left, width: maxPanelWidth });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        setTimeout(() => setOpen(false), 160);
      }
    };
    const onPointerDown = (e) => {
      const tip = tooltipRef.current;
      const trigger = triggerWrapRef.current;
      if (
        tip &&
        !tip.contains(e.target) &&
        trigger &&
        !trigger.contains(e.target)
      ) {
        setVisible(false);
        setTimeout(() => setOpen(false), 160);
      }
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, updatePosition]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const cancelHide = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const show = () => {
    if (!isOverflowing || displayText === "-") return;
    cancelHide();
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const scheduleHide = () => {
    if (isMobileViewport()) return;
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = setTimeout(() => {
        setOpen(false);
        hideTimerRef.current = null;
      }, 160);
    }, 180);
  };

  const toggleFromTap = (e) => {
    if (!isOverflowing || displayText === "-") return;
    if (!isMobileViewport()) return;
    e.preventDefault();
    e.stopPropagation();
    if (open) {
      setVisible(false);
      setTimeout(() => setOpen(false), 160);
    } else {
      show();
    }
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  };

  const charCount = displayText === "-" ? 0 : displayText.length;

  return (
    <>
      <div
        ref={triggerWrapRef}
        className={`group/notes relative flex w-full min-w-0 max-w-full items-start gap-2 overflow-hidden ${className}`}
        style={{ maxWidth }}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
      >
        <p
          ref={textRef}
          tabIndex={isOverflowing ? 0 : undefined}
          onFocus={show}
          onBlur={scheduleHide}
          onClick={toggleFromTap}
          className={`min-w-0 flex-1 outline-none text-[13px] font-medium leading-5 text-themeDark whitespace-normal break-words ${
            isOverflowing
              ? "cursor-pointer transition-colors group-hover/notes:text-theme"
              : ""
          }`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: lines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            maxHeight: `${lines * 1.25}rem`,
          }}
        >
          {displayText}
        </p>
        {canCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ${
              copied
                ? "border-themeGreen/30 bg-themeLightGreen text-themeGreen"
                : "border-transparent bg-theme/10 text-theme opacity-100 sm:opacity-70 hover:opacity-100 hover:border-theme/25 hover:bg-theme/15 hover:text-themeDark group-hover/notes:opacity-100"
            }`}
            aria-label={copied ? "Copied" : "Copy note"}
          >
            {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          </button>
        )}
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            role="dialog"
            aria-label={displayTitle}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
            className="fixed z-[9999] max-w-[calc(100vw-1.5rem)] pointer-events-auto"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width ?? undefined,
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0) scale(1)"
                : placement === "top"
                  ? "translateY(-6px) scale(0.98)"
                  : "translateY(6px) scale(0.98)",
              transition:
                "opacity 170ms cubic-bezier(0.22, 1, 0.36, 1), transform 170ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div
              className={`absolute left-0 right-0 h-3 hidden sm:block ${
                placement === "top" ? "-bottom-3" : "-top-3"
              }`}
            />

            <div className="max-w-full overflow-hidden rounded-xl border border-theme/20 bg-white shadow-[0_18px_50px_rgba(134,100,76,0.16)] ring-1 ring-theme/5">
              <div className="flex items-center justify-between gap-2 border-b border-theme/10 bg-theme/5 px-3 py-2.5 sm:px-3.5">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-themeDark">
                    {displayTitle}
                  </p>
                  <p className="truncate text-[11px] text-theme/60">
                    {charCount} character{charCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    copied
                      ? "bg-themeLightGreen text-themeGreen ring-1 ring-themeGreen/30"
                      : "bg-white text-theme ring-1 ring-theme/20 hover:bg-theme/10 hover:text-themeDark hover:ring-theme/35"
                  }`}
                >
                  {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="px-3 py-3 sm:px-3.5 max-h-[min(42vh,240px)] sm:max-h-[min(46vh,260px)] overflow-x-hidden overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                <p className="text-[13px] font-medium leading-6 text-themeDark whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {displayText}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
