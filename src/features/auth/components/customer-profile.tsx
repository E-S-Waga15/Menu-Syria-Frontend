"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { LogOut, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { useHydratedSession } from "@/features/auth/use-hydrated-session";
import { formatPrice } from "@/features/public-menu/lib/format";
import { fmt } from "@/i18n/fmt";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useCartStore } from "@/stores/cart-store";
import { useOrderHistoryStore } from "@/stores/order-history-store";

/**
 * Minimal customer account page — the "user" role destination after login.
 * Redirects to the customer login screen once hydration confirms there's
 * no active customer session (mirrors AdminGuard's pattern).
 */
export function CustomerProfile({ lang, t }: { lang: Locale; t: Dictionary }) {
  const router = useRouter();
  const { session, hydrated } = useHydratedSession();
  const logout = useAuthStore((s) => s.logout);
  const allOrders = useOrderHistoryStore((s) => s.entries);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);

  const isCustomer = session?.role === "user";
  // set right before an intentional logout so the guard below doesn't race
  // its own redirect-to-login against the logout's redirect-home
  const loggingOut = useRef(false);

  useEffect(() => {
    if (hydrated && !isCustomer && !loggingOut.current) {
      router.replace(`/${lang}/login/user`);
    }
  }, [hydrated, isCustomer, lang, router]);

  const myOrders = useMemo(
    () =>
      isCustomer
        ? allOrders.filter((o) => o.customerId === session.identifier)
        : [],
    [allOrders, isCustomer, session],
  );

  if (!hydrated || !session || session.role !== "user") return null;

  const handleLogout = () => {
    loggingOut.current = true;
    logout();
    router.push(`/${lang}`);
  };

  const handleReorder = (order: (typeof myOrders)[number]) => {
    clearCart();
    for (const line of order.lines)
      addItem(order.businessId, line.item, line.options, line.quantity);
    router.push(
      `/${lang}/${order.businessType === "restaurant" ? "menu" : "store"}/${order.businessSlug}`,
    );
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-berry-soft text-berry-soft-foreground">
          {session.avatarUrl ? (
            <Image
              src={session.avatarUrl}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-8" />
          )}
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold">
          {session.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
          {session.identifier}
        </p>

        <Button
          variant="outline"
          className="mt-8 h-12 w-full gap-2 text-base"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t.auth.logout}
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6">
        <h2 className="font-heading text-lg font-bold">
          {t.orderHistory.title}
        </h2>
        {myOrders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {t.orderHistory.empty}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {myOrders.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/${lang}/${order.businessType === "restaurant" ? "menu" : "store"}/${order.businessSlug}`}
                      className="truncate font-semibold hover:underline"
                    >
                      {order.businessName[lang]}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fmt(t.orderHistory.placedOn, {
                        date: new Date(order.createdAt).toLocaleDateString(
                          lang === "ar" ? "ar-SY" : "en-US",
                        ),
                      })}
                      {" · "}
                      {fmt(t.orderHistory.itemsCount, {
                        count: order.lines.reduce(
                          (sum, l) => sum + l.quantity,
                          0,
                        ),
                      })}
                    </p>
                  </div>
                  <span
                    className="shrink-0 font-heading text-sm font-bold"
                    dir="ltr"
                  >
                    {formatPrice(order.total, t.common.currency)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1.5"
                  onClick={() => handleReorder(order)}
                >
                  <RotateCcw className="size-3.5" />
                  {t.orderHistory.reorder}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
