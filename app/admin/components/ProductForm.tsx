"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Coffee } from "@/lib/types";

interface ProductFormProps {
  initialData?: Partial<Coffee>;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    origin: initialData?.origin || "",
    roast: initialData?.roast || "Medium",
    weight: initialData?.weight || "340g",
    tags: initialData?.tags?.join(", ") || "",
    badge: initialData?.badge || "",
    in_stock: initialData?.in_stock ?? true,
    thumbnail_url: initialData?.thumbnail_url || "",
  });

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
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
    };

    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from("coffees")
          .update(dataToSave)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("coffees")
          .insert([dataToSave]);
        if (error) throw error;
      }
      
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
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
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Price ($)</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className={inputClass} style={inputStyle} />
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
            <select value={formData.roast} onChange={e => setFormData({...formData, roast: e.target.value as any})} className={inputClass} style={inputStyle}>
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
          <label className={labelClass} style={{ color: "var(--coffee-text-secondary)" }}>Image</label>
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
