-- ==========================================
-- PRODUCT REVIEWS & RATINGS MIGRATION
-- ==========================================

-- Clean up temporary test table
DROP TABLE IF EXISTS public.test_injection_table;

-- 1. Alter products table to support cached average rating and review counts
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- 2. Alter customers table to support review ban status
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS banned_from_reviews BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Create public.reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  description TEXT NOT NULL CHECK (char_length(description) <= 1000),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (product_id, customer_id)
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create public.review_images table
CREATE TABLE IF NOT EXISTS public.review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for review_images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

-- 5. Create public.review_helpful table
CREATE TABLE IF NOT EXISTS public.review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (review_id, customer_id)
);

-- Enable RLS for review_helpful
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- 6. Create public.seller_replies table
CREATE TABLE IF NOT EXISTS public.seller_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE UNIQUE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for seller_replies
ALTER TABLE public.seller_replies ENABLE ROW LEVEL SECURITY;

-- 7. Create public.review_reports table
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles_base(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('Spam', 'Fake review', 'Offensive language', 'Wrong product')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for review_reports
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Reviews policies
DROP POLICY IF EXISTS "Allow public read of active reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow customer insert of own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow customer update of own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow customer delete of own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin all on reviews" ON public.reviews;

CREATE POLICY "Allow public read of active reviews" ON public.reviews
  FOR SELECT USING (NOT is_deleted OR public.is_admin());

CREATE POLICY "Allow customer insert of own reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
    AND NOT is_deleted
    AND NOT EXISTS (SELECT 1 FROM public.customers WHERE auth_id = auth.uid() AND banned_from_reviews = TRUE)
  );

CREATE POLICY "Allow customer update of own reviews" ON public.reviews
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM public.customers WHERE auth_id = auth.uid() AND banned_from_reviews = TRUE)
  ) WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Allow customer delete of own reviews" ON public.reviews
  FOR DELETE USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Allow admin all on reviews" ON public.reviews
  FOR ALL USING (public.is_admin());


-- Review Images policies
DROP POLICY IF EXISTS "Allow public read of review images" ON public.review_images;
DROP POLICY IF EXISTS "Allow customer insert of review images" ON public.review_images;
DROP POLICY IF EXISTS "Allow customer delete of own review images" ON public.review_images;
DROP POLICY IF EXISTS "Allow admin all on review images" ON public.review_images;

CREATE POLICY "Allow public read of review images" ON public.review_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow customer insert of review images" ON public.review_images
  FOR INSERT WITH CHECK (
    review_id IN (
      SELECT id FROM public.reviews 
      WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Allow customer delete of own review images" ON public.review_images
  FOR DELETE USING (
    review_id IN (
      SELECT id FROM public.reviews 
      WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Allow admin all on review images" ON public.review_images
  FOR ALL USING (public.is_admin());


-- Review Helpful policies
DROP POLICY IF EXISTS "Allow public read of helpful votes" ON public.review_helpful;
DROP POLICY IF EXISTS "Allow customer insert of own helpful votes" ON public.review_helpful;
DROP POLICY IF EXISTS "Allow customer delete of own helpful votes" ON public.review_helpful;
DROP POLICY IF EXISTS "Allow admin all on review helpful" ON public.review_helpful;

CREATE POLICY "Allow public read of helpful votes" ON public.review_helpful
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow customer insert of own helpful votes" ON public.review_helpful
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Allow customer delete of own helpful votes" ON public.review_helpful
  FOR DELETE USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Allow admin all on review helpful" ON public.review_helpful
  FOR ALL USING (public.is_admin());


-- Seller Replies policies
DROP POLICY IF EXISTS "Allow public read of replies" ON public.seller_replies;
DROP POLICY IF EXISTS "Allow seller insert of own store replies" ON public.seller_replies;
DROP POLICY IF EXISTS "Allow seller update of own store replies" ON public.seller_replies;
DROP POLICY IF EXISTS "Allow seller delete of own store replies" ON public.seller_replies;
DROP POLICY IF EXISTS "Allow admin all on replies" ON public.seller_replies;

CREATE POLICY "Allow public read of replies" ON public.seller_replies
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow seller insert of own store replies" ON public.seller_replies
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid())
  );

CREATE POLICY "Allow seller update of own store replies" ON public.seller_replies
  FOR UPDATE USING (
    store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid())
  ) WITH CHECK (
    store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid())
  );

