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

type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDashboardData = async () => {
    const [
      { data: ordersData, count: ordersCount },
      { count: productsCount },
      { count: usersCount },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*), profiles(email, full_name)", { count: "exact" })
        .order("created_at", { ascending: false }),
      supabase.from("coffees").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    const allOrders = (ordersData as OrderWithItems[] | null) ?? [];

    setOrders(allOrders);
    setStats({
      totalOrders: ordersCount || 0,
      totalRevenue: allOrders.reduce((acc, order) => acc + Number(order.total_price), 0),
      totalUsers: usersCount || 0,
      totalProducts: productsCount || 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel("admin-dashboard-orders-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        setUpdating(null);
        return;
      }

      didUpdate = true;
    } else {
      didUpdate = true;
    }

    if (didUpdate) {
      await fetchDashboardData();
    }

    setUpdating(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1
        className="font-['Playfair_Display'] text-3xl font-bold mb-8"
        style={{ color: "var(--coffee-text-primary)" }}
      >
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Orders", value: stats.totalOrders, icon: "📦" },
            { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: "💰" },
            { label: "Total Users", value: stats.totalUsers, icon: "👥" },
            { label: "Total Products", value: stats.totalProducts, icon: "☕" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium" style={{ color: "var(--coffee-text-secondary)" }}>
                  {stat.label}
                </span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: "var(--coffee-border)" }}>
          <h2
            className="font-['Playfair_Display'] text-2xl font-bold"
            style={{ color: "var(--coffee-text-primary)" }}
          >
            Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--coffee-border)",
                  backgroundColor: "rgba(61,40,32,0.4)",
                }}
              >
                <th
                  className="p-4 text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--coffee-text-secondary)" }}
                >
                  Order ID
                </th>
                <th
                  className="p-4 text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--coffee-text-secondary)" }}
                >
                  Customer
                </th>
                <th
                  className="p-4 text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--coffee-text-secondary)" }}
                >
                  Date
                </th>
                <th
                  className="p-4 text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--coffee-text-secondary)" }}
                >
                  Total
                </th>
                <th
                  className="p-4 text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--coffee-text-secondary)" }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(90,64,52,0.2)" }}>
                  <td className="p-4 font-mono text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>
                      {(order as { profiles?: { full_name?: string } }).profiles?.full_name || "Guest"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
                      {(order as { profiles?: { email?: string } }).profiles?.email}
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4 text-sm font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                    {formatINR(Number(order.total_price))}
                  </td>
                  <td className="p-4">
                    <select
                      value={normalizeOrderStatus(order.status)}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as CanonicalOrderStatus)
                      }
                      disabled={updating === order.id}
                      className="text-sm px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                      style={{
                        backgroundColor: "rgba(61, 40, 32, 0.8)",
                        border: "1px solid var(--coffee-border)",
                        color: "var(--coffee-text-primary)",
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
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
