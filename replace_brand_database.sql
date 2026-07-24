-- 1. Update stores name, description, and slug
UPDATE public.stores
SET name = REPLACE(name, 'LaunchCart', 'KreateStore'),
    description = REPLACE(description, 'LaunchCart', 'KreateStore'),
    slug = REPLACE(slug, 'launchcart', 'kreatestore');

-- 2. Update sellers name, bio, and business_name
UPDATE public.sellers
SET name = REPLACE(name, 'LaunchCart', 'KreateStore'),
    bio = REPLACE(bio, 'LaunchCart', 'KreateStore'),
    business_name = REPLACE(business_name, 'LaunchCart', 'KreateStore');

-- 3. Update products name and description
UPDATE public.products
SET name = REPLACE(name, 'LaunchCart', 'KreateStore'),
    description = REPLACE(description, 'LaunchCart', 'KreateStore');

-- 4. Update categories name and description
UPDATE public.categories
SET name = REPLACE(name, 'LaunchCart', 'KreateStore'),
    description = REPLACE(description, 'LaunchCart', 'KreateStore');

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
