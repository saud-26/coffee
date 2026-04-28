"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, Coffee } from "@/lib/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: ordersCount, data: ordersData },
        { count: productsCount },
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from("orders").select("total_price", { count: "exact" }),
        supabase.from("coffees").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        totalOrders: ordersCount || 0,
        totalRevenue: ordersData?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0,
        totalProducts: productsCount || 0,
        pendingOrders: pendingCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-8" style={{ color: "var(--coffee-text-primary)" }}>Dashboard Overview</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: "💰" },
            { label: "Total Orders", value: stats.totalOrders, icon: "📦" },
            { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳" },
            { label: "Products", value: stats.totalProducts, icon: "☕" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium" style={{ color: "var(--coffee-text-secondary)" }}>{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
