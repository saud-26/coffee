import { normalizeOrderStatus } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server-auth";
import type { OrderWithItems } from "@/lib/types";

type ExportOrder = OrderWithItems & {
  profiles?: {
    email?: string | null;
    full_name?: string | null;
  } | null;
};

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function matchesText(order: ExportOrder, needle: string): boolean {
  const value = needle.toLowerCase();
  return (
    order.id.toLowerCase().includes(value) ||
    (order.profiles?.email ?? "").toLowerCase().includes(value) ||
    (order.profiles?.full_name ?? "").toLowerCase().includes(value) ||
    order.shipping_name.toLowerCase().includes(value)
  );
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  const search = url.searchParams.get("q") ?? "";

  let query = admin.supabase
    .from("orders")
    .select("*, order_items(*), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", normalizeOrderStatus(status));
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const orders = ((data ?? []) as ExportOrder[]).filter((order) =>
    search ? matchesText(order, search) : true
  );

  const rows = [
    [
      "Order ID",
      "Customer",
      "Email",
      "Created",
      "Status",
      "Payment Status",
      "Total",
      "Items",
      "Carrier",
      "Tracking",
      "Estimated Delivery",
      "Ship To",
    ],
    ...orders.map((order) => [
      order.id,
      order.profiles?.full_name || order.shipping_name,
      order.profiles?.email || "",
      new Date(order.created_at).toISOString(),
      normalizeOrderStatus(order.status),
      order.payment_status,
      Number(order.total_price).toFixed(2),
      order.order_items?.map((item) => `${item.coffee_name} x${item.quantity}`).join("; ") ?? "",
      order.carrier_name ?? "",
      order.tracking_number ?? "",
      order.estimated_delivery_at ?? "",
      `${order.shipping_address}, ${order.shipping_city} ${order.shipping_zip}`,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="brew-co-orders-${Date.now()}.csv"`,
    },
  });
}
