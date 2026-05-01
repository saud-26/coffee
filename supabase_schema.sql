-- ==========================================
-- BREW & CO. SUPABASE SCHEMA + MIGRATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- HELPERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ==========================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'customer',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- COFFEES TABLE (Products)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT DEFAULT '',
  origin TEXT DEFAULT '',
  roast TEXT DEFAULT 'Medium',
  weight TEXT DEFAULT '340g',
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  badge TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coffees
  ADD COLUMN IF NOT EXISTS grind_options TEXT[] DEFAULT ARRAY['Whole Bean', 'Espresso', 'French Press', 'Pour Over'],
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS date_added TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.coffees
  DROP CONSTRAINT IF EXISTS coffees_roast_check;
ALTER TABLE public.coffees
  ADD CONSTRAINT coffees_roast_check CHECK (roast IN ('Light', 'Medium', 'Medium-Dark', 'Dark'));

DROP TRIGGER IF EXISTS set_coffees_updated_at ON public.coffees;
CREATE TRIGGER set_coffees_updated_at
  BEFORE UPDATE ON public.coffees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- ORDERS + TIMELINE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'payment_pending_verification',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_name TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city TEXT DEFAULT '',
  shipping_zip TEXT DEFAULT '',
  shipping_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_verification',
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS carrier_name TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check,
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

UPDATE public.orders
SET status = CASE
  WHEN status = 'pending' THEN 'confirmed'
  WHEN status IN ('processing', 'brewing') THEN 'roasting'
  WHEN status IN ('shipped', 'out_for_delivery') THEN 'out_for_delivery'
  WHEN status IN (
    'payment_pending_verification',
    'confirmed',
    'roasting',
    'packed',
    'delivered',
    'cancelled'
  ) THEN status
  ELSE 'confirmed'
END;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'payment_pending_verification',
      'confirmed',
      'roasting',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )
  ),
  ADD CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN (
      'pending_verification',
      'verified',
      'failed',
      'refunded',
      'not_required'
    )
  );

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  coffee_id UUID REFERENCES public.coffees(id) ON DELETE SET NULL,
  coffee_name TEXT NOT NULL,
  coffee_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_status_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT
);

ALTER TABLE public.order_status_events
  DROP CONSTRAINT IF EXISTS order_status_events_status_check;
ALTER TABLE public.order_status_events
  ADD CONSTRAINT order_status_events_status_check CHECK (
    status IN (
      'payment_pending_verification',
      'confirmed',
      'roasting',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )
  );

CREATE INDEX IF NOT EXISTS order_status_events_order_id_idx
  ON public.order_status_events(order_id, occurred_at);

INSERT INTO public.order_status_events (order_id, status, occurred_at, changed_by, note)
SELECT o.id, o.status, COALESCE(o.created_at, NOW()), o.user_id, 'Initial order status'
FROM public.orders o
WHERE NOT EXISTS (
  SELECT 1
  FROM public.order_status_events e
  WHERE e.order_id = o.id
);

