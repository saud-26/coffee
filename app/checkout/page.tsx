"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ShippingInfo } from "@/lib/types";
import { formatINR } from "@/lib/currency";

type Step = "shipping" | "payment" | "confirmation";

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: "shipping", label: "Shipping", icon: "📦" },
  { key: "payment", label: "UPI Payment", icon: "📱" },
  { key: "confirmation", label: "Confirmation", icon: "✅" },
];

const UPI_ID = "anwarulhaquekhan619@oksbi";

function buildUPIPaymentString(amount: number): string {
  const formattedAmount = amount.toFixed(2);
  return `upi://pay?pa=${UPI_ID}&pn=Brew%20%26%20Co&am=${formattedAmount}&cu=INR&tn=Coffee%20Order`;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const totalAmount = useMemo(() => Number(totalPrice().toFixed(2)), [totalPrice]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (items.length === 0 && step !== "confirmation") {
      router.push("/");
    }
  }, [items, router, step]);

  useEffect(() => {
    const generateUPIQR = async () => {
      if (step !== "payment") return;
      setQrLoading(true);
      setQrError("");
      try {
        const upiString = buildUPIPaymentString(totalAmount);
        const qrDataURL = await QRCode.toDataURL(upiString, { width: 256, margin: 2 });
        setUpiQrDataUrl(qrDataURL);
      } catch (error) {
        console.error(error);
        setQrError("Could not generate UPI QR code. Please refresh and try again.");
      } finally {
        setQrLoading(false);
      }
    };

    generateUPIQR();
  }, [step, totalAmount]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentConfirmed = async () => {
    if (!userId) return;
    setLoading(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "payment_pending_verification",
        payment_status: "pending_verification",
        total_price: totalAmount,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_zip: shipping.zip,
        shipping_phone: shipping.phone,
      })
      .select()
      .single();

    if (orderError || !order) {
      alert("Failed to create order. Please try again.");
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      coffee_id: item.coffee.id,
      coffee_name: item.coffee.name,
      coffee_price: item.coffee.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      alert("Failed to save order items.");
      setLoading(false);
      return;
    }

    await supabase.from("order_status_events").insert({
      order_id: order.id,
      status: "payment_pending_verification",
      changed_by: userId,
      note: "Payment submitted by customer",
    });

    setOrderId(order.id);
    clearCart();
    setStep("confirmation");
    setLoading(false);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all";
  const inputStyle = {
    backgroundColor: "rgba(61, 40, 32, 0.5)",
    border: "1px solid var(--coffee-border)",
    color: "var(--coffee-text-primary)",
  };
  const labelClass = "block text-xs uppercase tracking-wider font-medium mb-1.5";

  return (
    <div className="min-h-screen" style={{ background: "var(--coffee-gradient)" }}>
      <div className="py-6 px-6" style={{ borderBottom: "1px solid var(--coffee-border)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span
              className="font-['Playfair_Display'] text-xl font-bold"
              style={{ color: "var(--coffee-text-primary)" }}
            >
              BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.
            </span>
          </Link>
          <Link href="/" className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
            ← Back to store
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  i <= stepIndex ? "bg-[var(--coffee-accent)] text-white" : "glass-card"
                }`}
                style={i > stepIndex ? { color: "var(--coffee-text-secondary)" } : {}}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-8 h-px"
                  style={{
                    backgroundColor: i < stepIndex ? "var(--coffee-accent)" : "var(--coffee-border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card rounded-2xl p-8">
                    <h2
                      className="font-['Playfair_Display'] text-2xl font-bold mb-6"
                      style={{ color: "var(--coffee-text-primary)" }}
                    >
                      Shipping Details
                    </h2>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div>
                        <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={shipping.name}
                          onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                          required
                          className={inputClass}
                          style={inputStyle}
                          placeholder="Anwar Khan"
                          id="checkout-name"
                        />
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>
                          Address
                        </label>
                        <input
                          type="text"
                          value={shipping.address}
                          onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                          required
                          className={inputClass}
                          style={inputStyle}
                          placeholder="221B MG Road"
                          id="checkout-address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>
                            City
                          </label>
                          <input
                            type="text"
                            value={shipping.city}
                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                            required
                            className={inputClass}
                            style={inputStyle}
                            placeholder="Bengaluru"
                            id="checkout-city"
                          />
                        </div>
                        <div>
                          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>
                            PIN Code
                          </label>
                          <input
                            type="text"
                            value={shipping.zip}
                            onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                            required
                            className={inputClass}
                            style={inputStyle}
                            placeholder="560001"
                            id="checkout-zip"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={shipping.phone}
                          onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                          required
                          className={inputClass}
                          style={inputStyle}
                          placeholder="+91 98765 43210"
                          id="checkout-phone"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full btn-accent py-3 rounded-xl text-sm font-semibold tracking-wide uppercase mt-4"
                        id="checkout-continue"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card rounded-2xl p-8">
                    <h2
                      className="font-['Playfair_Display'] text-2xl font-bold mb-6"
                      style={{ color: "var(--coffee-text-primary)" }}
                    >
                      UPI Payment
                    </h2>

                    <div className="space-y-4">
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          backgroundColor: "rgba(79, 156, 143, 0.1)",
                          border: "1px solid rgba(79, 156, 143, 0.2)",
                        }}
                      >
                        <p className="text-sm font-medium" style={{ color: "var(--coffee-accent)" }}>
                          UPI Only
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                          Open any UPI app (GPay, PhonePe, Paytm, BHIM) → Scan this QR → Pay{" "}
                          {formatINR(totalAmount)} → Click &quot;I have paid&quot; below.
                        </p>
                      </div>

                      <div className="rounded-xl p-5 text-center" style={{ border: "1px solid var(--coffee-border)" }}>
                        {qrLoading ? (
                          <p style={{ color: "var(--coffee-text-secondary)" }}>Generating QR code...</p>
                        ) : qrError ? (
                          <p className="text-red-400 text-sm">{qrError}</p>
                        ) : (
                          <img
                            src={upiQrDataUrl}
                            alt="UPI payment QR"
                            className="w-64 h-64 object-contain mx-auto rounded-lg bg-white p-3"
                          />
                        )}
                        <p className="text-sm mt-4" style={{ color: "var(--coffee-text-secondary)" }}>
                          UPI ID
                        </p>
                        <p className="text-base font-semibold" style={{ color: "var(--coffee-accent)" }}>
                          {UPI_ID}
                        </p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setStep("shipping")}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase"
                          style={{
                            backgroundColor: "rgba(61, 40, 32, 0.5)",
                            border: "1px solid var(--coffee-border)",
                            color: "var(--coffee-text-primary)",
                          }}
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePaymentConfirmed}
                          disabled={loading || qrLoading || Boolean(qrError)}
                          className="flex-1 btn-accent btn-shimmer py-3 rounded-xl text-sm font-semibold tracking-wide uppercase disabled:opacity-50"
                          id="checkout-place-order"
                        >
                          {loading ? "Submitting..." : "I have paid"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "confirmation" && (
                <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="glass-card rounded-2xl p-10 text-center">
                    <span className="text-6xl block mb-4">✅</span>
                    <h2
                      className="font-['Playfair_Display'] text-3xl font-bold mb-2"
                      style={{ color: "var(--coffee-text-primary)" }}
                    >
                      Payment Submitted
                    </h2>
                    <p className="text-sm mb-2" style={{ color: "var(--coffee-text-secondary)" }}>
                      Your order is marked as Payment Pending Verification and sent to admin.
                    </p>
                    {orderId && (
                      <p
                        className="text-xs mb-6 font-mono px-3 py-1.5 rounded-lg inline-block"
                        style={{
                          backgroundColor: "rgba(61, 40, 32, 0.5)",
                          color: "var(--coffee-accent)",
                        }}
                      >
                        Order #{orderId.slice(0, 8)}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      <Link href="/account/orders" className="btn-accent px-6 py-2.5 rounded-full text-sm font-semibold">
                        View Orders
                      </Link>
                      <Link
                        href="/"
                        className="px-6 py-2.5 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: "rgba(61, 40, 32, 0.5)",
                          border: "1px solid var(--coffee-border)",
                          color: "var(--coffee-text-primary)",
                        }}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step !== "confirmation" && (
            <div className="glass-card rounded-2xl p-6 h-fit">
              <h3
                className="font-['Playfair_Display'] text-lg font-bold mb-4"
                style={{ color: "var(--coffee-text-primary)" }}
              >
                Order Summary
              </h3>
              <div className="space-y-3 mb-4" style={{ borderBottom: "1px solid var(--coffee-border)", paddingBottom: "16px" }}>
                {items.map((item) => (
                  <div key={item.coffee.id} className="flex justify-between text-sm">
                    <span style={{ color: "var(--coffee-text-secondary)" }}>
                      {item.coffee.name} × {item.quantity}
                    </span>
                    <span style={{ color: "var(--coffee-text-primary)" }}>
                      {formatINR(item.coffee.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--coffee-text-secondary)" }}>Subtotal</span>
                  <span style={{ color: "var(--coffee-text-primary)" }}>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--coffee-text-secondary)" }}>Shipping</span>
                  <span style={{ color: "var(--coffee-accent)" }}>Free</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: "1px solid var(--coffee-border)" }}>
                  <span style={{ color: "var(--coffee-text-primary)" }}>Total</span>
                  <span style={{ color: "var(--coffee-text-primary)" }}>{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
