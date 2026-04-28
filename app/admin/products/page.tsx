"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Coffee } from "@/lib/types";
import Link from "next/link";

export default function AdminProducts() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    const { data } = await supabase
      .from("coffees")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setCoffees(data as Coffee[]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>Manage Products</h1>
        <Link 
          href="/admin/products/new"
          className="btn-accent px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <span>+</span> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coffees.map((coffee) => (
            <div key={coffee.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-48 bg-[var(--coffee-bg-secondary)] border-b border-[var(--coffee-border)]">
                {coffee.thumbnail_url ? (
                  <img src={coffee.thumbnail_url} alt={coffee.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">☕</div>
                )}
                {!coffee.in_stock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">Out of Stock</div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-['Playfair_Display'] text-xl font-bold mb-1" style={{ color: "var(--coffee-text-primary)" }}>{coffee.name}</h3>
                <p className="text-sm mb-4" style={{ color: "var(--coffee-accent)" }}>${coffee.price.toFixed(2)}</p>
                <div className="mt-auto pt-4 border-t border-[var(--coffee-border)] flex justify-end">
                  <Link 
                    href={`/admin/products/${coffee.id}`}
                    className="text-sm font-medium hover:text-[var(--coffee-accent)] transition-colors"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Edit Product →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
