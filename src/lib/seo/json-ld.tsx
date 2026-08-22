import type { Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo/site";
import type { Business, Restaurant, Store } from "@/lib/types";

/** Renders a JSON-LD structured-data block for search engines. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: SITE_URL,
    description,
    areaServed: { "@type": "Country", name: "Syria" },
  };
}

export function websiteJsonLd(siteName: string, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang,
  };
}

function businessBaseJsonLd(business: Business, lang: Locale) {
  return {
    name: business.name[lang],
    description: business.description[lang],
    image: business.coverImages[0] ?? business.logoUrl,
    logo: business.logoUrl,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address[lang],
      addressCountry: "SY",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.location.lat,
      longitude: business.location.lng,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: business.rating,
      bestRating: 5,
    },
  };
}

export function restaurantJsonLd(
  restaurant: Restaurant,
  lang: Locale,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": url,
    url,
    servesCuisine: restaurant.cuisine[lang],
    hasMenu: `${SITE_URL}/${lang}/menu/${restaurant.slug}`,
    ...businessBaseJsonLd(restaurant, lang),
  };
}

export function storeJsonLd(store: Store, lang: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": url,
    url,
    ...businessBaseJsonLd(store, lang),
  };
}

export function breadcrumbsJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
