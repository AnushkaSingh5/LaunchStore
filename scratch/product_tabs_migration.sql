-- Migration to add Product Tabs (Specifications, Shipping, Returns) fields to products table

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spec_dimensions TEXT DEFAULT 'Standard size';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spec_material TEXT DEFAULT 'Premium sustainably sourced materials';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spec_finish TEXT DEFAULT 'Satin matte protective coating';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spec_warranty TEXT DEFAULT '2 Year Manufacturer Warranty';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spec_origin TEXT DEFAULT 'Designed & Crafted locally';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_details TEXT DEFAULT 'Secure & Swift Logistics

All orders are processed and handed over to standard premium courier networks within 24 hours of confirmation.

- Standard Shipping: Delivered in 3-5 business days. Free for this product.
- Express Shipping: Delivered in 1-2 business days (if selected at checkout).
- Transit Safety: Fully insured shipments with custom packaging to prevent breakages.';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT '7-Day Return & Replacement Policy

We stand behind the craftsmanship of our products. If you are not completely satisfied, we offer a hassle-free return window.

- Items must be returned in their original packaging and unused condition.
- Refunds are processed to the original payment source within 3-5 days after warehouse validation.
- In case of manufacturing defects, contact our support with unboxing images for instant replacements.';
