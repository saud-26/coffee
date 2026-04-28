"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { OrderWithItems, Profile } from "@/lib/types";

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "#FFD700", icon: "⏳" },
  brewing: { label: "Brewing", color: "#D4A574", icon: "☕" },
  out_for_delivery: { label: "Out for Delivery", color: "#4F9C8F", icon: "🚚" },
  delivered: { label: "Delivered", color: "#22C55E", icon: "✅" },
  cancelled: { label: "Cancelled", color: "#EF4444", icon: "❌" },
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData as OrderWithItems[]);
      setLoading(false);
    };
    fetchData();

    // Real-time subscription for order updates
    const channel = supabase
      .channel("orders-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--coffee-gradient)" }}>
      {/* Header */}
      <div className="py-6 px-6" style={{ borderBottom: "1px solid var(--coffee-border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-['Playfair_Display'] text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.</span>
          </Link>
          <div className="flex items-center gap-3">
            {(profile?.role === "admin" || (profile?.email && ["khansaood@rmc.edu.in", "saud@rmc.edu.in"].includes(profile.email))) && (
              <Link href="/admin" className="glass-card px-4 py-1.5 rounded-full text-xs font-medium hover:border-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-accent)", border: "1px solid var(--coffee-accent)" }}>Admin Panel</Link>
            )}
            <Link href="/" className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>Store</Link>
            <button onClick={handleLogout} className="text-xs hover:text-red-400 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-2" style={{ color: "var(--coffee-accent)" }}>Dashboard</p>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
            Welcome back, <span className="italic">{profile?.full_name || profile?.email?.split("@")[0] || "Coffee Lover"}</span>
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Orders", value: orders.length, icon: "📦" },
            { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: "⏳" },
            { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: "✅" },
            { label: "Total Spent", value: `$${orders.reduce((s, o) => s + Number(o.total_price), 0).toFixed(2)}`, icon: "💰" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl p-5">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-2xl font-bold mt-2" style={{ color: "var(--coffee-text-primary)" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Order History */}
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6" style={{ color: "var(--coffee-text-primary)" }}>Order History</h2>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <span className="text-5xl block mb-3">🛒</span>
            <p className="text-sm mb-4" style={{ color: "var(--coffee-text-secondary)" }}>No orders yet. Time for your first cup!</p>
            <Link href="/#products" className="btn-accent px-6 py-2.5 rounded-full text-sm font-semibold inline-block">Browse Coffee</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{status.icon}</span>
                      <div>
                        <p className="text-xs font-mono" style={{ color: "var(--coffee-text-secondary)" }}>#{order.id.slice(0, 8)}</p>
                        <p className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>
                          {order.order_items?.map((i) => `${i.coffee_name} ×${i.quantity}`).join(", ")}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40` }}>
                        {status.label}
                      </span>
                      <span className="text-lg font-bold" style={{ color: "var(--coffee-text-primary)" }}>${Number(order.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
