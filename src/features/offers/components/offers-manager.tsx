"use client";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

import { RowActions, type RowAction } from "@/components/shared/row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth/store";
import { OfferCard } from "@/features/offers/components/offer-card";
import { OfferDialog } from "@/features/offers/components/offer-dialog";
import { useOfferMutations } from "@/features/offers/hooks/use-offers";
import type { OfferValues } from "@/features/offers/schemas";
import {
  getBusinessOffers,
  offerDiscount,
  offerState,
  type OfferState,
} from "@/features/offers/services";
import { useBusinessId } from "@/features/restaurant-dashboard/hooks/use-my-business";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Offer, OfferBadge } from "@/lib/types";

/**
 * Create and manage the offers a restaurant or store publishes.
 *
 * Cards rather than rows: an offer is a photo and a price, and both are the
 * reason the owner is on this page. The state chip — live, paused, not
 * started, ended — is what the list is really sorted by in the reader's head,
 * so it sits on the cover where it reads before anything else. The card body
 * carries the name, the window and the price in normal flow, so an offer with
 * no photo yet is still a complete row rather than an empty frame.
 *
 * Writes go straight to the API (see `useOfferMutations`), which patches this
 * list optimistically and puts it back if the server refuses.
 */
export function OffersManager() {
  const { t } = useI18n();
  const isStore = useAuthStore(
    (s) => (s.session?.businessType ?? "restaurant") === "store",
  );

  // offers hang off the business id, which the dashboard reads once and every
  // page shares — so the list waits for it rather than guessing
  const businessId = useBusinessId();

  const { data } = useQuery({
    queryKey: queryKeys.offers.byBusiness(businessId),
    queryFn: () => getBusinessOffers(businessId),
    enabled: businessId !== "",
  });

  const mutations = useOfferMutations(businessId);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  const offers = data ?? null;

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      (offers ?? []).filter((offer) =>
        query === ""
          ? true
          : `${offer.name.ar} ${offer.name.en}`.toLowerCase().includes(query),
      ),
    [offers, query],
  );

  // chips read against a photograph, so each is a solid ground rather than a
  // tint that would depend on whatever is behind it
  const stateStyle: Record<OfferState, string> = {
    live: "bg-success text-white",
    endingSoon: "bg-zest text-zest-foreground",
    paused: "bg-white/85 text-[#141617]",
    upcoming: "bg-white/85 text-[#141617]",
    expired: "bg-destructive text-white",
  };

  const stateLabel: Record<OfferState, string> = {
    live: t.offers.stateLive,
    endingSoon: t.offers.stateEndingSoon,
    paused: t.offers.statePaused,
    upcoming: t.offers.stateUpcoming,
    expired: t.offers.stateExpired,
  };

  const badgeLabel: Record<OfferBadge, string> = {
    limited: t.offers.badgeLimited,
    bestValue: t.offers.badgeBestValue,
    new: t.offers.badgeNew,
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setDialogOpen(true);
  };

  const save = (values: OfferValues) => {
    mutations.save(values, editing);
    setDialogOpen(false);
    setEditing(null);
    toast.success(t.offers.saved);
  };

  const toggleActive = (offer: Offer) => {
    mutations.toggleActive(offer);
    toast.success(t.offers.saved);
  };

  const duplicate = (offer: Offer) => {
    mutations.duplicate(offer);
    toast.success(t.offers.saved);
  };

  const remove = (offer: Offer) => {
    mutations.remove(offer);
    toast.success(t.offers.deleted);
  };

  const actionsFor = (offer: Offer): RowAction[] => [
    {
      label: t.offers.editOffer,
      icon: Pencil,
      onSelect: () => openEdit(offer),
    },
    {
      label: offer.isActive ? t.offers.pause : t.offers.activate,
      icon: offer.isActive ? Pause : Play,
      onSelect: () => toggleActive(offer),
    },
    {
      label: t.offers.duplicateOffer,
      icon: Copy,
      onSelect: () => duplicate(offer),
    },
    {
      label: t.offers.deleteOffer,
      icon: Trash2,
      onSelect: () => remove(offer),
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold md:text-2xl">
          {t.offers.manageTitle}
          {offers && offers.length > 0 && (
            <span className="ms-2 rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
              {offers.length}
            </span>
          )}
        </h1>
        <Button onClick={openNew}>
          <Plus className="size-4" />
          {t.offers.newOffer}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.offers.searchOffers}
          className="h-11 ps-10"
        />
      </div>

      {offers === null ? (
        <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/9] rounded-2xl" />
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
            <Tag className="size-6" />
          </span>
          <p className="mt-4 font-heading text-lg font-bold">
            {offers.length === 0 ? t.offers.noOffers : t.offers.noResults}
          </p>
          {offers.length === 0 && (
            <>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {isStore ? t.offers.noOffersBodyStore : t.offers.noOffersBody}
              </p>
              <Button className="mt-5" onClick={openNew}>
                <Plus className="size-4" />
                {t.offers.newOffer}
              </Button>
            </>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {visible.map((offer) => {
            const state = offerState(offer);

            return (
              <li key={offer.id}>
                <OfferCard
                  offer={offer}
                  onClick={() => openEdit(offer)}
                  muted={state === "paused" || state === "expired"}
                  startBadge={
                    <>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-bold",
                          stateStyle[state],
                        )}
                      >
                        {stateLabel[state]}
                      </span>
                      {/* the saving joins the state at this corner: the
                          opposite one belongs to the actions menu */}
                      {offerDiscount(offer) > 0 && (
                        <span className="rounded-full bg-zest px-2.5 py-1 text-[11px] font-bold text-zest-foreground">
                          {fmt(t.offers.discount, {
                            percent: offerDiscount(offer),
                          })}
                        </span>
                      )}
                    </>
                  }
                  actions={
                    <RowActions
                      actions={actionsFor(offer)}
                      triggerClassName="size-8 bg-white/20 text-white backdrop-blur-md hover:bg-white/35"
                    />
                  }
                  footnote={
                    // the type reads here rather than as a chip: the corner it
                    // would take is the state's, which the owner scans first
                    <p className="truncate text-xs font-semibold text-white/75">
                      {offer.badge ? `${badgeLabel[offer.badge]} · ` : ""}
                      {offer.endsAt
                        ? fmt(t.offers.validUntil, { date: offer.endsAt })
                        : t.offers.noEndDate}
                    </p>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      <OfferDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </div>
  );
}
