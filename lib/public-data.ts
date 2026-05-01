import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  CareersJob,
  Coffee,
  FaqItem,
  GiftSet,
  PressEntry,
  ProcessStep,
  ShippingRate,
  SitePage,
  SubscriptionPlan,
  SustainabilityMetric,
  TimelineEntry,
} from "@/lib/types";

export async function getPublicCoffees(filter?: {
  bestSellers?: boolean;
  newArrivals?: boolean;
  featured?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("coffees")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (filter?.bestSellers) query = query.eq("is_best_seller", true);
  if (filter?.newArrivals) query = query.eq("is_new_arrival", true);
  if (filter?.featured) query = query.eq("is_featured", true);

  const { data } = await query;
  return ((data ?? []) as Coffee[]).map((coffee) => ({
    ...coffee,
    price: Number(coffee.price),
  }));
}

export async function getGiftSets() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("gift_sets")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data ?? []) as GiftSet[]).map((giftSet) => ({
    ...giftSet,
    price: Number(giftSet.price),
  }));
}

export async function getSubscriptionPlans() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data ?? []) as SubscriptionPlan[]).map((plan) => ({
    ...plan,
    price: Number(plan.price),
  }));
}

export async function getSitePage(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return (data as SitePage | null) ?? null;
}

export async function getTimelineEntries() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as TimelineEntry[];
}

export async function getProcessSteps() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("process_steps")
    .select("*")
    .eq("is_published", true)
    .order("step_number", { ascending: true });

  return (data ?? []) as ProcessStep[];
}

export async function getSustainabilityMetrics() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("sustainability_metrics")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as SustainabilityMetric[];
}

export async function getCareersJobs() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("careers_jobs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as CareersJob[];
}

export async function getPressEntries() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("press_entries")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as PressEntry[];
}

export async function getFaqItems() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as FaqItem[];
}

export async function getShippingRates() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("shipping_rates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data ?? []) as ShippingRate[]).map((rate) => ({
    ...rate,
    min_order_value: Number(rate.min_order_value),
    rate: Number(rate.rate),
  }));
}
