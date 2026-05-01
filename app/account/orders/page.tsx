"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/currency";
import { ORDER_STATUS_DISPLAY, normalizeOrderStatus } from "@/lib/order-status";
import type { OrderWithItems, Profile } from "@/lib/types";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isCancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const fetchOrders = async (uid: string) => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (!isCancelled && data) setOrders(data as OrderWithItems[]);
    };

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login?redirect=/account/orders";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!isCancelled && profileData) setProfile(profileData as Profile);
      await fetchOrders(user.id);
      if (!isCancelled) setLoading(false);

      pollTimer = setInterval(() => {
        void fetchOrders(user.id);
      }, 60000);
    };

    void initialize();

    return () => {
      isCancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [supabase]);

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const pendingCount = orders.filter((order) =>
    ["payment_pending_verification", "confirmed", "roasting", "packed", "shipped", "out_for_delivery"].includes(
      normalizeOrderStatus(order.status)
    )
  ).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--coffee-gradient)" }}>
      <header className="py-6 px-6" style={{ borderBottom: "1px solid var(--coffee-border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-['Playfair_Display'] text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {profile?.role === "admin" && (
              <Link href="/admin" className="glass-card px-4 py-1.5 rounded-full text-xs font-medium" style={{ color: "var(--coffee-accent)", border: "1px solid var(--coffee-accent)" }}>
                Admin Panel
              </Link>
            )}
            <Link href="/shop" className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
              Shop
            </Link>
            <button onClick={handleLogout} className="text-xs hover:text-red-400 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-2" style={{ color: "var(--coffee-accent)" }}>
            Account
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
            Orders for {profile?.full_name || profile?.email?.split("@")[0] || "your account"}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Active Orders", value: pendingCount },
            { label: "Total Spent", value: formatINR(totalSpent) },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6" style={{ color: "var(--coffee-text-primary)" }}>
          Order History
        </h2>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-sm mb-4" style={{ color: "var(--coffee-text-secondary)" }}>
              No orders yet. Time for your first cup.
            </p>
            <Link href="/shop" className="btn-accent px-6 py-2.5 rounded-full text-sm font-semibold inline-block">
              Browse Coffee
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = ORDER_STATUS_DISPLAY[normalizeOrderStatus(order.status)];

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-mono" style={{ color: "var(--coffee-text-secondary)" }}>
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: "var(--coffee-text-primary)" }}>
                        {order.order_items?.map((item) => `${item.coffee_name} x${item.quantity}`).join(", ")}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40` }}>
                        {status.label}
                      </span>
                      <span className="text-lg font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                        {formatINR(Number(order.total_price))}
                      </span>
                      <Link href={`/account/orders/${order.id}`} className="btn-accent px-4 py-2 rounded-full text-xs font-semibold">
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
