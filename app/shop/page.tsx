import PublicPageShell from "@/app/components/PublicPageShell";
import { getGiftSets, getPublicCoffees, getSubscriptionPlans } from "@/lib/public-data";
import ShopBrowser from "./ShopBrowser";

export default async function ShopPage() {
  const [coffees, giftSets, plans] = await Promise.all([
    getPublicCoffees(),
    getGiftSets(),
    getSubscriptionPlans(),
  ]);

  return (
    <PublicPageShell>
      <ShopBrowser
        coffees={coffees}
        giftSets={giftSets}
        plans={plans}
        title="All Coffees"
        subtitle="Browse the live catalog, filter by roast and tags, and add freshly priced coffees straight to your cart."
      />
    </PublicPageShell>
  );
}