-- ==========================================
-- SHOP ENTITIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gift_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gift_set_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_set_id UUID REFERENCES public.gift_sets(id) ON DELETE CASCADE NOT NULL,
  coffee_id UUID REFERENCES public.coffees(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cadence TEXT DEFAULT 'monthly',
  bag_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_cadence_check;
ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_cadence_check CHECK (cadence IN ('weekly', 'biweekly', 'monthly'));

CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

ALTER TABLE public.customer_subscriptions
  DROP CONSTRAINT IF EXISTS customer_subscriptions_status_check;
ALTER TABLE public.customer_subscriptions
  ADD CONSTRAINT customer_subscriptions_status_check CHECK (status IN ('active', 'paused', 'cancelled'));

DROP TRIGGER IF EXISTS set_gift_sets_updated_at ON public.gift_sets;
CREATE TRIGGER set_gift_sets_updated_at
  BEFORE UPDATE ON public.gift_sets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER set_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- CONTENT + SUPPORT ENTITIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  year_label TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.process_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  step_number INTEGER DEFAULT 1,
  image_url TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sustainability_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.careers_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT DEFAULT '',
  employment_type TEXT DEFAULT '',
  description_html TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.press_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  outlet TEXT DEFAULT '',
  published_at DATE DEFAULT CURRENT_DATE,
  url TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer_html TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  rate NUMERIC(10,2) DEFAULT 0,
  estimated_days TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_submissions
  DROP CONSTRAINT IF EXISTS contact_submissions_status_check;
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_status_check CHECK (status IN ('new', 'in_review', 'resolved'));

DROP TRIGGER IF EXISTS set_site_pages_updated_at ON public.site_pages;
CREATE TRIGGER set_site_pages_updated_at
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Coffees
DROP POLICY IF EXISTS "Anyone can view coffees" ON public.coffees;
DROP POLICY IF EXISTS "Admins can insert coffees" ON public.coffees;
DROP POLICY IF EXISTS "Admins can update coffees" ON public.coffees;
DROP POLICY IF EXISTS "Admins can delete coffees" ON public.coffees;
CREATE POLICY "Anyone can view coffees" ON public.coffees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert coffees" ON public.coffees FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update coffees" ON public.coffees FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete coffees" ON public.coffees FOR DELETE USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- Order Status Events
DROP POLICY IF EXISTS "Users can view own order status events" ON public.order_status_events;
DROP POLICY IF EXISTS "Users can insert initial order status events" ON public.order_status_events;
DROP POLICY IF EXISTS "Admins can view all order status events" ON public.order_status_events;
DROP POLICY IF EXISTS "Admins can insert order status events" ON public.order_status_events;
CREATE POLICY "Users can view own order status events" ON public.order_status_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert initial order status events" ON public.order_status_events FOR INSERT WITH CHECK (
  status = 'payment_pending_verification'
  AND EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order status events" ON public.order_status_events FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert order status events" ON public.order_status_events FOR INSERT WITH CHECK (public.is_admin());

-- Public-read/admin-write shop and CMS tables
DROP POLICY IF EXISTS "Anyone can view active gift sets" ON public.gift_sets;
DROP POLICY IF EXISTS "Admins can manage gift sets" ON public.gift_sets;
CREATE POLICY "Anyone can view active gift sets" ON public.gift_sets FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage gift sets" ON public.gift_sets FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view gift set items" ON public.gift_set_items;
DROP POLICY IF EXISTS "Admins can manage gift set items" ON public.gift_set_items;
CREATE POLICY "Anyone can view gift set items" ON public.gift_set_items FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.gift_sets WHERE id = gift_set_id AND is_active = TRUE) OR public.is_admin()
);
CREATE POLICY "Admins can manage gift set items" ON public.gift_set_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.customer_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.customer_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.customer_subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.customer_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.customer_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.customer_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.customer_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.customer_subscriptions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view published site pages" ON public.site_pages;
DROP POLICY IF EXISTS "Admins can manage site pages" ON public.site_pages;
CREATE POLICY "Anyone can view published site pages" ON public.site_pages FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage site pages" ON public.site_pages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view timeline entries" ON public.timeline_entries;
DROP POLICY IF EXISTS "Admins can manage timeline entries" ON public.timeline_entries;
CREATE POLICY "Anyone can view timeline entries" ON public.timeline_entries FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage timeline entries" ON public.timeline_entries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view process steps" ON public.process_steps;
DROP POLICY IF EXISTS "Admins can manage process steps" ON public.process_steps;
CREATE POLICY "Anyone can view process steps" ON public.process_steps FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage process steps" ON public.process_steps FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view sustainability metrics" ON public.sustainability_metrics;
DROP POLICY IF EXISTS "Admins can manage sustainability metrics" ON public.sustainability_metrics;
CREATE POLICY "Anyone can view sustainability metrics" ON public.sustainability_metrics FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage sustainability metrics" ON public.sustainability_metrics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view careers jobs" ON public.careers_jobs;
DROP POLICY IF EXISTS "Admins can manage careers jobs" ON public.careers_jobs;
CREATE POLICY "Anyone can view careers jobs" ON public.careers_jobs FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage careers jobs" ON public.careers_jobs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view press entries" ON public.press_entries;
DROP POLICY IF EXISTS "Admins can manage press entries" ON public.press_entries;
CREATE POLICY "Anyone can view press entries" ON public.press_entries FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage press entries" ON public.press_entries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view faq items" ON public.faq_items;
DROP POLICY IF EXISTS "Admins can manage faq items" ON public.faq_items;
CREATE POLICY "Anyone can view faq items" ON public.faq_items FOR SELECT TO anon, authenticated USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage faq items" ON public.faq_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view shipping rates" ON public.shipping_rates;
DROP POLICY IF EXISTS "Admins can manage shipping rates" ON public.shipping_rates;
CREATE POLICY "Anyone can view shipping rates" ON public.shipping_rates FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage shipping rates" ON public.shipping_rates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==========================================
-- SEED DATA
-- ==========================================
INSERT INTO public.coffees (
  name, description, price, thumbnail_url, origin, roast, weight, rating, reviews, tags, badge,
  grind_options, is_best_seller, is_new_arrival, is_featured, date_added
)
SELECT
  'Espresso',
  'A rich, concentrated shot with velvety crema and deep cocoa notes. Perfect for a bold wake-up.',
  149,
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800',
  'Chikmagalur, India',
  'Dark',
  '60ml',
  4.9,
  502,
  ARRAY['Classic', 'Strong'],
  'Best Seller',
  ARRAY['Whole Bean', 'Espresso'],
  TRUE,
  FALSE,
  TRUE,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.coffees WHERE name = 'Espresso');

