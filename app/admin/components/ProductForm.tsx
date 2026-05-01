"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Coffee } from "@/lib/types";
import { getCoffeeImageByName } from "@/lib/coffee-config";

interface ProductFormProps {
  initialData?: Partial<Coffee>;
  isEditing?: boolean;
}

type ProductFlag = "is_best_seller" | "is_new_arrival" | "is_featured";
type ProductRoast = Coffee["roast"];

const productFlags: Array<[ProductFlag, string]> = [
  ["is_best_seller", "Best Seller"],
  ["is_new_arrival", "New Arrival"],
  ["is_featured", "Featured"],
];

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: Number(initialData?.price ?? 0),
    origin: initialData?.origin || "",
    roast: initialData?.roast || "Medium",
    weight: initialData?.weight || "340g",
    tags: initialData?.tags?.join(", ") || "",
    badge: initialData?.badge || "",
    in_stock: initialData?.in_stock ?? true,
    grind_options: initialData?.grind_options?.join(", ") || "Whole Bean, Espresso, French Press, Pour Over",
    is_best_seller: initialData?.is_best_seller ?? false,
    is_new_arrival: initialData?.is_new_arrival ?? false,
    is_featured: initialData?.is_featured ?? false,
    date_added: initialData?.date_added?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    thumbnail_url: initialData?.thumbnail_url || "",
  });

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      thumbnail_url: prev.thumbnail_url || getCoffeeImageByName(name),
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("coffee-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("coffee-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid numeric price.");
      setLoading(false);
      return;
    }

    const dataToSave = {
      ...formData,
      price: Number(price.toFixed(2)),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      grind_options: formData.grind_options.split(",").map(t => t.trim()).filter(Boolean),
    };

    try {
      const endpoint = isEditing && initialData?.id ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEditing && initialData?.id ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Failed to save product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save product.");
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all";
  const inputStyle = { backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" };
  const labelClass = "block text-xs uppercase tracking-wider font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Name</label>
            <input required type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Price (₹)</label>
            <input required type="number" step="0.01" min={0} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Description</label>
          <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Origin</label>
            <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Roast</label>
            <select value={formData.roast} onChange={e => setFormData({...formData, roast: e.target.value as ProductRoast})} className={inputClass} style={inputStyle}>
              <option value="Light">Light</option>
              <option value="Medium">Medium</option>
              <option value="Medium-Dark">Medium-Dark</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Weight</label>
            <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className={inputClass} style={inputStyle} placeholder="340g" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Tags (comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className={inputClass} style={inputStyle} placeholder="Single Origin, Washed" />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Badge (optional)</label>
            <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className={inputClass} style={inputStyle} placeholder="Best Seller" />
          </div>
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Grind Options</label>
          <input type="text" value={formData.grind_options} onChange={e => setFormData({...formData, grind_options: e.target.value})} className={inputClass} style={inputStyle} placeholder="Whole Bean, Espresso, French Press" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {productFlags.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={e => setFormData({...formData, [key]: e.target.checked})}
                className="w-4 h-4"
                style={{ accentColor: "var(--coffee-accent)" }}
              />
              <span className="text-sm" style={{ color: "var(--coffee-text-primary)" }}>{label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Date Added</label>
          <input type="date" value={formData.date_added} onChange={e => setFormData({...formData, date_added: e.target.value})} className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Image URL</label>
          <input
            type="url"
            value={formData.thumbnail_url}
            onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
            className={inputClass}
            style={inputStyle}
            placeholder="https://images.unsplash.com/..."
          />
          <p className="text-xs mt-2" style={{ color: "var(--coffee-text-secondary)" }}>
            You can paste a public image URL (recommended for Unsplash CDN).
          </p>
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Or upload image file</label>
          <div className="flex items-center gap-4">
            {formData.thumbnail_url && (
              <img src={formData.thumbnail_url} alt="Thumbnail preview" className="w-20 h-20 object-cover rounded-xl border" style={{ borderColor: "var(--coffee-border)" }} />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="w-full text-sm"
                style={{ color: "var(--coffee-text-secondary)" }}
              />
              {uploading && <p className="text-xs mt-2" style={{ color: "var(--coffee-accent)" }}>Uploading image...</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="in_stock" 
            checked={formData.in_stock} 
            onChange={e => setFormData({...formData, in_stock: e.target.checked})} 
            className="w-4 h-4 rounded" 
            style={{ accentColor: "var(--coffee-accent)" }}
          />
          <label htmlFor="in_stock" className="text-sm font-medium" style={{ color: "var(--coffee-text-primary)" }}>In Stock</label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-sm font-semibold uppercase" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", color: "var(--coffee-text-primary)" }}>
          Cancel
        </button>
        <button type="submit" disabled={loading || uploading} className="btn-accent btn-shimmer px-8 py-3 rounded-xl text-sm font-semibold uppercase disabled:opacity-50">
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
