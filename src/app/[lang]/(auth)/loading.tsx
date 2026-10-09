import { MenuSyriaLoader } from "@/components/shared/menu-syria-loader";

/**
 * The auth routes are one centred card, not a grid, so a shaped skeleton
 * would be guesswork. The brand loader in the same spot the card lands says
 * "a moment" without pretending to know what is coming.
 */
export default function AuthLoading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <MenuSyriaLoader size="lg" />
    </div>
  );
}
