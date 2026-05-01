"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { formatINR } from "@/lib/currency";
import { COFFEE_IMAGES } from "@/lib/coffee-config";

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
        setUser(data || { id: authUser.id, email: authUser.email || "", full_name: "", role: "customer", avatar_url: "", created_at: "" });
      }
    };
    const timer = window.setTimeout(() => {
      setIsMounted(true);
      void getUser();
    }, 0);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setUser(data || { id: session.user.id, email: session.user.email || "", full_name: "", role: "customer", avatar_url: "", created_at: "" });
      } else {
        setUser(null);
      }
    });

    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Admin Button (fixed bottom-left) - Only visible if admin */}
      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="fixed bottom-6 left-6 z-40 glass-card w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          aria-label="Admin Panel"
          title="Admin Panel"
        >
          <span className="text-2xl">⚙️</span>
        </Link>
      )}

      {/* Cart Button (fixed) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn-accent w-14 h-14 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow"
        id="cart-toggle"
        aria-label="Open cart"
        suppressHydrationWarning
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {isMounted && totalItems() > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {totalItems()}
          </span>
        )}
      </button>

      {/* User menu (fixed top-right, visible on storefront pages) */}
      <div className="fixed top-20 right-6 z-40 flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/account/orders" className="glass-card px-3 py-1.5 rounded-full text-xs font-medium hover:border-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
              Orders
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="glass-card px-3 py-1.5 rounded-full text-xs font-medium hover:border-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-accent)" }}>
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="glass-card px-3 py-1.5 rounded-full text-xs font-medium hover:border-red-400 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="glass-card px-4 py-1.5 rounded-full text-xs font-medium hover:border-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
            Sign In
          </Link>
        )}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col"
              style={{ backgroundColor: "var(--coffee-bg-primary)", borderLeft: "1px solid var(--coffee-border)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid var(--coffee-border)" }}>
                <h2 className="font-['Playfair_Display'] text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                  Your Cart ({totalItems()})
                </h2>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>✕</button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-4xl block mb-3">🛒</span>
                    <p className="text-sm" style={{ color: "var(--coffee-text-secondary)" }}>Your cart is empty</p>
                    <button onClick={() => setIsOpen(false)} className="mt-4 btn-accent px-5 py-2 rounded-full text-sm font-semibold">Browse Coffee</button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.coffee.id} className="glass-card rounded-xl p-4 flex gap-4">
                      <img
                        src={item.coffee.thumbnail_url || COFFEE_IMAGES.beans}
                        alt={item.coffee.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border"
                        style={{ borderColor: "var(--coffee-border)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate" style={{ color: "var(--coffee-text-primary)" }}>{item.coffee.name}</h4>
                        <p className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>{formatINR(item.coffee.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.coffee.id, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}>−</button>
                          <span className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.coffee.id, item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}>+</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(item.coffee.id)} className="text-xs hover:text-red-400 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>✕</button>
                        <span className="text-sm font-bold" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(item.coffee.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 space-y-4" style={{ borderTop: "1px solid var(--coffee-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--coffee-text-secondary)" }}>Subtotal</span>
                  <span className="text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(totalPrice())}</span>
                </div>
                  <Link href="/checkout" onClick={() => setIsOpen(false)} className="block w-full btn-accent btn-shimmer py-3 rounded-xl text-sm font-semibold tracking-wide uppercase text-center">
                    Proceed to Checkout
                  </Link>
                  <button onClick={clearCart} className="w-full py-2 text-xs text-center hover:text-red-400 transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
                    Clear cart
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
