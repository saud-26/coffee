import CmsManager from "../components/CmsManager";

export default function AdminSupportPage() {
  return <CmsManager resources={["faq_items", "shipping_rates", "site_pages", "contact_submissions"]} />;
}
