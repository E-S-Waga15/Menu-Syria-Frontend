/** Central cache-key factory — one place to reason about invalidation. */
export const queryKeys = {
  governorates: ["governorates"] as const,
  regions: ["regions"] as const,
  restaurants: {
    all: ["restaurants"] as const,
    featured: ["restaurants", "featured"] as const,
    detail: (slug: string) => ["restaurants", slug] as const,
    menu: (slug: string) => ["restaurants", slug, "menu"] as const,
    analytics: (id: string) => ["restaurants", id, "analytics"] as const,
    orders: (id: string) => ["restaurants", id, "orders"] as const,
    tables: (id: string) => ["restaurants", id, "tables"] as const,
    waiters: (id: string) => ["restaurants", id, "waiters"] as const,
  },
  agents: {
    all: ["agents"] as const,
    byGovernorate: (governorateId: string) =>
      ["agents", { governorateId }] as const,
    detail: (id: string) => ["agents", id] as const,
    restaurants: (id: string) => ["agents", id, "restaurants"] as const,
    transactions: (id: string) => ["agents", id, "transactions"] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    restaurants: ["admin", "restaurants"] as const,
    agents: ["admin", "agents"] as const,
  },
} as const;