INSERT INTO public.coffees (
  name, description, price, thumbnail_url, origin, roast, weight, rating, reviews, tags, badge,
  grind_options, is_best_seller, is_new_arrival, is_featured, date_added
)
SELECT
  'Cappuccino',
  'Smooth espresso balanced with steamed milk and thick foam for a creamy, comforting sip.',
  199,
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
  'Coorg, India',
  'Medium',
  '220ml',
  4.8,
  438,
  ARRAY['Creamy', 'Cafe Favorite'],
  '',
  ARRAY['Whole Bean', 'Espresso'],
  TRUE,
  FALSE,
  TRUE,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.coffees WHERE name = 'Cappuccino');

INSERT INTO public.coffees (
  name, description, price, thumbnail_url, origin, roast, weight, rating, reviews, tags, badge,
  grind_options, is_best_seller, is_new_arrival, is_featured, date_added
)
SELECT
  'Latte',
  'Silky steamed milk and espresso with a mellow flavor profile and naturally sweet finish.',
  219,
  'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800',
  'Araku Valley, India',
  'Medium',
  '250ml',
  4.7,
  376,
  ARRAY['Smooth', 'Everyday'],
  'New Arrival',
  ARRAY['Whole Bean', 'Espresso', 'Pour Over'],
  FALSE,
  TRUE,
  TRUE,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.coffees WHERE name = 'Latte');

INSERT INTO public.coffees (
  name, description, price, thumbnail_url, origin, roast, weight, rating, reviews, tags, badge,
  grind_options, is_best_seller, is_new_arrival, is_featured, date_added
)
SELECT
  'Cold Brew',
  'Slow-steeped over 16 hours for low acidity, chocolate undertones, and a crisp finish over ice.',
  249,
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
  'Bababudangiri, India',
  'Medium-Dark',
  '300ml',
  4.9,
  291,
  ARRAY['Chilled', 'Refreshing'],
  '',
  ARRAY['French Press', 'Cold Brew'],
  FALSE,
  TRUE,
  FALSE,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.coffees WHERE name = 'Cold Brew');

INSERT INTO public.gift_sets (name, slug, description, price, thumbnail_url, sort_order)
SELECT
  'Signature Discovery Set',
  'signature-discovery-set',
  'A tasting set of our best-loved roasts with brew notes and pairing cards.',
  599,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
  1
WHERE NOT EXISTS (SELECT 1 FROM public.gift_sets WHERE slug = 'signature-discovery-set');

INSERT INTO public.subscription_plans (name, slug, description, price, cadence, bag_count, sort_order)
SELECT
  'Roaster Choice Monthly',
  'roaster-choice-monthly',
  'One rotating bag selected by our roasting team each month.',
  499,
  'monthly',
  1,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE slug = 'roaster-choice-monthly');

INSERT INTO public.site_pages (slug, title, body_html, meta_title, meta_description)
SELECT
  'returns',
  'Returns',
  '<p>If your coffee arrives damaged or incorrect, contact us within 7 days and we will make it right.</p>',
  'Returns | Brew & Co.',
  'Returns and replacement policy for Brew & Co. orders.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_pages WHERE slug = 'returns');

INSERT INTO public.faq_items (question, answer_html, category, sort_order)
SELECT
  'When is coffee roasted?',
  '<p>Most orders are roasted in small batches after payment verification.</p>',
  'Orders',
  1
WHERE NOT EXISTS (SELECT 1 FROM public.faq_items WHERE question = 'When is coffee roasted?');

INSERT INTO public.shipping_rates (region, min_order_value, rate, estimated_days, sort_order)
SELECT
  'India',
  0,
  0,
  '3-6 business days',
  1
WHERE NOT EXISTS (SELECT 1 FROM public.shipping_rates WHERE region = 'India');

-- SET ADMIN USER (run AFTER admin signs up)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'khansaood@rmc.edu.in';
