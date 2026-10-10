/**
 * Recovers real content from a business record whose `description` is
 * actually the registration request's free-text `notes` dump.
 *
 * `/registration-requests/public` has no dedicated fields for a logo,
 * theme colors, address or map pin — those only had `notes` to ride in on
 * (see `restaurant-register-form.tsx`). Approving a request apparently
 * copies that whole blob straight into the new business's `description`
 * instead of parsing it into the columns that already exist for each of
 * these (`logoUrl`, `theme`, `address`, `location`) — so a visitor sees
 * "Logo: ...\nColors: ...\nLocation: ..." where a description belongs, and
 * the map falls back to Damascus-center because `location` was never
 * actually written.
 *
 * This is a frontend patch for records already in that state, not a fix —
 * the real fix is on the backend, either adding those fields to the public
 * DTO or having request-approval parse `notes` into them. A record that was
 * never put through this is untouched: `looksLikeDump` only fires on the
 * known "Label: value" lines this form itself used to produce.
 */

const KNOWN_PREFIXES = [
  "Logo",
  "Colors",
  "Location",
  "Cuisine",
  "Address",
  "Description",
  "Instagram",
  "Facebook",
  "TikTok",
];

export interface RecoveredBusinessFields {
  /** the real description, or "" if the dump never had one */
  description: string;
  address?: string;
  location?: { lat: number; lng: number };
}

function field(lines: string[], label: string): string | undefined {
  const prefix = `${label}:`;
  const line = lines.find((l) => l.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : undefined;
}

export function recoverBusinessFields(raw: string): RecoveredBusinessFields {
  if (!raw) return { description: "" };

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const looksLikeDump = lines.some((line) =>
    KNOWN_PREFIXES.some((prefix) => line.startsWith(`${prefix}:`)),
  );
  if (!looksLikeDump) return { description: raw };

  const address = field(lines, "Address");
  const locationRaw = field(lines, "Location");
  let location: { lat: number; lng: number } | undefined;
  if (locationRaw) {
    const [latStr, lngStr] = locationRaw.split(",").map((s) => s.trim());
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (Number.isFinite(lat) && Number.isFinite(lng)) location = { lat, lng };
  }

  return { description: field(lines, "Description") ?? "", address, location };
}
