"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { MenuSyriaLoader } from "@/components/shared/menu-syria-loader";

/** the longest the overlay is ever shown before it gives up and clears
 * itself — guards a navigation that never commits (an aborted push, an
 * error thrown before the route changes) from leaving it stuck forever */
const MAX_PENDING_MS = 8000;

const NavigationLoadingContext = createContext<{ start: () => void } | null>(
  null,
);

/**
 * The gap this closes: clicking a link to a route Next hasn't already
 * rendered leaves the *current* page fully visible — with no spinner, no
 * nothing — until the destination's first byte arrives. A route's own
 * `loading.tsx` only ever fires once per Suspense boundary, so browsing
 * between two pages that share one (e.g. two listings under the same route
 * group) shows it on the first visit and then never again.
 *
 * This covers every link app-wide from one mount: a capture-phase click
 * listener flips the brand loader on the instant a same-origin, different
 * -page `<a>` is clicked (skipping modified clicks, new tabs, downloads,
 * and same-page query/hash changes), and it clears the moment `usePathname`
 * reports the new route has actually committed — not a fixed delay.
 * `start()` is exported for the few places a navigation is triggered by
 * `router.push()` after an async action rather than by clicking a link.
 */
export function NavigationLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setPending(false);
  }, []);

  const start = useCallback(() => {
    setPending(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(clear, MAX_PENDING_MS);
  }, [clear]);

  // the new route has committed the moment the pathname this hook sees
  // changes — the earliest point the destination is actually on screen
  useEffect(() => {
    clear();
  }, [pathname, clear]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      const anchor = (event.target as HTMLElement).closest?.("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // only a different page is worth a full-screen wait — a link that
      // only changes the query string or jumps to a hash resolves instantly
      if (url.pathname === window.location.pathname) return;

      start();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  return (
    <NavigationLoadingContext.Provider value={{ start }}>
      {children}
      {pending && <MenuSyriaLoader size="lg" fullScreen />}
    </NavigationLoadingContext.Provider>
  );
}

/** `start()` — show the overlay right away for a `router.push()` that isn't
 * the result of clicking a link (e.g. redirecting after a form submits). */
export function useNavigationLoading() {
  const ctx = useContext(NavigationLoadingContext);
  if (!ctx) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider",
    );
  }
  return ctx;
}
