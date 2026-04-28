"use client";

import ProductForm from "../../components/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/products" className="text-xs hover:text-[var(--coffee-accent)] transition-colors mb-2 inline-block" style={{ color: "var(--coffee-text-secondary)" }}>
          ← Back to Products
        </Link>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>Add New Product</h1>
      </div>
      
      <ProductForm />
    </div>
  );
}
