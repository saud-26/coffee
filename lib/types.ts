import type { CanonicalOrderStatus } from "@/lib/order-status";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "admin";
  avatar_url: string;
  created_at: string;
}

export interface Coffee {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  origin: string;
  roast: "Light" | "Medium" | "Medium-Dark" | "Dark";
  weight: string;
  rating: number;
  reviews: number;
  tags: string[];
  badge: string;
  in_stock: boolean;
  grind_options: string[];
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured: boolean;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: CanonicalOrderStatus;
  payment_status:
    | "pending_verification"
    | "verified"
    | "failed"
    | "refunded"
    | "not_required";
  total_price: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_phone: string;
  tracking_number: string | null;
  carrier_name: string | null;
  estimated_delivery_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  coffee_id: string | null;
  coffee_name: string;
  coffee_price: number;
  quantity: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  order_status_events?: OrderStatusEvent[];
}

export interface OrderStatusEvent {
  id: string;
  order_id: string;
  status: CanonicalOrderStatus;
  occurred_at: string;
  changed_by: string | null;
  note: string | null;
}

export interface CartItem {
  coffee: Coffee;
  quantity: number;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export interface GiftSet {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  thumbnail_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GiftSetItem {
  id: string;
  gift_set_id: string;
  coffee_id: string | null;
  item_name: string;
  quantity: number;
  sort_order: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  cadence: "weekly" | "biweekly" | "monthly";
  bag_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "paused" | "cancelled";
  started_at: string;
  paused_at: string | null;
  cancelled_at: string | null;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  body_html: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  id: string;
  title: string;
  body: string;
  year_label: string;
  sort_order: number;
  is_published: boolean;
}

export interface ProcessStep {
  id: string;
  title: string;
  body: string;
  step_number: number;
  image_url: string;
  is_published: boolean;
}

export interface SustainabilityMetric {
  id: string;
  label: string;
  value: string;
  description: string;
  sort_order: number;
  is_published: boolean;
}

export interface CareersJob {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  description_html: string;
  is_published: boolean;
  sort_order: number;
}

export interface PressEntry {
  id: string;
  title: string;
  outlet: string;
  published_at: string;
  url: string;
  summary: string;
  is_published: boolean;
  sort_order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer_html: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

export interface ShippingRate {
  id: string;
  region: string;
  min_order_value: number;
  rate: number;
  estimated_days: string;
  is_active: boolean;
  sort_order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "in_review" | "resolved";
  created_at: string;
}
