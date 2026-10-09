import { MenuSyriaLoader } from "@/components/shared/menu-syria-loader";

/**
 * Shown while any marketing route streams in — the homepage above all,
 * since that is where a first-time, anonymous visitor lands cold with
 * nothing prefetched yet.
 *
 * Full-screen rather than a shaped skeleton: this is the very first thing a
 * new visitor sees of the product, and the brand mark turning is the
 * impression worth making there, the same way a shaped skeleton is worth
 * making once someone is already browsing a list deeper in. The site header
 * and footer are part of what streams in too, so the overlay covers the
 * whole viewport rather than carving out a band between them.
 */
export default function MarketingLoading() {
  return <MenuSyriaLoader size="lg" fullScreen />;
}
