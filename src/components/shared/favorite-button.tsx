"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Heart } from "lucide-react";
import { toast } from "@/lib/toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";

const sizeClasses = { sm: "size-7", md: "size-8", lg: "size-10" };
const iconSizes = { sm: "size-3.5", md: "size-4", lg: "size-4.5" };

type ConfirmMode = "add" | "remove" | null;

/**
 * Heart toggle used on business cards. Guests are nudged to sign in via a
 * toast (with a sign-in action) instead of an auto-redirect; signed-in
 * visitors confirm the add/remove through a dialog before the change lands.
 *
 * The chip is solid, not glass. It sits on top of photography, and a
 * translucent white chip vanished against any bright dish photo — which was
 * most of them. A solid ground per theme (white on light, near-black on dark)
 * always separates from the image beneath, and the hairline border keeps the
 * white one from melting into an overexposed corner.
 */
export function FavoriteButton({
  itemId,
  itemName,
  size = "md",
  className,
}: {
  itemId: string;
  itemName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isFavorite = useFavoritesStore((s) => s.ids.includes(itemId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const isRemoving = confirmMode === "remove";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.warning(t.favorites.loginRequired, {
        action: {
          label: t.favorites.signInAction,
          onClick: () => router.push(`/${lang}/login/user`),
        },
      });
      return;
    }

    setConfirmMode(isFavorite ? "remove" : "add");
  };

  const handleConfirm = () => {
    toggle(itemId);
    toast.success(isRemoving ? t.favorites.removed : t.favorites.added);
    setConfirmMode(null);
  };

  return (
    <>
      <button
        type="button"
        aria-label={t.restaurant.favorite}
        aria-pressed={isFavorite}
        onClick={handleClick}
        className={cn(
          sizeClasses[size],
          "group flex transform-gpu items-center justify-center rounded-full border",
          // `scale` is named explicitly: Tailwind v4 puts hover:scale-110 on
          // the `scale` property, so a list naming `transform` would not animate
          "transition-[scale,background-color,border-color] duration-200 ease-smooth hover:scale-110 active:scale-95",
          "border-black/10 bg-white hover:bg-white",
          "dark:border-white/15 dark:bg-[#0b0d0e] dark:hover:bg-[#0b0d0e]",
          className,
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all",
            isFavorite
              ? "scale-110 fill-red-600 text-red-600"
              : "text-[#191c1d] group-hover:stroke-2 group-hover:text-red-600 dark:text-white",
          )}
        />
      </button>

      <AlertDialog
        open={confirmMode !== null}
        onOpenChange={(open) => !open && setConfirmMode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRemoving
                ? t.favorites.confirmRemoveTitle
                : t.favorites.confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {fmt(
                isRemoving
                  ? t.favorites.confirmRemoveMessage
                  : t.favorites.confirmMessage,
                { name: itemName },
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmMode(null)}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={isRemoving ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {isRemoving ? t.favorites.confirmRemove : t.favorites.confirmAdd}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
