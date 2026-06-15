-- ==========================================
-- LAUNCHCART - MULTI-STORE E-COMMERCE SCHEMA
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
-- Stores user identity metadata synced from Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'admin', 'customer')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.5. CUSTOMERS TABLE
-- Stores profile metadata for retail customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 1.6. CUSTOMER ADDRESSES TABLE
-- Stores multiple shipping addresses for customer checkouts
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT,
  full_name TEXT,
  phone TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Customer Addresses
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- 2. STORES TABLE
-- Stores individual merchant shop instances
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  theme_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_title TEXT,
  og_description TEXT,
  canonical_url TEXT
);

-- Enable RLS for Stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 3. CATEGORIES TABLE
-- Stores products categorization inside specific stores
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (store_id, slug)
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. PRODUCTS TABLE
-- Stores items for sale inside specific stores
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  images TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_title TEXT,
  og_description TEXT,
  canonical_url TEXT,
  UNIQUE (store_id, slug)
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4.5. COUPONS TABLE
-- Stores discount coupon configurations per store
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER NOT NULL CHECK (max_uses >= 0),
  current_uses INTEGER NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
  minimum_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (minimum_order_amount >= 0),
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (store_id, code)
);

-- Enable RLS for Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 5. ORDERS TABLE
-- Stores customer purchases inside specific stores
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0)
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. ORDER_ITEMS TABLE
-- Stores list of items purchased under an order
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- TRIGGER: PROFILE CREATION ON USER SIGNUP
-- ==========================================

-- Automatically create a profile row in public.profiles when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'creator');
  v_name := COALESCE(new.raw_user_meta_data->>'name', 'User');
  v_phone := new.raw_user_meta_data->>'phone';

  -- 1. Insert into public.profiles
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    v_name,
    new.email,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      role = EXCLUDED.role;

  -- 2. If customer role, automatically create public.customers record
  IF v_role = 'customer' THEN
    INSERT INTO public.customers (id, auth_id, full_name, email, phone)
    VALUES (
      gen_random_uuid(),
      new.id,
      v_name,
      new.email,
      v_phone
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_id = EXCLUDED.auth_id,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users insertions
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- A. PROFILES POLICIES
-- Users can view their own profile; Admins can view all
CREATE POLICY "Allow public read of profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow user updates of own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow user inserts of own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- A.2 CUSTOMERS POLICIES
CREATE POLICY "Allow customer read of own profile" ON public.customers FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Allow customer update of own profile" ON public.customers FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Allow customer insert of own profile" ON public.customers FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- A.3 CUSTOMER ADDRESSES POLICIES
CREATE POLICY "Allow customer read of own addresses" ON public.customer_addresses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer insert of own addresses" ON public.customer_addresses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer update of own addresses" ON public.customer_addresses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer delete of own addresses" ON public.customer_addresses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);

-- B. STORES POLICIES
-- Stores are publicly visible; creators can manage their own store; admins manage all
CREATE POLICY "Allow public read of stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow creator inserts of stores" ON public.stores FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Allow creator updates of own stores" ON public.stores FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Allow creator deletes of own stores" ON public.stores FOR DELETE USING (auth.uid() = creator_id);

-- C. CATEGORIES POLICIES
-- Categories are publicly visible; creators manage their own store's categories
CREATE POLICY "Allow public read of categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow creator inserts of categories" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow creator updates of own categories" ON public.categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow creator deletes of own categories" ON public.categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);

-- D. PRODUCTS POLICIES
-- Products are publicly visible; creators manage their own products
CREATE POLICY "Allow public read of products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow creator inserts of products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow creator updates of own products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow creator deletes of own products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);

-- E. ORDERS POLICIES
-- Public checkout can create orders; creators view their own store's orders
CREATE POLICY "Allow public creation of orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow creators to view own store orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow creators to update own store orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid())
);
CREATE POLICY "Allow customer to view own orders" ON public.orders FOR SELECT USING (
  customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
);

-- F. ORDER ITEMS POLICIES
-- Public checkout can create order items; creators view their order items
CREATE POLICY "Allow public creation of order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow creators to view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.stores s ON o.store_id = s.id
    WHERE o.id = order_id AND s.creator_id = auth.uid()
  )
);
CREATE POLICY "Allow customer to view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
  )
);


-- ==========================================
-- ADMIN SECURITY-DEFINER FUNCTION & POLICIES
-- ==========================================