CREATE POLICY "Allow seller delete of own store replies" ON public.seller_replies
  FOR DELETE USING (
    store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid())
  );

CREATE POLICY "Allow admin all on replies" ON public.seller_replies
  FOR ALL USING (public.is_admin());


-- Review Reports policies
DROP POLICY IF EXISTS "Allow admin all on reports" ON public.review_reports;
DROP POLICY IF EXISTS "Allow customer insert of reports" ON public.review_reports;

CREATE POLICY "Allow admin all on reports" ON public.review_reports
  FOR ALL USING (public.is_admin());

CREATE POLICY "Allow customer insert of reports" ON public.review_reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid()
  );


-- ==========================================
-- DATABASE TRIGGERS
-- ==========================================

-- Trigger to automatically update product average rating and review counts
CREATE OR REPLACE FUNCTION public.update_product_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_avg_rating NUMERIC(3, 2);
  v_count INTEGER;
BEGIN
  -- Determine product ID to update
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  -- Calculate new average rating and review count (only for active, non-soft-deleted reviews)
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
    COUNT(id)
  INTO 
    v_avg_rating,
    v_count
  FROM public.reviews
  WHERE product_id = v_product_id AND is_deleted = FALSE;

  -- Update products table
  UPDATE public.products
  SET 
    average_rating = v_avg_rating,
    review_count = v_count
  WHERE id = v_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_product_ratings ON public.reviews;
CREATE TRIGGER trg_update_product_ratings
AFTER INSERT OR UPDATE OF rating, is_deleted OR DELETE
ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_ratings();


-- Trigger to automatically update review helpful counts
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_review_helpful_count ON public.review_helpful;
CREATE TRIGGER trg_update_review_helpful_count
AFTER INSERT OR DELETE ON public.review_helpful
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();


-- ==========================================
-- SECURE STORED PROCEDURES (RPCs)
-- ==========================================

-- RPC to aggregate reviews stats (counts and distribution)
CREATE OR REPLACE FUNCTION public.get_product_review_stats(p_product_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'average_rating', COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
    'review_count', COUNT(id),
    'stars_1', COUNT(CASE WHEN rating = 1 THEN 1 END),
    'stars_2', COUNT(CASE WHEN rating = 2 THEN 1 END),
    'stars_3', COUNT(CASE WHEN rating = 3 THEN 1 END),
    'stars_4', COUNT(CASE WHEN rating = 4 THEN 1 END),
    'stars_5', COUNT(CASE WHEN rating = 5 THEN 1 END)
  ) INTO v_result
  FROM public.reviews
  WHERE product_id = p_product_id AND is_deleted = FALSE;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to verify customer eligibility to write a review
CREATE OR REPLACE FUNCTION public.check_customer_review_eligibility(p_product_id UUID, p_customer_id UUID)
RETURNS JSON AS $$
DECLARE
  v_purchased BOOLEAN := FALSE;
  v_already_reviewed BOOLEAN := FALSE;
  v_banned BOOLEAN := FALSE;
BEGIN
  -- 1. Check if user is banned from reviews
  SELECT banned_from_reviews INTO v_banned
  FROM public.customers
  WHERE id = p_customer_id;
  
  IF v_banned THEN
    RETURN json_build_object('can_review', FALSE, 'is_verified', FALSE, 'reason', 'Your account has been banned from posting reviews.');
  END IF;

  -- 2. Check if user has already reviewed this product
  SELECT EXISTS (
    SELECT 1 FROM public.reviews
    WHERE product_id = p_product_id AND customer_id = p_customer_id AND is_deleted = FALSE
  ) INTO v_already_reviewed;

  IF v_already_reviewed THEN
    RETURN json_build_object('can_review', FALSE, 'is_verified', FALSE, 'reason', 'You have already reviewed this product. You can edit your existing review.');
  END IF;

  -- 3. Check if user has purchased the product and order status is Delivered/Completed
  SELECT EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.customer_id = p_customer_id 
      AND oi.product_id = p_product_id
      AND (
        o.status IN ('Completed', 'Delivered', 'completed', 'delivered')
        OR o.shipping_status IN ('Delivered', 'delivered')
      )
  ) INTO v_purchased;

  -- Anyone signed in as a customer can review. is_verified is TRUE if they purchased it.
  RETURN json_build_object('can_review', TRUE, 'is_verified', v_purchased, 'reason', 'Eligible');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
