# Walkthrough - Product Reviews & Ratings System

This document outlines the changes implemented to establish a production-ready, multi-vendor **Product Reviews & Ratings System** integrated with Supabase storage, authentication context, seller reply triggers, and administrative moderation control.

---

## 1. Accomplished Changes

### 1.1 Database Architecture (`scratch/reviews_migration.sql`)
- **Product Metadata**: Added `average_rating` (numeric) and `review_count` (int) cache columns to `public.products`.
- **Customer Flags**: Added `banned_from_reviews` (boolean) to `public.customers` to enable administrative restriction toggles.
- **Review Ledger**: Created `public.reviews` for ratings (1-5★), titles, descriptions, and verified purchase identifiers.
- **Support Tables**:
  - `public.review_images` for holding multi-image uploads (0-5 images).
  - `public.review_helpful` for counting user helpful votes.
  - `public.seller_replies` for store responses.
  - `public.review_reports` for flagging abusive content.
- **DB Triggers**:
  - `trg_update_product_ratings` to automatically recompute and update a product's cached `average_rating` and `review_count` upon review creation, modification, or deletion.
  - `trg_update_review_helpful_count` to maintain accurate helpful tally counts on reviews.
- **Database Functions & RPCs**:
  - `check_customer_review_eligibility(p_product_id, p_customer_id)`: Verifies login state, duplication checks, user ban records, and checks purchase status to dynamically determine the `is_verified` label.
  - `get_product_review_stats(p_product_id)`: Fetches aggregations for 1★ through 5★ ratings in a single query.
- **Row-Level Security (RLS)**: Enforced granular security policies validating permissions across Customers (write/delete own), Sellers (reply to reviews for their store's products), and Admins (full moderation capability).

### 1.2 Database Service Layer (`services/reviewService.js`)
- Encompasses structured CRUD methods executing Supabase queries:
  - Image uploads using automatic bucket creation in Supabase Storage (`review-images`).
  - Paginated storefront review retrieval with filters (`Verified Purchases Only`) and sort keys (`Newest`, `Highest Rating`, `Lowest Rating`, `Most Helpful`).
  - Helpful vote toggles, reporting submissions, inline reply insertions, and admin review/image/user restrictions.

### 1.3 Storefront Catalog (`components/ProductCard.js`)
- Modified to dynamically compute and display star rating elements (`⭐⭐⭐⭐☆ 4.6 (128)`) from DB fields.

### 1.4 Product Detail Integration (`app/store/[slug]/product/[idOrSlug]/ProductClient.js`)
- **Header Rating**: Renders reactive stars and review counts.
- **Tab Layout**: Restructured specifications, shipping details, and return policies in a tabbed panel.
- **Reviews Section**:
  - Interactive distribution list with progress bars showing rating percentages.
  - Verification Eligibility container informing users of eligibility state: displays `"✔ You are logged in as a verified buyer! Your review will have a verified purchase badge."` if they purchased it, or `"✔ You are logged in! Write a review to share your thoughts."` for general customer log-ins.
  - Review Form supporting rating selector, optional title, text descriptions, and a 0-5 image upload area with thumbnail deletion options.
  - Paginated reviews feed with sorting dropdowns, helpful counts, reports, seller replies, and edit/delete permissions.
  - Click-to-expand image lightbox overlay.

### 1.5 Seller Dashboard (`app/dashboard/reviews/page.js`)
- Displays overall rating stats, score metrics, lowest rated items, and most active products.
- Provides a feedback list supporting inline replies and delete actions.
- Added sidebar navigation linking to `/dashboard/reviews`.

### 1.6 Admin Moderation Panel (`app/admin/(dashboard)/reviews/page.js`)
- Created a platform moderation panel displaying report reasons (Spam, Fake Review, Offensive Language, Wrong Product).
- Enables actions: **Dismiss Report**, **Delete/Hide Review**, **Remove Images Only**, and **Ban User from Reviews**.
- Added sidebar navigation linking to `/admin/reviews`.

---

## 2. Verification Plan

### 2.1 Automated Compilation Checks
To ensure there are no compilation, import, or bundler syntax errors:
- Run `npm run build` to verify the codebase builds.

### 2.2 Manual Workflow Verification

#### Scenario A: Customer Storefront Reviews Flow
1. **Navigate to a Product Page**:
   - Log in as a customer.
   - Go to a product page that you *have not* purchased.
   - *Result*: The review block shows: `"✔ You are logged in! Write a review to share your thoughts."` and unlocks the review form.
2. **Verify Verified Purchase state**:
   - Go to a product page that you *have* purchased and has been delivered.
   - *Result*: The review block shows: `"✔ You are logged in as a verified buyer! Your review will have a verified purchase badge."`
3. **Submit a Review**:
   - Click `"Write a Product Review"`. Select `5 ★`, write a title, description, and upload 1-2 test images.
   - Click `Submit Review`.
   - *Result*: The form closes. The average rating and progress bar adjust immediately. The new review shows at the top of the feed with a `✔ Verified Purchase` badge (if purchased) or as a regular review (if not purchased).
4. **Interact with Review**:
   - Click the image thumbnails to view the lightbox zoom.
   - Click `👍 Helpful (0)` to see it count up to `(1)`.
   - Click `Edit` to update rating or description, or `Delete` to remove it (average rating updates immediately).

#### Scenario B: Seller Dashboard Replies Flow
1. **Log in as the Vendor / Store Owner**:
   - Go to the Seller Dashboard at `/dashboard/reviews`.
   - *Result*: The page loads metrics showing average store ratings, rating distributions, and product lists.
2. **Reply to Customer Review**:
   - Locate the review submitted in Scenario A.
   - Click `Reply to Review`, write a response, and click `Post Reply`.
   - *Result*: The response displays inline underneath the customer review.
   - Go back to the storefront product detail page and check the review feed.
   - *Result*: The seller reply displays nested with a `Seller Response` badge.

#### Scenario C: Admin Moderation Flow
1. **Report a Review**:
   - Log in as a separate customer.
   - Go to the product page, locate the review, and click `🚩 Report Abuse`.
   - Select `Offensive language` and type reporter details.
   - *Result*: The report registers.
2. **Moderate from Admin Dashboard**:
   - Log in as an Administrator and go to `/admin/reviews`.
   - *Result*: The reports counter displays counts for Spam/Offensive flags, and shows the reported review.
3. **Admin Actions**:
   - Click `Remove Images Only` to clear offensive images while keeping text.
   - Click `Ban User from Reviews`.
   - *Result*: The user is banned, and the user's status updates.
   - Log back in as the banned customer and try to review another purchased product.
   - *Result*: The system blocks the user with the eligibility message: `Your account is banned from posting reviews.`