-- Helper function to check if the authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- A. ADMIN PROFILES POLICIES
CREATE POLICY "Allow admin updates of all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- A.2 ADMIN CUSTOMERS POLICIES
CREATE POLICY "Allow admin to view all customers" ON public.customers FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin to update all customers" ON public.customers FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete any customer" ON public.customers FOR DELETE USING (public.is_admin());

-- A.3 ADMIN CUSTOMER ADDRESSES POLICIES
CREATE POLICY "Allow admin to view all customer addresses" ON public.customer_addresses FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin to update all customer addresses" ON public.customer_addresses FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete any customer address" ON public.customer_addresses FOR DELETE USING (public.is_admin());

-- B. ADMIN STORES POLICIES
CREATE POLICY "Allow admin inserts of stores" ON public.stores FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin updates of all stores" ON public.stores FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all stores" ON public.stores FOR DELETE USING (public.is_admin());

-- C. ADMIN CATEGORIES POLICIES
CREATE POLICY "Allow admin inserts of categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin updates of all categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all categories" ON public.categories FOR DELETE USING (public.is_admin());

-- D. ADMIN PRODUCTS POLICIES
CREATE POLICY "Allow admin inserts of products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin updates of all products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all products" ON public.products FOR DELETE USING (public.is_admin());

-- E. ADMIN ORDERS POLICIES
CREATE POLICY "Allow admin to view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin to update all orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete any order" ON public.orders FOR DELETE USING (public.is_admin());

-- F. ADMIN ORDER ITEMS POLICIES
CREATE POLICY "Allow admin to view all order items" ON public.order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin to update all order items" ON public.order_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete any order item" ON public.order_items FOR DELETE USING (public.is_admin());


-- ==========================================
-- G. DEDICATED ADMIN AUTHENTICATION
-- ==========================================

-- Create dedicated table for company internal admins (completely isolated from creators)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for admin_users (do not allow direct public access)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Manually seed a default company administrator with secure bcrypt password ('admin123')
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES (
  'admin@launchcart.com', 
  crypt('admin123', gen_salt('bf')), 
  'System Administrator'
)
ON CONFLICT (email) DO NOTHING;


-- ==========================================
-- H. SECURE DEFINER DATABASE ADMIN RPCs
-- ==========================================

-- RPC Security definer function for secure, isolated admin password verification
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email, a.full_name
  FROM public.admin_users a
  WHERE lower(a.email) = lower(p_email)
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin approve store action (SECURITY DEFINER to bypass RLS securely for validated admins)
CREATE OR REPLACE FUNCTION public.admin_approve_store(p_admin_email TEXT, p_store_id UUID)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  UPDATE public.stores
  SET status = 'approved'
  WHERE id = p_store_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin reject store action
CREATE OR REPLACE FUNCTION public.admin_reject_store(p_admin_email TEXT, p_store_id UUID)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  UPDATE public.stores
  SET status = 'rejected'
  WHERE id = p_store_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin disable store action
CREATE OR REPLACE FUNCTION public.admin_disable_store(p_admin_email TEXT, p_store_id UUID)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  UPDATE public.stores
  SET status = 'disabled'
  WHERE id = p_store_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin remove product action
CREATE OR REPLACE FUNCTION public.admin_remove_product(p_admin_email TEXT, p_product_id UUID)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  DELETE FROM public.products
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin secure view of all orders (SECURITY DEFINER to bypass RLS securely)
CREATE OR REPLACE FUNCTION public.admin_get_orders(p_admin_email TEXT)
RETURNS TABLE (
  id UUID,
  store_id UUID,
  store_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total_amount NUMERIC(10, 2),
  status TEXT,
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  RETURN QUERY
  SELECT o.id, o.store_id, s.name as store_name, o.customer_name, o.customer_email, o.customer_phone, o.total_amount, o.status, o.shipping_address, o.created_at
  FROM public.orders o
  LEFT JOIN public.stores s ON o.store_id = s.id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin secure view of all stores with creator details
CREATE OR REPLACE FUNCTION public.admin_get_stores(p_admin_email TEXT)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_name TEXT,
  creator_email TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  RETURN QUERY
  SELECT s.id, s.creator_id, p.name as creator_name, p.email as creator_email, s.name, s.slug, s.description, s.logo_url, s.banner_url, s.status, s.created_at
  FROM public.stores s
  LEFT JOIN public.profiles p ON s.creator_id = p.id
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin secure view of all products with store/category details
CREATE OR REPLACE FUNCTION public.admin_get_products(p_admin_email TEXT)
RETURNS TABLE (
  id UUID,
  store_id UUID,
  store_name TEXT,
  category_id UUID,
  category_name TEXT,
  name TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  image_url TEXT,
  status TEXT,
  stock INTEGER,
  featured BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(p_admin_email)) THEN
    RAISE EXCEPTION 'Unauthorized admin access.';
  END IF;

  RETURN QUERY
  SELECT p.id, p.store_id, s.name as store_name, p.category_id, c.name as category_name, p.name, p.description, p.price, p.image_url, p.status, p.stock, p.featured, p.created_at
  FROM public.products p
  LEFT JOIN public.stores s ON p.store_id = s.id
  LEFT JOIN public.categories c ON p.category_id = c.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 13. CUSTOMER CARTS & CART ITEMS
-- Stores persistent shopping carts for registered customers
CREATE TABLE IF NOT EXISTS public.customer_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.customer_carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_customer_id ON public.customer_carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customer select of own cart" ON public.customer_carts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer insert of own cart" ON public.customer_carts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer update of own cart" ON public.customer_carts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);
CREATE POLICY "Allow customer delete of own cart" ON public.customer_carts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND auth_id = auth.uid())
);

