"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";

import { useToastStore, type ToastItem, type ToastType } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

// Collapsed (peek) stack tuning — cards fanned behind the front toast.
// Expanded (hovered) spacing is derived from each card's real measured
// height so multi-line messages never overlap.
const PEEK_OFFSET = 12;
const PEEK_SCALE_STEP = 0.06;
const PEEK_OPACITY_STEP = 0.35;
const MAX_PEEK = 3;
const EXPANDED_GAP = 10;
const EXIT_MS = 300; // matches animate-toast-out's duration

const icons: Partial<Record<ToastType, React.ReactNode>> = {
  success: <CheckCircle className="text-primary" size={24} />,
  error: <XCircle className="text-red-500" size={24} />,
  info: <Info className="text-blue-500" size={24} />,
  warning: <AlertTriangle className="text-orange-500" size={24} />,
};

const borderColors: Record<ToastType, string> = {
  success: 'border-primary/60',
  error: 'border-red-500/60',
  info: 'border-blue-500/60',
  warning: 'border-orange-500',
  default: 'border-white/15',
};


interface CardProps {
  item: ToastItem;
  targetStyle: React.CSSProperties;
  closing: boolean;
  onClose: () => void;
  onHeight: (id: string, height: number) => void;
}

// The outer div owns *stacking* position only (inline style + transition,
// driven by the container below). `animation` is a single CSS shorthand
// property, so stacking two `animate-*` utility classes on one element
// makes the later one silently overwrite the other instead of combining —
// enter/exit and the ambient glow-pulse each get their own wrapper so all
// three (enter/exit, glow-pulse, shimmer) actually run at once.
function ToastCard({ item, targetStyle, closing, onClose, onHeight }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const measure = () => onHeight(item.id, el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, onHeight]);

  const outerStyle: React.CSSProperties = {
    ...targetStyle,
    transition: "transform 300ms ease, opacity 250ms ease",
  };

  return (
    <div ref={ref} style={outerStyle} className="absolute top-0 start-0 w-full">
      <div className={closing ? "animate-toast-out" : "animate-toast-in"}>
        <div
          className={cn(
            "relative flex items-center gap-4 overflow-hidden rounded-xl border-2 bg-black/85 p-4 text-start backdrop-blur-sm animate-glow-pulse",
            borderColors[item.type],
          )}
        >
          <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.1),transparent)] bg-[length:200%_100%]" />
          <div className="relative z-10 shrink-0">{icons[item.type]}</div>
          <div className="relative z-10 h-8 w-px bg-white/20" />
          <div className="relative z-10 min-w-0 flex-1">
            <p className="break-words text-sm font-bold text-white">
              {item.message}
            </p>
            {item.action && (
              <button
                type="button"
                onClick={() => {
                  item.action!.onClick();
                  onClose();
                }}
                className="mt-1.5 text-xs font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              >
                {item.action.label}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="relative z-10 shrink-0 text-white/40 transition-transform hover:scale-110 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sonner-style stacked toast UI: fanned peek when idle, expands to a full
 * list on hover, each card auto-dismissing on its own independent timer. */
export function ToastStack() {
  const toasts = useToastStore((s) => s.toasts);
  const [hovered, setHovered] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set());
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const exitTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const prevHovered = useRef(hovered);

  const onHeight = useCallback((id: string, height: number) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }, []);

  const requestClose = useCallback((id: string) => {
    setClosingIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    clearTimeout(timers.current[id]);
    exitTimers.current[id] = setTimeout(
      () => useToastStore.getState().hide(id),
      EXIT_MS,
    );
  }, []);

  // Per-toast auto-dismiss, paused while the stack is hovered. A running
  // timer is only ever touched by hover start/stop or that toast's own
  // removal — an unrelated toast being added or removed never resets
  // anyone else's clock.
  useEffect(() => {
    const hoverJustChanged = prevHovered.current !== hovered;
    prevHovered.current = hovered;

    if (hovered) {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
      return;
    }

    if (hoverJustChanged) {
      toasts.forEach((t) => {
        if (closingIds.has(t.id)) return;
        timers.current[t.id] = setTimeout(() => requestClose(t.id), t.duration);
      });
      return;
    }

    toasts.forEach((t) => {
      if (closingIds.has(t.id) || timers.current[t.id]) return;
      timers.current[t.id] = setTimeout(() => requestClose(t.id), t.duration);
    });
    Object.keys(timers.current).forEach((id) => {
      if (!toasts.some((t) => t.id === id)) {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts, hovered]);

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
      Object.values(exitTimers.current).forEach(clearTimeout);
    },
    [],
  );

  if (toasts.length === 0) return null;

  const count = toasts.length;
  // Oldest is index 0 (newest pushed last); reverseIndex 0 = front/newest.
  const ordered = toasts.map((t, i) => ({ item: t, reverseIndex: count - 1 - i }));

  let cumulative = 0;
  const expandedOffset: Record<string, number> = {};
  [...ordered]
    .sort((a, b) => a.reverseIndex - b.reverseIndex)
    .forEach(({ item }) => {
      expandedOffset[item.id] = cumulative;
      cumulative += (heights[item.id] ?? 76) + EXPANDED_GAP;
    });

  return (
    <div
      className="fixed top-6 left-1/2 z-[9999] w-[320px] max-w-[calc(100vw-2rem)] -translate-x-1/2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        {ordered.map(({ item, reverseIndex }) => {
          const peekVisible = reverseIndex < MAX_PEEK;
          const targetStyle: React.CSSProperties = hovered
            ? {
                transform: `translateY(${expandedOffset[item.id]}px)`,
                opacity: 1,
                zIndex: count - reverseIndex,
                pointerEvents: "auto",
              }
            : {
                transform: `translateY(${reverseIndex * PEEK_OFFSET}px) scale(${Math.max(1 - reverseIndex * PEEK_SCALE_STEP, 0.82)})`,
                opacity: peekVisible
                  ? Math.max(1 - reverseIndex * PEEK_OPACITY_STEP, 0.3)
                  : 0,
                zIndex: count - reverseIndex,
                pointerEvents: reverseIndex === 0 ? "auto" : "none",
              };
          return (
            <ToastCard
              key={item.id}
              item={item}
              targetStyle={targetStyle}
              closing={closingIds.has(item.id)}
              onClose={() => requestClose(item.id)}
              onHeight={onHeight}
            />
          );
        })}
      </div>
    </div>
  );
}
