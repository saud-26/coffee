"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderWithItems } from "@/lib/types";
import { formatINR } from "@/lib/currency";
import {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  toLegacyOrderStatus,
  type CanonicalOrderStatus,
} from "@/lib/order-status";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*), profiles(email, full_name)")
      .order("created_at", { ascending: false });
    
    if (data) {
      setOrders(data as OrderWithItems[]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: CanonicalOrderStatus) => {
    setUpdating(orderId);
    let didUpdate = false;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    
    if (error) {
      const { error: legacyError } = await supabase
        .from("orders")
        .update({ status: toLegacyOrderStatus(newStatus) })
        .eq("id", orderId);

      if (legacyError) {
        alert("Failed to update status");
      } else {
        didUpdate = true;
      }
    } else {
      didUpdate = true;
    }

    if (didUpdate) {
      await fetchOrders();
    }

    setUpdating(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-8" style={{ color: "var(--coffee-text-primary)" }}>Manage Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--coffee-border)", backgroundColor: "rgba(61,40,32,0.4)" }}>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Order ID</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Customer</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Date</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Total</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid rgba(90,64,52,0.2)" }}>
                    <td className="p-4 font-mono text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>{(order as any).profiles?.full_name || 'Guest'}</div>
                      <div className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>{(order as any).profiles?.email}</div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                      {formatINR(Number(order.total_price))}
                    </td>
                    <td className="p-4">
                      <select
                        value={normalizeOrderStatus(order.status)}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as CanonicalOrderStatus)}
                        disabled={updating === order.id}
                        className="text-sm px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                        style={{ 
                          backgroundColor: "rgba(61, 40, 32, 0.8)", 
                          border: "1px solid var(--coffee-border)", 
                          color: "var(--coffee-text-primary)" 
                        }}
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