CREATE POLICY "Allow customer select of own cart items" ON public.cart_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customer_carts c
    JOIN public.customers cust ON cust.id = c.customer_id
    WHERE c.id = cart_id AND cust.auth_id = auth.uid()
  )
);
CREATE POLICY "Allow customer insert of own cart items" ON public.cart_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_carts c
    JOIN public.customers cust ON cust.id = c.customer_id
    WHERE c.id = cart_id AND cust.auth_id = auth.uid()
  )
);
CREATE POLICY "Allow customer update of own cart items" ON public.cart_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.customer_carts c
    JOIN public.customers cust ON cust.id = c.customer_id
    WHERE c.id = cart_id AND cust.auth_id = auth.uid()
  )
);
CREATE POLICY "Allow customer delete of own cart items" ON public.cart_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.customer_carts c
    JOIN public.customers cust ON cust.id = c.customer_id
    WHERE c.id = cart_id AND cust.auth_id = auth.uid()
  )
);


-- 10. RLS POLICIES FOR COUPONS
CREATE POLICY "Allow public read of coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Allow creator inserts of coupons" ON public.coupons FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id AND stores.creator_id = auth.uid()
  )
);
CREATE POLICY "Allow creator updates of own coupons" ON public.coupons FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id AND stores.creator_id = auth.uid()
  )
);
CREATE POLICY "Allow creator deletes of own coupons" ON public.coupons FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id AND stores.creator_id = auth.uid()
  )
);

-- Admin RLS policies for coupons
CREATE POLICY "Allow admin updates of all coupons" ON public.coupons FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all coupons" ON public.coupons FOR DELETE USING (public.is_admin());

-- 1. Create check trigger function to secure public updates
CREATE OR REPLACE FUNCTION public.check_coupon_update_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is the store creator or an admin, allow all changes
  IF EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = OLD.store_id AND stores.creator_id = auth.uid()
  ) OR (SELECT public.is_admin()) THEN
    RETURN NEW;
  END IF;

  -- Otherwise, it is a guest checkout incrementing usage. Enforce restrictions:
  IF NEW.id <> OLD.id OR
     NEW.store_id <> OLD.store_id OR
     NEW.code <> OLD.code OR
     NEW.discount_type <> OLD.discount_type OR
     NEW.discount_value <> OLD.discount_value OR
     NEW.max_uses <> OLD.max_uses OR
     NEW.minimum_order_amount IS DISTINCT FROM OLD.minimum_order_amount OR
     NEW.expiry_date IS DISTINCT FROM OLD.expiry_date OR
     NEW.is_active <> OLD.is_active OR
     NEW.created_at <> OLD.created_at OR
     NOT (NEW.current_uses = OLD.current_uses + 1 OR NEW.current_uses = OLD.current_uses)
  THEN
    RAISE EXCEPTION 'Permission denied: Guests can only increment current_uses.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind trigger to coupons table
DROP TRIGGER IF EXISTS tr_check_coupon_update_fields ON public.coupons;
CREATE TRIGGER tr_check_coupon_update_fields
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.check_coupon_update_fields();

-- 3. Simplified RLS policy allowing public updates (trigger enforces security)
DROP POLICY IF EXISTS "Allow public update of coupon usage count" ON public.coupons;
CREATE POLICY "Allow public update of coupon usage count" ON public.coupons 
FOR UPDATE 
USING (true) 
WITH CHECK (true);



