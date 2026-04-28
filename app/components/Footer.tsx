"use client";

const footerLinks = {
  shop: [
    { label: "All Coffees", href: "#products" },
    { label: "Best Sellers", href: "#products" },
    { label: "New Arrivals", href: "#products" },
    { label: "Gift Sets", href: "#products" },
    { label: "Subscriptions", href: "#products" },
  ],
  company: [
    { label: "Our Story", href: "#story" },
    { label: "Process", href: "#process" },
    { label: "Sustainability", href: "#process" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "FAQ", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer id="contact" className="border-t" style={{ borderColor: "var(--coffee-border)", backgroundColor: "var(--coffee-hero-bg)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">☕</span>
              <span className="font-['Playfair_Display'] text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
                BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--coffee-text-secondary)" }}>
              Premium artisan coffee, roasted to order and delivered fresh to your door. From bean to cup, we obsess over every detail.
            </p>
            <div className="flex gap-3">
              {["Instagram", "Twitter", "Facebook"].map((social) => (
                <a key={social} href="#" className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:bg-[var(--coffee-accent)] hover:text-white" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", color: "var(--coffee-text-secondary)", border: "1px solid var(--coffee-border)" }}>
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: "var(--coffee-text-primary)" }}>{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm transition-colors hover:text-[var(--coffee-accent)]" style={{ color: "var(--coffee-text-secondary)" }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--coffee-border)" }}>
          <p className="text-xs" style={{ color: "var(--coffee-border)" }}>
            © 2026 Brew & Co. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-xs hover:text-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-border)" }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
