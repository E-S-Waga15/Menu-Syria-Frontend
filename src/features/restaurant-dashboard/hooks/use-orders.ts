"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOrderStatus } from "@/features/restaurant-dashboard/services";
import { useI18n } from "@/i18n/client";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "@/lib/toast";
import type { Order, OrderStatus } from "@/lib/types";

/**
 * Moving an order along the kanban.
 *
 * The board only ever moves an order one step to the right — new becomes
 * preparing, preparing becomes ready — so the caller passes the order and this
 * decides the destination, rather than every button knowing the sequence.
 */
export function useOrderMutations() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const key = queryKeys.me.orders;

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Order[]>(key);
      if (previous) {
        queryClient.setQueryData<Order[]>(
          key,
          previous.map((order) =>
            order.id === id ? { ...order, status } : order,
          ),
        );
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error instanceof ApiError ? error.message : t.common.saveFailed);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    advance: (order: Order) =>
      advance.mutate({
        id: order.id,
        status: order.status === "new" ? "preparing" : "ready",
      }),
    isPending: advance.isPending,
  };
}
