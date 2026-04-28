"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "../../components/ProductForm";
import Link from "next/link";
import type { Coffee } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCoffee = async () => {
      if (params.id) {
        const { data } = await supabase
          .from("coffees")
          .select("*")
          .eq("id", params.id)
          .single();
        
        if (data) setCoffee(data as Coffee);
      }
      setLoading(false);
    };

    fetchCoffee();
  }, [params.id]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/products" className="text-xs hover:text-[var(--coffee-accent)] transition-colors mb-2 inline-block" style={{ color: "var(--coffee-text-secondary)" }}>
          ← Back to Products
        </Link>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>Edit Product</h1>
      </div>
      
      {loading ? (
        <div className="glass-card rounded-2xl h-96 animate-pulse" />
      ) : coffee ? (
        <ProductForm initialData={coffee} isEditing={true} />
      ) : (
        <div className="text-center py-12" style={{ color: "var(--coffee-text-secondary)" }}>
          Product not found.
        </div>
      )}
    </div>
  );
}
