import { apiFetch, apiGetOrUndefined, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  governorates,
  regions,
  storeCategories,
  storeProducts,
  stores,
} from "@/lib/mock/data";
import type {
  LocalizedText,
  Store,
  StoreCategory,
  StoreProduct,
} from "@/lib/types";

export interface PublicStoreCatalog {
  store: Store;
  categories: StoreCategory[];
  products: StoreProduct[];
  governorateName: LocalizedText;
  regionName: LocalizedText;
}

export async function getStores(): Promise<Store[]> {
  if (IS_MOCK) return mockDelay(stores, 200);
  return apiFetch("/stores");
}

export async function getStoreBySlug(
  slug: string,
): Promise<Store | undefined> {
  if (IS_MOCK) return mockDelay(stores.find((s) => s.slug === slug), 150);
  return apiGetOrUndefined(`/stores/${slug}`);
}

export async function getPublicStoreCatalog(
  slug: string,
): Promise<PublicStoreCatalog | undefined> {
  if (IS_MOCK) {
    const store = stores.find((s) => s.slug === slug);
    if (!store) return mockDelay(undefined);
    // Demo data ships one full catalog; every store sells it for now
    const categories = storeCategories
      .map((c) => ({ ...c, storeId: store.id }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const products = storeProducts.map((p) => ({ ...p, storeId: store.id }));
    const governorateName = governorates.find(
      (g) => g.id === store.governorateId,
    )?.name ?? { ar: "", en: "" };
    const regionName = regions.find((r) => r.id === store.regionId)?.name ?? {
      ar: "",
      en: "",
    };
    return mockDelay({
      store,
      categories,
      products,
      governorateName,
      regionName,
    });
  }
  return apiGetOrUndefined(`/store-catalog/${slug}`);
}
