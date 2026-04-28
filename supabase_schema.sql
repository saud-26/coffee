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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'brewing', 'out_for_delivery', 'delivered', 'cancelled')),
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
('Ethiopian Yirgacheffe', 'Bright, fruity, and floral with notes of jasmine, bergamot, and sun-dried blueberry. A crown jewel of African coffee.', 24.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800', 'Yirgacheffe, Ethiopia', 'Light', '340g', 4.9, 342, ARRAY['Single Origin', 'Washed'], 'Best Seller'),
('Colombian Supremo', 'Rich caramel sweetness with bright citrus acidity and a smooth, velvety finish. The quintessential specialty coffee.', 21.99, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', 'Huila, Colombia', 'Medium', '340g', 4.8, 289, ARRAY['Single Origin', 'Natural'], ''),
('Sumatra Mandheling', 'Earthy, full-bodied, and complex with deep chocolate undertones, cedar, and a lingering smoky sweetness.', 23.49, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', 'North Sumatra, Indonesia', 'Dark', '340g', 4.7, 198, ARRAY['Single Origin', 'Wet-Hulled'], 'New Arrival'),
('Guatemala Antigua', 'Spicy complexity with bittersweet chocolate, toasted almond, and a vibrant tangerine acidity that excites the palate.', 22.99, 'https://images.unsplash.com/photo-1497933321027-94483753822c?auto=format&fit=crop&q=80&w=800', 'Antigua, Guatemala', 'Medium-Dark', '340g', 4.8, 256, ARRAY['Single Origin', 'Volcanic Soil'], ''),
('Kenya AA', 'Intensely bright with blackcurrant, grapefruit, and tomato notes. A bold, wine-like coffee for the adventurous.', 26.99, 'https://images.unsplash.com/photo-1521017432531-fbd92d744264?auto=format&fit=crop&q=80&w=800', 'Nyeri, Kenya', 'Light', '250g', 4.9, 174, ARRAY['Single Origin', 'Double Washed'], 'Award Winner'),
('Brazil Santos', 'Smooth, low-acid cup with nutty sweetness, milk chocolate, and a gentle graham cracker finish. Everyday elegance.', 19.99, 'https://images.unsplash.com/photo-1442551389117-04c51d9d2d5d?auto=format&fit=crop&q=80&w=800', 'Minas Gerais, Brazil', 'Medium', '340g', 4.6, 412, ARRAY['Single Origin', 'Pulped Natural'], '');

-- ==========================================
-- SET ADMIN USER (run AFTER admin signs up)
-- ==========================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'khansaood@rmc.edu.in';
