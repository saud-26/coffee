"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import type { Coffee } from "@/lib/types";

export default function ProductBuyButton({ coffee }: { coffee: Coffee }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      onClick={() => {
        addItem({ ...coffee, price: Number(coffee.price) });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="btn-accent px-6 py-3 rounded-full text-sm font-semibold"
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
