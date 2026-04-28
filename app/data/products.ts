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
    id: "ethiopian-yirgacheffe",
    name: "Ethiopian Yirgacheffe",
    origin: "Yirgacheffe, Ethiopia",
    description:
      "Bright, fruity, and floral with notes of jasmine, bergamot, and sun-dried blueberry. A crown jewel of African coffee.",
    price: 24.99,
    rating: 4.9,
    reviews: 342,
    roast: "Light",
    weight: "340g",
    tags: ["Single Origin", "Washed"],
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "colombian-supremo",
    name: "Colombian Supremo",
    origin: "Huila, Colombia",
    description:
      "Rich caramel sweetness with bright citrus acidity and a smooth, velvety finish. The quintessential specialty coffee.",
    price: 21.99,
    rating: 4.8,
    reviews: 289,
    roast: "Medium",
    weight: "340g",
    tags: ["Single Origin", "Natural"],
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "sumatra-mandheling",
    name: "Sumatra Mandheling",
    origin: "North Sumatra, Indonesia",
    description:
      "Earthy, full-bodied, and complex with deep chocolate undertones, cedar, and a lingering smoky sweetness.",
    price: 23.49,
    rating: 4.7,
    reviews: 198,
    roast: "Dark",
    weight: "340g",
    tags: ["Single Origin", "Wet-Hulled"],
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "guatemala-antigua",
    name: "Guatemala Antigua",
    origin: "Antigua, Guatemala",
    description:
      "Spicy complexity with bittersweet chocolate, toasted almond, and a vibrant tangerine acidity that excites the palate.",
    price: 22.99,
    rating: 4.8,
    reviews: 256,
    roast: "Medium-Dark",
    weight: "340g",
    tags: ["Single Origin", "Volcanic Soil"],
    image: "https://images.unsplash.com/photo-1497933321027-94483753822c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "kenya-aa",
    name: "Kenya AA",
    origin: "Nyeri, Kenya",
    description:
      "Intensely bright with blackcurrant, grapefruit, and tomato notes. A bold, wine-like coffee for the adventurous.",
    price: 26.99,
    rating: 4.9,
    reviews: 174,
    roast: "Light",
    weight: "250g",
    tags: ["Single Origin", "Double Washed"],
    badge: "Award Winner",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d744264?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "brazil-santos",
    name: "Brazil Santos",
    origin: "Minas Gerais, Brazil",
    description:
      "Smooth, low-acid cup with nutty sweetness, milk chocolate, and a gentle graham cracker finish. Everyday elegance.",
    price: 19.99,
    rating: 4.6,
    reviews: 412,
    roast: "Medium",
    weight: "340g",
    tags: ["Single Origin", "Pulped Natural"],
    image: "https://images.unsplash.com/photo-1442551389117-04c51d9d2d5d?auto=format&fit=crop&q=80&w=800",
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
