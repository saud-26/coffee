"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Orders", href: "/admin/orders", icon: "📦" },
    { label: "Products", href: "/admin/products", icon: "☕" },
    { label: "Shop CMS", href: "/admin/shop", icon: "🛍️" },
    { label: "Company CMS", href: "/admin/company", icon: "🏛️" },
    { label: "Support CMS", href: "/admin/support", icon: "💬" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "var(--coffee-gradient)" }}>
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card border-r border-[var(--coffee-border)] flex flex-col">
        <div className="p-6 border-b border-[var(--coffee-border)]">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-['Playfair_Display'] text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              Admin <span style={{ color: "var(--coffee-accent)" }}>Panel</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-[var(--coffee-accent)] text-white" : "hover:bg-[rgba(61,40,32,0.5)]"
                }`}
                style={!isActive ? { color: "var(--coffee-text-secondary)" } : {}}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--coffee-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/10 hover:text-red-400 transition-all"
            style={{ color: "var(--coffee-text-secondary)" }}
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
