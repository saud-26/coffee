"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/currency";
import {
  ORDER_STATUS_DISPLAY,
  ORDER_STATUS_SEQUENCE,
  getOrderStatusIndex,
  normalizeOrderStatus,
} from "@/lib/order-status";
import { getCoffeeImageByName } from "@/lib/coffee-config";
import { useCartStore } from "@/lib/store/cart";
import type { Coffee, OrderStatusEvent, OrderWithItems } from "@/lib/types";

export default function AccountOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const addItem = useCartStore((state) => state.addItem);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchOrder = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth/login?redirect=/account/orders/${params.orderId}`);
        return;
      }

      const [{ data: orderData }, { data: eventData }] = await Promise.all([
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", params.orderId)
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("order_status_events")
          .select("*")
          .eq("order_id", params.orderId)
          .order("occurred_at", { ascending: true }),
      ]);

      if (isCancelled) return;
      setOrder((orderData as OrderWithItems | null) ?? null);
      setEvents((eventData as OrderStatusEvent[] | null) ?? []);
      setLoading(false);
    };

    void fetchOrder();
    timer = setInterval(() => {
      void fetchOrder();
    }, 60000);

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [params.orderId, router, supabase]);

  const reorder = () => {
    if (!order) return;

    order.order_items.forEach((item, index) => {
      const coffee: Coffee = {
        id: item.coffee_id ?? `${order.id}-${item.id}`,
        name: item.coffee_name,
        description: "",
        price: Number(item.coffee_price),
        thumbnail_url: getCoffeeImageByName(item.coffee_name, index),
        origin: "",
        roast: "Medium",
        weight: "",
        rating: 0,
        reviews: 0,
        tags: [],
        badge: "",
        in_stock: true,
        grind_options: [],
        is_best_seller: false,
        is_new_arrival: false,
        is_featured: false,
        date_added: "",
        created_at: "",
        updated_at: "",
      };

      for (let count = 0; count < item.quantity; count += 1) {
        addItem(coffee);
      }
    });

    router.push("/checkout");
  };

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12" style={{ background: "var(--coffee-gradient)" }}>
        <div className="max-w-5xl mx-auto glass-card rounded-2xl h-96 animate-pulse" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen px-6 py-12" style={{ background: "var(--coffee-gradient)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p style={{ color: "var(--coffee-text-secondary)" }}>Order not found.</p>
          <Link href="/account/orders" className="btn-accent px-5 py-2.5 rounded-full text-sm font-semibold mt-4 inline-block">
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = normalizeOrderStatus(order.status);
  const currentIndex = getOrderStatusIndex(currentStatus);
  const eventMap = new Map(events.map((event) => [normalizeOrderStatus(event.status), event]));

  return (
    <main className="min-h-screen" style={{ background: "var(--coffee-gradient)" }}>
      <header className="py-6 px-6" style={{ borderBottom: "1px solid var(--coffee-border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/account/orders" className="text-xs hover:text-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
            Back to Orders
          </Link>
          <Link href="/shop" className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
            Shop
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <section className="glass-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-medium mb-2" style={{ color: "var(--coffee-accent)" }}>
                Order #{order.id.slice(0, 8)}
              </p>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                {ORDER_STATUS_DISPLAY[currentStatus].label}
              </h1>
              <p className="text-sm mt-2" style={{ color: "var(--coffee-text-secondary)" }}>
                Placed {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                {formatINR(Number(order.total_price))}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                Payment: {order.payment_status.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6" style={{ color: "var(--coffee-text-primary)" }}>
            Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {ORDER_STATUS_SEQUENCE.map((status, index) => {
              const display = ORDER_STATUS_DISPLAY[status];
              const event = eventMap.get(status);
              const isActive = currentStatus !== "cancelled" && index <= currentIndex;

              return (
                <div key={status} className="rounded-xl p-4 min-h-32" style={{ backgroundColor: isActive ? `${display.color}18` : "rgba(61, 40, 32, 0.32)", border: `1px solid ${isActive ? `${display.color}55` : "var(--coffee-border)"}` }}>
                  <div className="text-sm font-semibold" style={{ color: isActive ? display.color : "var(--coffee-text-secondary)" }}>
                    {display.label}
                  </div>
                  <p className="text-xs mt-3" style={{ color: "var(--coffee-text-secondary)" }}>
                    {event ? new Date(event.occurred_at).toLocaleString("en-IN") : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>
          {currentStatus === "cancelled" && (
            <p className="text-sm mt-4 text-red-300">This order was cancelled.</p>
          )}
        </section>

        {(order.tracking_number || order.carrier_name || order.estimated_delivery_at) && (
          <section className="glass-card rounded-2xl p-6">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4" style={{ color: "var(--coffee-text-primary)" }}>
              Shipping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p style={{ color: "var(--coffee-text-secondary)" }}>Carrier</p>
                <p className="font-semibold" style={{ color: "var(--coffee-text-primary)" }}>{order.carrier_name || "Not assigned"}</p>
              </div>
              <div>
                <p style={{ color: "var(--coffee-text-secondary)" }}>Tracking</p>
                <p className="font-semibold" style={{ color: "var(--coffee-text-primary)" }}>{order.tracking_number || "Not assigned"}</p>
              </div>
              <div>
                <p style={{ color: "var(--coffee-text-secondary)" }}>Estimated Delivery</p>
                <p className="font-semibold" style={{ color: "var(--coffee-text-primary)" }}>
                  {order.estimated_delivery_at ? new Date(order.estimated_delivery_at).toLocaleDateString("en-IN") : "Not assigned"}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              Items
            </h2>
            <button onClick={reorder} className="btn-accent px-5 py-2 rounded-full text-xs font-semibold">
              Reorder
            </button>
          </div>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl p-4" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--coffee-text-primary)" }}>
                    {item.coffee_name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                    {item.quantity} x {formatINR(Number(item.coffee_price))}
                  </p>
                </div>
                <p className="text-sm font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                  {formatINR(Number(item.coffee_price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
