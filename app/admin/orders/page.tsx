"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/currency";
import {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  type CanonicalOrderStatus,
} from "@/lib/order-status";
import type { OrderWithItems } from "@/lib/types";

type AdminOrder = OrderWithItems & {
  profiles?: {
    email?: string | null;
    full_name?: string | null;
  } | null;
};

type Filters = {
  q: string;
  status: string;
  from: string;
  to: string;
};

type StatusResponse = {
  error?: string;
};

const emptyFilters: Filters = {
  q: "",
  status: "",
  from: "",
  to: "",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<CanonicalOrderStatus>("confirmed");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [shipment, setShipment] = useState({
    carrier_name: "",
    tracking_number: "",
    estimated_delivery_at: "",
    note: "",
  });
  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, order_items(*), profiles(email, full_name)")
      .order("created_at", { ascending: false });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.from) query = query.gte("created_at", filters.from);
    if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);

    const { data } = await query;
    const rows = ((data ?? []) as AdminOrder[]).filter((order) => {
      if (!filters.q.trim()) return true;
      const needle = filters.q.trim().toLowerCase();
      return (
        order.id.toLowerCase().includes(needle) ||
        (order.profiles?.email ?? "").toLowerCase().includes(needle) ||
        (order.profiles?.full_name ?? "").toLowerCase().includes(needle) ||
        order.shipping_name.toLowerCase().includes(needle)
      );
    });

    setOrders(rows);
    setSelectedIds((previous) => previous.filter((id) => rows.some((order) => order.id === id)));
    setLoading(false);
  }, [filters, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  const detailOrder = orders.find((order) => order.id === detailId) ?? null;

  const openDetail = (order: AdminOrder) => {
    setDetailId(order.id);
    setShipment({
      carrier_name: order.carrier_name ?? "",
      tracking_number: order.tracking_number ?? "",
      estimated_delivery_at: order.estimated_delivery_at?.slice(0, 10) ?? "",
      note: "",
    });
  };

  const toggleSelected = (orderId: string) => {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  const selectAll = () => {
    setSelectedIds((current) =>
      current.length === orders.length ? [] : orders.map((order) => order.id)
    );
  };

  const updateStatus = async (orderId: string, status: CanonicalOrderStatus) => {
    setUpdating(true);
    const shouldSendShipment = ["shipped", "out_for_delivery", "delivered"].includes(status);
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(shouldSendShipment ? shipment : {}),
      }),
    });

    const result = (await response.json()) as StatusResponse;
    if (!response.ok) {
      alert(result.error || "Failed to update status.");
    } else {
      await fetchOrders();
    }
    setUpdating(false);
  };

  const bulkUpdate = async () => {
    if (selectedIds.length === 0) return;

    setUpdating(true);
    const response = await fetch("/api/admin/orders/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds: selectedIds, status: bulkStatus }),
    });

    const result = (await response.json()) as StatusResponse;
    if (!response.ok) {
      alert(result.error || "Bulk update failed.");
    } else {
      setSelectedIds([]);
      await fetchOrders();
    }
    setUpdating(false);
  };

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return `/api/admin/orders/export?${params.toString()}`;
  }, [filters]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
            Manage Orders
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
            Filter, inspect, export, and move orders through fulfillment.
          </p>
        </div>
        <a href={exportUrl} className="btn-accent px-5 py-2.5 rounded-full text-sm font-semibold w-fit">
          Export CSV
        </a>
      </div>

      <section className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={filters.q}
            onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            placeholder="Customer or order ID"
            className="md:col-span-2 px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
          />
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
          />
          <input
            type="date"
            value={filters.to}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
          />
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
            {selectedIds.length} selected
          </p>
          <div className="flex flex-wrap gap-3">
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as CanonicalOrderStatus)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button onClick={bulkUpdate} disabled={updating || selectedIds.length === 0} className="btn-accent px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              Apply to Selected
            </button>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--coffee-border)", backgroundColor: "rgba(61,40,32,0.4)" }}>
                <th className="p-4">
                  <input type="checkbox" checked={orders.length > 0 && selectedIds.length === orders.length} onChange={selectAll} />
                </th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Order</th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Customer</th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Date</th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Total</th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Status</th>
                <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = normalizeOrderStatus(order.status);
                  const display = ORDER_STATUS_OPTIONS.find((option) => option.value === status);

                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(90,64,52,0.2)" }}>
                      <td className="p-4">
                        <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelected(order.id)} />
                      </td>
                      <td className="p-4 font-mono text-xs" style={{ color: "var(--coffee-text-secondary)" }}>#{order.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>{order.profiles?.full_name || order.shipping_name || "Guest"}</div>
                        <div className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>{order.profiles?.email}</div>
                      </td>
                      <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="p-4 text-sm font-bold" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(order.total_price))}</td>
                      <td className="p-4">
                        <select
                          value={status}
                          onChange={(event) => updateStatus(order.id, event.target.value as CanonicalOrderStatus)}
                          disabled={updating}
                          className="text-sm px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                          style={{ backgroundColor: "rgba(61, 40, 32, 0.8)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
                        >
                          {ORDER_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>{display?.label}</p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => openDetail(order)} className="text-sm font-medium hover:text-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailOrder && (
        <section className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                Order #{detailOrder.id.slice(0, 8)}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                {detailOrder.shipping_name}, {detailOrder.shipping_address}, {detailOrder.shipping_city} {detailOrder.shipping_zip}
              </p>
            </div>
            <button onClick={() => setDetailId(null)} className="text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--coffee-text-secondary)" }}>
                Items
              </h3>
              <div className="space-y-2">
                {detailOrder.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
                    <span className="text-sm" style={{ color: "var(--coffee-text-primary)" }}>{item.coffee_name} x{item.quantity}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(item.coffee_price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--coffee-text-secondary)" }}>
                Shipment Fields
              </h3>
              <div className="space-y-3">
                <input value={shipment.carrier_name} onChange={(event) => setShipment({ ...shipment, carrier_name: event.target.value })} placeholder="Carrier name" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }} />
                <input value={shipment.tracking_number} onChange={(event) => setShipment({ ...shipment, tracking_number: event.target.value })} placeholder="Tracking number" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }} />
                <input type="date" value={shipment.estimated_delivery_at} onChange={(event) => setShipment({ ...shipment, estimated_delivery_at: event.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }} />
                <textarea value={shipment.note} onChange={(event) => setShipment({ ...shipment, note: event.target.value })} rows={3} placeholder="Timeline note" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }} />
                <div className="flex flex-wrap gap-3">
                  {(["shipped", "out_for_delivery", "delivered"] as CanonicalOrderStatus[]).map((status) => (
                    <button key={status} onClick={() => updateStatus(detailOrder.id, status)} disabled={updating} className="btn-accent px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50">
                      Mark {ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
