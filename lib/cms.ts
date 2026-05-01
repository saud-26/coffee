export type CmsFieldType =
  | "text"
  | "textarea"
  | "html"
  | "number"
  | "boolean"
  | "array"
  | "date"
  | "select";

export type CmsFieldConfig = {
  name: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  options?: string[];
};

export type CmsResourceConfig = {
  resource: string;
  title: string;
  description: string;
  fields: CmsFieldConfig[];
  orderBy?: string;
  readOnly?: boolean;
};

export const CMS_RESOURCES = {
  gift_sets: {
    resource: "gift_sets",
    title: "Gift Sets",
    description: "Create curated bundles for /shop/gift-sets.",
    orderBy: "sort_order",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "thumbnail_url", label: "Image URL", type: "text" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  gift_set_items: {
    resource: "gift_set_items",
    title: "Gift Set Items",
    description: "Attach coffees or manual items to a gift set.",
    orderBy: "sort_order",
    fields: [
      { name: "gift_set_id", label: "Gift Set ID", type: "text", required: true },
      { name: "coffee_id", label: "Coffee ID", type: "text" },
      { name: "item_name", label: "Item Name", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number", required: true },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  subscription_plans: {
    resource: "subscription_plans",
    title: "Subscription Plans",
    description: "Internal recurring plan records without payment automation.",
    orderBy: "sort_order",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price", label: "Price", type: "number", required: true },
      {
        name: "cadence",
        label: "Cadence",
        type: "select",
        options: ["weekly", "biweekly", "monthly"],
      },
      { name: "bag_count", label: "Bag Count", type: "number" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  site_pages: {
    resource: "site_pages",
    title: "Site Pages",
    description: "Rich HTML pages used across company and support routes.",
    orderBy: "slug",
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body_html", label: "Body HTML", type: "html" },
      { name: "meta_title", label: "Meta Title", type: "text" },
      { name: "meta_description", label: "Meta Description", type: "textarea" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
  },
  timeline_entries: {
    resource: "timeline_entries",
    title: "Timeline",
    description: "Milestones for the company story page.",
    orderBy: "sort_order",
    fields: [
      { name: "year_label", label: "Year", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea" },
      { name: "sort_order", label: "Sort Order", type: "number" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
  },
  process_steps: {
    resource: "process_steps",
    title: "Process Steps",
    description: "Roasting and fulfillment steps for /company/process.",
    orderBy: "step_number",
    fields: [
      { name: "step_number", label: "Step Number", type: "number", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea" },
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
  },
  sustainability_metrics: {
    resource: "sustainability_metrics",
    title: "Sustainability Metrics",
    description: "Metrics and proof points for /company/sustainability.",
    orderBy: "sort_order",
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "value", label: "Value", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "sort_order", label: "Sort Order", type: "number" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
  },
  careers_jobs: {
    resource: "careers_jobs",
    title: "Careers",
    description: "Open roles shown on /company/careers.",
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "employment_type", label: "Employment Type", type: "text" },
      { name: "description_html", label: "Description HTML", type: "html" },
      { name: "is_published", label: "Published", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  press_entries: {
    resource: "press_entries",
    title: "Press",
    description: "Press clips and announcements.",
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "outlet", label: "Outlet", type: "text" },
      { name: "published_at", label: "Published At", type: "date" },
      { name: "url", label: "URL", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "is_published", label: "Published", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  faq_items: {
    resource: "faq_items",
    title: "FAQ",
    description: "Frequently asked questions for support pages.",
    orderBy: "sort_order",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer_html", label: "Answer HTML", type: "html" },
      { name: "category", label: "Category", type: "text" },
      { name: "sort_order", label: "Sort Order", type: "number" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
  },
  shipping_rates: {
    resource: "shipping_rates",
    title: "Shipping Rates",
    description: "Rates and delivery estimates for support/shipping.",
    orderBy: "sort_order",
    fields: [
      { name: "region", label: "Region", type: "text", required: true },
      { name: "min_order_value", label: "Minimum Order Value", type: "number" },
      { name: "rate", label: "Rate", type: "number" },
      { name: "estimated_days", label: "Estimated Days", type: "text" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  contact_submissions: {
    resource: "contact_submissions",
    title: "Contact Submissions",
    description: "Messages sent through the support contact form.",
    orderBy: "created_at",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "topic", label: "Topic", type: "text" },
      { name: "message", label: "Message", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["new", "in_review", "resolved"],
      },
    ],
  },
} satisfies Record<string, CmsResourceConfig>;

export type CmsResourceName = keyof typeof CMS_RESOURCES;

export function isCmsResourceName(resource: string): resource is CmsResourceName {
  return Object.prototype.hasOwnProperty.call(CMS_RESOURCES, resource);
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
