import CmsManager from "../components/CmsManager";

export default function AdminShopPage() {
  return <CmsManager resources={["gift_sets", "gift_set_items", "subscription_plans"]} />;
}
