import PublicPageShell from "@/app/components/PublicPageShell";
import { getGiftSets, getPublicCoffees } from "@/lib/public-data";
import ShopBrowser from "../ShopBrowser";

export default async function GiftSetsPage() {
  const [coffees, giftSets] = await Promise.all([getPublicCoffees({ featured: true }), getGiftSets()]);

  return (
    <PublicPageShell>
      <ShopBrowser
        coffees={coffees}
        giftSets={giftSets}
        title="Gift Sets"
        subtitle="Curated coffee bundles and featured roasts for gifting, hosting, and tasting."
      />
    </PublicPageShell>
  );
}
