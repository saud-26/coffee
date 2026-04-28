export interface Product {
  id: string;
  name: string;
  origin: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  roast: "Light" | "Medium" | "Dark" | "Medium-Dark";
  weight: string;
  tags: string[];
  badge?: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "espresso",
    name: "Espresso",
    origin: "Chikmagalur, India",
    description:
      "A rich, concentrated shot with velvety crema and deep cocoa notes. Perfect for a bold wake-up.",
    price: 149,
    rating: 4.9,
    reviews: 502,
    roast: "Dark",
    weight: "60ml",
    tags: ["Classic", "Strong"],
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    origin: "Coorg, India",
    description:
      "Smooth espresso balanced with steamed milk and thick foam for a creamy, comforting sip.",
    price: 199,
    rating: 4.8,
    reviews: 438,
    roast: "Medium",
    weight: "220ml",
    tags: ["Creamy", "Cafe Favorite"],
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800",
  },
  {
    id: "latte",
    name: "Latte",
    origin: "Araku Valley, India",
    description:
      "Silky steamed milk and espresso with a mellow flavor profile and naturally sweet finish.",
    price: 219,
    rating: 4.7,
    reviews: 376,
    roast: "Medium",
    weight: "250ml",
    tags: ["Smooth", "Everyday"],
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    origin: "Bababudangiri, India",
    description:
      "Slow-steeped over 16 hours for low acidity, chocolate undertones, and a crisp finish over ice.",
    price: 249,
    rating: 4.9,
    reviews: 291,
    roast: "Medium-Dark",
    weight: "300ml",
    tags: ["Chilled", "Refreshing"],
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
  },
  {
    id: "americano",
    name: "Americano",
    origin: "Wayanad, India",
    description:
      "A clean, aromatic cup that keeps espresso intensity while adding a lighter, longer sip.",
    price: 179,
    rating: 4.6,
    reviews: 322,
    roast: "Medium",
    weight: "240ml",
    tags: ["Balanced", "Classic"],
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=800",
  },
  {
    id: "mocha",
    name: "Mocha",
    origin: "Nilgiris, India",
    description:
      "Espresso with real cocoa and steamed milk, creating a dessert-like cup for chocolate lovers.",
    price: 229,
    rating: 4.8,
    reviews: 247,
    roast: "Medium",
    weight: "250ml",
    tags: ["Chocolate", "Rich"],
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=800",
  },
  {
    id: "signature-combo-bundle",
    name: "Signature Combo Bundle",
    origin: "Brew & Co Roastery",
    description:
      "A curated combo of best-selling coffee favorites for sharing at home or gifting to coffee lovers.",
    price: 599,
    rating: 4.9,
    reviews: 160,
    roast: "Medium-Dark",
    weight: "6 Cups",
    tags: ["Combo", "Bundle"],
    badge: "Value Pack",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
  },
];

export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    id: "sourcing",
    title: "Direct Trade Sourcing",
    subtitle: "Farm to Cup",
    description:
      "We travel to origin, forging relationships with farmers who share our obsession with quality. Every bean is traceable to the exact lot.",
    icon: "🌍",
  },
  {
    id: "roasting",
    title: "Precision Roasting",
    subtitle: "Science Meets Craft",
    description:
      "Our master roasters use Loring Smart Roasters with real-time profiling to unlock each bean's unique flavor potential. Roasted in micro-batches weekly.",
    icon: "🔥",
  },
  {
    id: "freshness",
    title: "Peak Freshness",
    subtitle: "Roast-to-Order",
    description:
      "Your coffee is roasted the same day it ships. Nitrogen-flushed valve bags preserve aromatics for up to 60 days of peak freshness.",
    icon: "📦",
  },
  {
    id: "sustainability",
    title: "Carbon Negative",
    subtitle: "Beyond Sustainable",
    description:
      "We offset 150% of our carbon footprint. Compostable packaging, solar-powered roastery, and reforestation programs at every origin we source from.",
    icon: "🌱",
  },
];
