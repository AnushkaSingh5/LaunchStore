-- Create coupons table
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

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for coupons:
-- 1. Anyone can SELECT coupons (to validate on checkout)
-- 2. Creators can manage coupons where store_id belongs to a store they own.
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

-- Add fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0);
