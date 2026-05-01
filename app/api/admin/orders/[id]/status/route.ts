import { isOrderStatus } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server-auth";

const PAYMENT_STATUSES = [
  "pending_verification",
  "verified",
  "failed",
  "refunded",
  "not_required",
] as const;

type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
type OrderStatusRouteContext = {
  params: Promise<{ id: string }>;
};

function bodyRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringOrNull(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function PATCH(request: Request, context: OrderStatusRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!id) return Response.json({ error: "Order id is required." }, { status: 400 });

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = bodyRecord(parsedBody);
  if (!body) return Response.json({ error: "Request body must be an object." }, { status: 400 });

  const status = typeof body.status === "string" ? body.status : "";
  if (!isOrderStatus(status)) {
    return Response.json({ error: "Invalid order status." }, { status: 400 });
  }

  const updates: Record<string, string | null> = { status };

  if (typeof body.payment_status === "string") {
    if (!PAYMENT_STATUSES.includes(body.payment_status as PaymentStatus)) {
      return Response.json({ error: "Invalid payment status." }, { status: 400 });
    }
    updates.payment_status = body.payment_status;
  }

  const trackingNumber = stringOrNull(body.tracking_number);
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;

  const carrierName = stringOrNull(body.carrier_name);
  if (carrierName !== undefined) updates.carrier_name = carrierName;

  const estimatedDelivery = stringOrNull(body.estimated_delivery_at);
  if (estimatedDelivery !== undefined) updates.estimated_delivery_at = estimatedDelivery;

  const note = stringOrNull(body.note) ?? null;

  const { data, error } = await admin.supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*, order_items(*), profiles(email, full_name)")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const { error: eventError } = await admin.supabase.from("order_status_events").insert({
    order_id: id,
    status,
    changed_by: admin.userId,
    note,
  });

  if (eventError) {
    return Response.json({ error: eventError.message }, { status: 400 });
  }

  return Response.json({ order: data });
}
