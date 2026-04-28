-- ==========================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- COFFEES TABLE (Products)
-- ==========================================
CREATE TABLE public.coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT DEFAULT '',
  origin TEXT DEFAULT '',
  roast TEXT DEFAULT 'Medium' CHECK (roast IN ('Light', 'Medium', 'Medium-Dark', 'Dark')),
  weight TEXT DEFAULT '340g',
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  badge TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ORDERS TABLE
-- ==========================================
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'payment_pending_verification' CHECK (
    status IN (
      'payment_pending_verification',
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    )
  ),
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_name TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city TEXT DEFAULT '',
  shipping_zip TEXT DEFAULT '',
  shipping_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ORDER ITEMS TABLE
-- ==========================================
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  coffee_id UUID REFERENCES public.coffees(id) ON DELETE SET NULL,
  coffee_name TEXT NOT NULL,
  coffee_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Coffees (public read, admin write)
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view coffees" ON public.coffees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert coffees" ON public.coffees FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update coffees" ON public.coffees FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete coffees" ON public.coffees FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- SEED DATA (Default coffees)
-- ==========================================
INSERT INTO public.coffees (name, description, price, thumbnail_url, origin, roast, weight, rating, reviews, tags, badge) VALUES
('Espresso', 'A rich, concentrated shot with velvety crema and deep cocoa notes. Perfect for a bold wake-up.', 149, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800', 'Chikmagalur, India', 'Dark', '60ml', 4.9, 502, ARRAY['Classic', 'Strong'], 'Best Seller'),
('Cappuccino', 'Smooth espresso balanced with steamed milk and thick foam for a creamy, comforting sip.', 199, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800', 'Coorg, India', 'Medium', '220ml', 4.8, 438, ARRAY['Creamy', 'Cafe Favorite'], ''),
('Latte', 'Silky steamed milk and espresso with a mellow flavor profile and naturally sweet finish.', 219, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800', 'Araku Valley, India', 'Medium', '250ml', 4.7, 376, ARRAY['Smooth', 'Everyday'], 'New Arrival'),
('Cold Brew', 'Slow-steeped over 16 hours for low acidity, chocolate undertones, and a crisp finish over ice.', 249, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800', 'Bababudangiri, India', 'Medium-Dark', '300ml', 4.9, 291, ARRAY['Chilled', 'Refreshing'], ''),
('Americano', 'A clean, aromatic cup that keeps espresso intensity while adding a lighter, longer sip.', 179, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800', 'Wayanad, India', 'Medium', '240ml', 4.6, 322, ARRAY['Balanced', 'Classic'], ''),
('Mocha', 'Espresso with real cocoa and steamed milk, creating a dessert-like cup for chocolate lovers.', 229, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=800', 'Nilgiris, India', 'Medium', '250ml', 4.8, 247, ARRAY['Chocolate', 'Rich'], ''),
('Signature Combo Bundle', 'A curated combo of best-selling coffee favorites for sharing at home or gifting to coffee lovers.', 599, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', 'Brew & Co Roastery', 'Medium-Dark', '6 Cups', 4.9, 160, ARRAY['Combo', 'Bundle'], 'Value Pack');

-- ==========================================
-- SET ADMIN USER (run AFTER admin signs up)
-- ==========================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'khansaood@rmc.edu.in';
