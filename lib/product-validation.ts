import type { Coffee } from "@/lib/types";

type ProductPayload = Partial<
  Pick<
    Coffee,
    | "name"
    | "description"
    | "price"
    | "thumbnail_url"
    | "origin"
    | "roast"
    | "weight"
    | "rating"
    | "reviews"
    | "tags"
    | "badge"
    | "in_stock"
    | "grind_options"
    | "is_best_seller"
    | "is_new_arrival"
    | "is_featured"
    | "date_added"
  >
>;

const ROASTS = ["Light", "Medium", "Medium-Dark", "Dark"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stringArrayValue(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

export function validateProductPayload(
  value: unknown,
  partial = false
): { ok: true; payload: ProductPayload } | { ok: false; error: string } {
  const body = asRecord(value);
  if (!body) return { ok: false, error: "Request body must be an object." };

  const payload: ProductPayload = {};
  const name = stringValue(body.name);
  const price = numberValue(body.price);

  if (!partial && !name) return { ok: false, error: "Product name is required." };
  if (!partial && price === undefined) return { ok: false, error: "Product price is required." };

  if (name !== undefined) payload.name = name;

  if (price !== undefined) {
    if (price < 0) return { ok: false, error: "Product price cannot be negative." };
    payload.price = Number(price.toFixed(2));
  } else if ("price" in body) {
    return { ok: false, error: "Product price must be numeric." };
  }

  const description = stringValue(body.description);
  if (description !== undefined) payload.description = description;

  const thumbnailUrl = stringValue(body.thumbnail_url);
  if (thumbnailUrl !== undefined) payload.thumbnail_url = thumbnailUrl;

  const origin = stringValue(body.origin);
  if (origin !== undefined) payload.origin = origin;

  const roast = stringValue(body.roast);
  if (roast !== undefined) {
    if (!ROASTS.includes(roast as (typeof ROASTS)[number])) {
      return { ok: false, error: "Invalid roast value." };
    }
    payload.roast = roast as Coffee["roast"];
  }

  const weight = stringValue(body.weight);
  if (weight !== undefined) payload.weight = weight;

  const rating = numberValue(body.rating);
  if (rating !== undefined) payload.rating = Math.min(Math.max(rating, 0), 5);

  const reviews = numberValue(body.reviews);
  if (reviews !== undefined) payload.reviews = Math.max(Math.round(reviews), 0);

  const tags = stringArrayValue(body.tags);
  if (tags !== undefined) payload.tags = tags;

  const badge = stringValue(body.badge);
  if (badge !== undefined) payload.badge = badge;

  const inStock = booleanValue(body.in_stock);
  if (inStock !== undefined) payload.in_stock = inStock;

  const grindOptions = stringArrayValue(body.grind_options);
  if (grindOptions !== undefined) payload.grind_options = grindOptions;

  const bestSeller = booleanValue(body.is_best_seller);
  if (bestSeller !== undefined) payload.is_best_seller = bestSeller;

  const newArrival = booleanValue(body.is_new_arrival);
  if (newArrival !== undefined) payload.is_new_arrival = newArrival;

  const featured = booleanValue(body.is_featured);
  if (featured !== undefined) payload.is_featured = featured;

  const dateAdded = stringValue(body.date_added);
  if (dateAdded !== undefined) payload.date_added = dateAdded;

  return { ok: true, payload };
}
