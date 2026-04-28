"use client";

import { motion } from "framer-motion";

export default function NewsletterCTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F0A] via-[var(--coffee-bg-primary)] to-[#1A0F0A]" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[var(--coffee-accent)] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[var(--coffee-bean)] blur-[80px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-5xl mb-6 block">📬</span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--coffee-text-primary)" }}>
            Join the <span className="italic">Inner Circle</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--coffee-text-secondary)" }}>
            Get exclusive access to limited releases, brewing guides, and 15% off your first order.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              id="newsletter-email"
              className="flex-1 px-5 py-3.5 rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all"
              style={{
                backgroundColor: "rgba(61, 40, 32, 0.5)",
                border: "1px solid var(--coffee-border)",
                color: "var(--coffee-text-primary)",
              }}
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="btn-accent btn-shimmer px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase whitespace-nowrap"
              id="newsletter-submit"
              suppressHydrationWarning
            >
              Subscribe
            </button>
          </form>

          <p className="text-xs mt-4" style={{ color: "var(--coffee-border)" }}>
            No spam. Unsubscribe anytime. We respect your inbox.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
