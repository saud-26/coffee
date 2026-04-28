"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import type { Coffee } from "@/lib/types";

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill={i < fullStars ? "var(--coffee-gold)" : i === fullStars && hasHalf ? "url(#halfStar)" : "var(--coffee-border)"}>
          <defs><linearGradient id="halfStar"><stop offset="50%" stopColor="var(--coffee-gold)" /><stop offset="50%" stopColor="var(--coffee-border)" /></linearGradient></defs>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-sm font-medium" style={{ color: "var(--coffee-text-secondary)" }}>{rating}</span>
      <span className="text-xs ml-1" style={{ color: "var(--coffee-border)" }}>({reviews})</span>
    </div>
  );
}

function ProductCard({ product, index }: { product: Coffee; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="product-card glass-card rounded-2xl overflow-hidden group"
    >
      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: "var(--coffee-bg-secondary)" }}>
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover product-image" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3D2820] to-[#2D1810]">
            <div className="text-center">
              <span className="text-6xl block mb-2 product-image opacity-80 group-hover:opacity-100 transition-opacity">☕</span>
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--coffee-text-secondary)" }}>{product.roast} Roast</span>
            </div>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[var(--coffee-accent)] text-white">{product.badge}</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
          {product.tags?.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium" style={{ backgroundColor: "rgba(26, 15, 10, 0.75)", color: "var(--coffee-text-secondary)", border: "1px solid rgba(90, 64, 52, 0.4)" }}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--coffee-accent)" }}>{product.origin}</p>
        <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2" style={{ color: "var(--coffee-text-primary)" }}>{product.name}</h3>
        <div className="mb-3"><StarRating rating={product.rating} reviews={product.reviews} /></div>
        <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--coffee-text-secondary)" }}>{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>${product.price}</span>
            <span className="text-xs ml-1" style={{ color: "var(--coffee-text-secondary)" }}>/ {product.weight}</span>
          </div>
          <button onClick={handleAdd} disabled={!product.in_stock} className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide flex items-center gap-2 transition-all ${added ? "bg-green-600" : "btn-accent"} ${!product.in_stock ? "opacity-50 cursor-not-allowed" : ""}`} id={`add-to-cart-${product.id}`}>
            {added ? (
              <>✓ Added</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductShowcase() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCoffees = async () => {
      const { data, error } = await supabase.from("coffees").select("*").eq("in_stock", true).order("created_at", { ascending: true });
      if (data) setCoffees(data as Coffee[]);
      setLoading(false);
    };
    fetchCoffees();
  }, []);

  return (
    <section id="products" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>Our Collection</p>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: "var(--coffee-text-primary)" }}>Curated Coffees</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--coffee-text-secondary)" }}>Each origin tells a story. Each roast unlocks a new chapter. Discover your perfect cup from our hand-selected collection.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56" style={{ backgroundColor: "var(--coffee-bg-secondary)" }} />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--coffee-border)" }} />
                  <div className="h-5 w-40 rounded" style={{ backgroundColor: "var(--coffee-border)" }} />
                  <div className="h-3 w-32 rounded" style={{ backgroundColor: "var(--coffee-border)" }} />
                  <div className="h-10 w-full rounded" style={{ backgroundColor: "var(--coffee-border)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {coffees.map((coffee, index) => (
              <ProductCard key={coffee.id} product={coffee} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
