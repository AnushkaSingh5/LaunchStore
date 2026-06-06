-- Safe Migration to fix RLS Policies for Categories and Products
-- Run this in your Supabase SQL Editor to ensure creator and admin RLS permissions are correct.

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies to avoid conflicts
DO $$
BEGIN
  -- Categories policies cleanup
  DROP POLICY IF EXISTS "Allow public read of categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow creator inserts of categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow creator updates of own categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow creator deletes of own categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow admin inserts of categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow admin updates of all categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow admin deletes of all categories" ON public.categories;

  -- Products policies cleanup
  DROP POLICY IF EXISTS "Allow public read of products" ON public.products;
  DROP POLICY IF EXISTS "Allow creator inserts of products" ON public.products;
  DROP POLICY IF EXISTS "Allow creator updates of own products" ON public.products;
  DROP POLICY IF EXISTS "Allow creator deletes of own products" ON public.products;
  DROP POLICY IF EXISTS "Allow admin inserts of products" ON public.products;
  DROP POLICY IF EXISTS "Allow admin updates of all products" ON public.products;
  DROP POLICY IF EXISTS "Allow admin deletes of all products" ON public.products;
END
$$;

-- =======================================================
-- 1. CATEGORIES RLS POLICIES
-- =======================================================
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

CREATE POLICY "Allow admin inserts of categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin updates of all categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all categories" ON public.categories FOR DELETE USING (public.is_admin());

-- =======================================================
-- 2. PRODUCTS RLS POLICIES
-- =======================================================
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

CREATE POLICY "Allow admin inserts of products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin updates of all products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin deletes of all products" ON public.products FOR DELETE USING (public.is_admin());
