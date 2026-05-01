import { isOrderStatus } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server-auth";

function bodyRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = bodyRecord(parsedBody);
  const orderIds = Array.isArray(body?.orderIds)
    ? body.orderIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  const status = typeof body?.status === "string" ? body.status : "";

  if (orderIds.length === 0) {
    return Response.json({ error: "At least one order id is required." }, { status: 400 });
  }

  if (!isOrderStatus(status)) {
    return Response.json({ error: "Invalid order status." }, { status: 400 });
  }

  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;

  const { data, error } = await admin.supabase
    .from("orders")
    .update({ status })
    .in("id", orderIds)
    .select("id");

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const changedIds = (data ?? []).map((order) => order.id as string);
  if (changedIds.length > 0) {
    const { error: eventError } = await admin.supabase.from("order_status_events").insert(
      changedIds.map((orderId) => ({
        order_id: orderId,
        status,
        changed_by: admin.userId,
        note,
      }))
    );

    if (eventError) {
      return Response.json({ error: eventError.message }, { status: 400 });
    }
  }

  return Response.json({ updated: changedIds.length });
}
