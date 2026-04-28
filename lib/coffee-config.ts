export const HERO_BACKGROUND_URL =
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600";

export const COFFEE_IMAGES = {
  espresso: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800",
  cappuccino:
    "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800",
  latte: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800",
  coldBrew: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
  americano:
    "https://images.unsplash.com/photo-1534778101976-62847782c213?w=800",
  mocha: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=800",
  beans: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
} as const;

export const PRODUCT_IMAGE_FALLBACKS = [
  COFFEE_IMAGES.espresso,
  COFFEE_IMAGES.cappuccino,
  COFFEE_IMAGES.latte,
  COFFEE_IMAGES.coldBrew,
  COFFEE_IMAGES.americano,
  COFFEE_IMAGES.mocha,
];

export function getCoffeeImageByName(name: string, index = 0): string {
  const normalized = name.toLowerCase();

  if (normalized.includes("espresso")) return COFFEE_IMAGES.espresso;
  if (normalized.includes("cappuccino")) return COFFEE_IMAGES.cappuccino;
  if (normalized.includes("latte")) return COFFEE_IMAGES.latte;
  if (normalized.includes("cold brew")) return COFFEE_IMAGES.coldBrew;
  if (normalized.includes("americano")) return COFFEE_IMAGES.americano;
  if (normalized.includes("mocha")) return COFFEE_IMAGES.mocha;
  if (normalized.includes("bean")) return COFFEE_IMAGES.beans;

  return PRODUCT_IMAGE_FALLBACKS[index % PRODUCT_IMAGE_FALLBACKS.length];
}

export function getINRPriceByName(name: string, fallback = 199): number {
  const normalized = name.toLowerCase();

  if (normalized.includes("combo") || normalized.includes("bundle")) return 599;
  if (normalized.includes("espresso")) return 149;
  if (normalized.includes("cappuccino")) return 199;
  if (normalized.includes("latte")) return 219;
  if (normalized.includes("cold brew")) return 249;
  if (normalized.includes("americano")) return 179;
  if (normalized.includes("mocha")) return 229;

  const safeFallback = Number.isFinite(fallback) ? fallback : 199;
  return safeFallback < 100 ? 199 : safeFallback;
}
