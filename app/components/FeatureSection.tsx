"use client";

import { motion } from "framer-motion";
import type { Feature } from "../data/products";

interface FeatureSectionProps {
  features: Feature[];
}

export default function FeatureSection({ features }: FeatureSectionProps) {
  return (
    <section id="process" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--coffee-bg-primary)] via-[#1F120C] to-[var(--coffee-bg-primary)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>Our Process</p>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: "var(--coffee-text-primary)" }}>Why Choose Us</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--coffee-text-secondary)" }}>Every step of our process is designed to deliver an extraordinary coffee experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-8 group hover:border-[var(--coffee-accent)] transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coffee-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--coffee-accent)]/10 border border-[var(--coffee-accent)]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <span className="text-5xl font-['Playfair_Display'] font-bold opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: "var(--coffee-text-primary)" }}>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] font-medium mb-2" style={{ color: "var(--coffee-accent)" }}>{feature.subtitle}</p>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold mb-3" style={{ color: "var(--coffee-text-primary)" }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--coffee-text-secondary)" }}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
