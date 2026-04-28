export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "admin";
  avatar_url: string;
  created_at: string;
}

export interface Coffee {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  origin: string;
  roast: "Light" | "Medium" | "Medium-Dark" | "Dark";
  weight: string;
  rating: number;
  reviews: number;
  tags: string[];
  badge: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "brewing" | "out_for_delivery" | "delivered" | "cancelled";
  total_price: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_phone: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  coffee_id: string | null;
  coffee_name: string;
  coffee_price: number;
  quantity: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface CartItem {
  coffee: Coffee;
  quantity: number;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}
