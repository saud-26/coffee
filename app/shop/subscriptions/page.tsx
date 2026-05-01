import PublicPageShell from "@/app/components/PublicPageShell";
import { getPublicCoffees, getSubscriptionPlans } from "@/lib/public-data";
import ShopBrowser from "../ShopBrowser";

export default async function SubscriptionsPage() {
  const [coffees, plans] = await Promise.all([getPublicCoffees({ featured: true }), getSubscriptionPlans()]);

  return (
    <PublicPageShell>
      <ShopBrowser
        coffees={coffees}
        plans={plans}
        title="Subscriptions"
        subtitle="Internal subscription plans for repeat customers, without automatic recurring billing."
      />
    </PublicPageShell>
  );
}
