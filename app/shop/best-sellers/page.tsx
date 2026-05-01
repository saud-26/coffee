import PublicPageShell from "@/app/components/PublicPageShell";
import { getPublicCoffees } from "@/lib/public-data";
import ShopBrowser from "../ShopBrowser";

export default async function BestSellersPage() {
  const coffees = await getPublicCoffees({ bestSellers: true });

  return (
    <PublicPageShell>
      <ShopBrowser
        coffees={coffees}
        title="Best Sellers"
        subtitle="The roasts customers keep coming back for, pulled directly from the product catalog."
      />
    </PublicPageShell>
  );
}
