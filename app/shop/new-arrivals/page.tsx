import PublicPageShell from "@/app/components/PublicPageShell";
import { getPublicCoffees } from "@/lib/public-data";
import ShopBrowser from "../ShopBrowser";

export default async function NewArrivalsPage() {
  const coffees = await getPublicCoffees({ newArrivals: true });

  return (
    <PublicPageShell>
      <ShopBrowser
        coffees={coffees}
        title="New Arrivals"
        subtitle="Fresh additions from the roastery, ready for your next brew routine."
      />
    </PublicPageShell>
  );
}
