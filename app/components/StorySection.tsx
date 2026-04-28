"use client";

import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section id="story" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--coffee-accent)] opacity-[0.03] blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[var(--coffee-bean)] opacity-[0.05] blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] glass-card">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#3D2820] to-[#1A0F0A] p-8">
                <span className="text-8xl mb-6 animate-float">☕</span>
                <div className="space-y-4 text-center">
                  <div
                    className="text-6xl font-['Playfair_Display'] font-bold"
                    style={{ color: "var(--coffee-text-primary)" }}
                  >
                    2018
                  </div>
                  <p
                    className="text-sm uppercase tracking-[0.3em]"
                    style={{ color: "var(--coffee-accent)" }}
                  >
                    Established
                  </p>
                  <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-[var(--coffee-border)]">
                    <div>
                      <div
                        className="text-2xl font-bold font-['Playfair_Display']"
                        style={{ color: "var(--coffee-text-primary)" }}
                      >
                        12
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                        Origins
                      </p>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold font-['Playfair_Display']"
                        style={{ color: "var(--coffee-text-primary)" }}
                      >
                        50k+
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                        Cups Served
                      </p>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold font-['Playfair_Display']"
                        style={{ color: "var(--coffee-text-primary)" }}
                      >
                        4.9
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                        Avg Rating
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-6 -right-6 glass-card rounded-xl p-4 animate-float-delayed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--coffee-accent)] flex items-center justify-center text-white text-lg">
                  ✓
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--coffee-text-primary)" }}
                  >
                    SCA Certified
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Specialty Grade
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <p
              className="text-sm uppercase tracking-[0.3em] font-medium"
              style={{ color: "var(--coffee-accent)" }}
            >
              Our Story
            </p>
            <h2
              className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "var(--coffee-text-primary)" }}
            >
              Crafted with Passion,
              <br />
              <span className="italic">Served with Soul</span>
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--coffee-text-secondary)" }}
            >
              Born from a simple belief that exceptional coffee should be
              accessible to everyone. We started as a small roastery in Portland,
              driven by an obsession with finding the world&apos;s most remarkable
              beans and roasting them to their fullest potential.
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--coffee-text-secondary)" }}
            >
              Today, we work directly with over 30 farming communities across 12
              countries, ensuring fair wages and sustainable practices while
              delivering coffees that consistently score 85+ on the SCA scale.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: "🌿", label: "100% Organic" },
                { icon: "🤝", label: "Fair Trade" },
                { icon: "♻️", label: "Eco Packaging" },
                { icon: "🏆", label: "Award Winning" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: "rgba(61, 40, 32, 0.4)",
                    border: "1px solid rgba(90, 64, 52, 0.3)",
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--coffee-text-primary)" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
