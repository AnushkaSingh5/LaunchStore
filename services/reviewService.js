import { supabaseClient } from '@/lib/supabase';
import { products } from '@/data/mockData';

// Helper to compress images client-side before upload or as base64 fallback
const compressImage = (file, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.FileReader) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress as optimized JPEG at 70% quality
      };
      img.onerror = () => {
        resolve(event.target.result);
      };
    };
    reader.onerror = () => resolve('');
  });
};

export const reviewService = {
  /**
   * Fetch paginated reviews for a specific product
   */
  fetchProductReviews: async (productId, { sortBy = 'Newest', filterVerified = false, page = 1, limit = 5 } = {}) => {
    if (!supabaseClient) {
      // Offline mock fallback
      return [];
    }
    try {
      let query = supabaseClient
        .from('reviews')
        .select(`
          *,
          customer:customer_id(id, full_name, avatar_url),
          review_images(id, image_url),
          seller_replies(*),
          review_helpful(customer_id)
        `)
        .eq('product_id', productId)
        .eq('is_deleted', false);

      if (filterVerified) {
        query = query.eq('is_verified', true);
      }

      // Sort order
      if (sortBy === 'Newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'Highest Rating') {
        query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
      } else if (sortBy === 'Lowest Rating') {
        query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
      } else if (sortBy === 'Most Helpful') {
        query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false });
      }

      // Pagination range
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching product reviews:', e);
      return [];
    }
  },

  /**
   * Fetch aggregate review statistics (average rating, distribution counts)
   */
  fetchProductReviewStats: async (productId) => {
    if (!supabaseClient) {
      return {
        average_rating: 0,
        review_count: 0,
        stars_1: 0,
        stars_2: 0,
        stars_3: 0,
        stars_4: 0,
        stars_5: 0
      };
    }
    try {
      const { data, error } = await supabaseClient
        .rpc('get_product_review_stats', { p_product_id: productId });
      if (error) throw error;
      return data || {
        average_rating: 0,
        review_count: 0,
        stars_1: 0,
        stars_2: 0,
        stars_3: 0,
        stars_4: 0,
        stars_5: 0
      };
    } catch (e) {
      console.error('Error calling get_product_review_stats:', e);
      return {
        average_rating: 0,
        review_count: 0,
        stars_1: 0,
        stars_2: 0,
        stars_3: 0,
        stars_4: 0,
        stars_5: 0
      };
    }
  },

  /**
   * Check if a customer is eligible to write a review for a product
   */
  checkEligibility: async (productId, customerId) => {
    if (!supabaseClient || !customerId) {
      return { canReview: false, reason: 'Please log in to write a review.' };
    }
    try {
      const { data, error } = await supabaseClient
        .rpc('check_customer_review_eligibility', { p_product_id: productId, p_customer_id: customerId });
      if (error) throw error;
      return {
        canReview: data?.can_review ?? false,
        isVerified: data?.is_verified ?? false,
        reason: data?.reason ?? 'Please log in to write a review.'
      };
    } catch (e) {
      console.error('Error calling check_customer_review_eligibility:', e);
      return { canReview: false, reason: 'Error checking eligibility.' };
    }
  },

  /**
   * Upload an image to the review-images storage bucket (with programmatic creation if missing)
   */
  uploadReviewImage: async (file, reviewId) => {
    if (!supabaseClient) {
      return await compressImage(file);
    }
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `${reviewId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    try {
      const { data, error } = await supabaseClient.storage
        .from('review-images')
        .upload(filePath, file, { upsert: true });

      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket_not_found')) {
          console.warn('[LaunchCart - Storage] Bucket "review-images" not found. Attempting to create it...');
          try {
            await supabaseClient.storage.createBucket('review-images', { public: true });
            const { data: retryData, error: retryError } = await supabaseClient.storage
              .from('review-images')
              .upload(filePath, file, { upsert: true });
            
            if (!retryError) {
              const { data: { publicUrl } } = supabaseClient.storage
                .from('review-images')
                .getPublicUrl(filePath);
              return publicUrl;
            }
          } catch (createErr) {
            console.error('[LaunchCart - Storage] Failed to create bucket programmatically:', createErr.message);
          }
        }
        // Fallback to base64 compression if upload fails
        return await compressImage(file);
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('review-images')
        .getPublicUrl(filePath);
      return publicUrl;
    } catch (e) {
      console.error('Error uploading review image:', e);
      return await compressImage(file);
    }
  },

  /**
   * Submit a new product review
   */
  submitReview: async ({ productId, customerId, rating, title, description, images = [] }) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');

    // 1. Verify eligibility first
    const eligibility = await reviewService.checkEligibility(productId, customerId);
    if (!eligibility.canReview) {
      throw new Error(eligibility.reason);
    }

    try {
      // 2. Insert into reviews table (is_verified is determined by purchase history)
      const { data: reviewData, error: reviewErr } = await supabaseClient
        .from('reviews')
        .insert([{
          product_id: productId,
          customer_id: customerId,
          rating,
          title: title || null,
          description,
          is_verified: eligibility.isVerified
        }])
        .select()
        .single();

      if (reviewErr) throw reviewErr;
      const reviewId = reviewData.id;

      // 3. Upload and attach images if provided
      if (images && images.length > 0) {
        const imageUrls = [];
        for (let file of images) {
          if (file) {
            const url = await reviewService.uploadReviewImage(file, reviewId);
            if (url) imageUrls.push(url);
          }
        }

        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map(url => ({
            review_id: reviewId,
            image_url: url
          }));
          const { error: imgErr } = await supabaseClient
            .from('review_images')
            .insert(imageRows);
          if (imgErr) console.error('Error attaching review images:', imgErr);
        }
      }

      return reviewData;
    } catch (e) {
      console.error('Error submitting review:', e);
      throw e;
    }
  },

  /**
   * Edit an existing review
   */
  updateReview: async (reviewId, customerId, { rating, title, description, images = [], remainingImageUrls = [] }) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      // 1. Update review details
      const { data: reviewData, error: reviewErr } = await supabaseClient
        .from('reviews')
        .update({
          rating,
          title: title || null,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('customer_id', customerId)
        .select()
        .single();

      if (reviewErr) throw reviewErr;

      // 2. Manage images: remove all old images not present in remainingImageUrls, then insert new uploads
      const { data: existingImgs, error: fetchErr } = await supabaseClient
        .from('review_images')
        .select('*')
        .eq('review_id', reviewId);

      if (!fetchErr && existingImgs) {
        // Delete records not in remainingImageUrls
        const toDelete = existingImgs.filter(img => !remainingImageUrls.includes(img.image_url));
        if (toDelete.length > 0) {
          const deleteIds = toDelete.map(img => img.id);
          await supabaseClient
            .from('review_images')
            .delete()
            .in('id', deleteIds);
        }
      }

      // 3. Upload and append new images
      if (images && images.length > 0) {
        const imageUrls = [];
        for (let file of images) {
          if (file) {
            const url = await reviewService.uploadReviewImage(file, reviewId);
            if (url) imageUrls.push(url);
          }
        }

        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map(url => ({
            review_id: reviewId,
            image_url: url
          }));
          const { error: imgErr } = await supabaseClient
            .from('review_images')
            .insert(imageRows);
          if (imgErr) console.error('Error attaching new review images:', imgErr);
        }
      }

      return reviewData;
    } catch (e) {
      console.error('Error updating review:', e);
      throw e;
    }
  },

  /**
   * Delete a review (soft delete preferred)
   */
  deleteReview: async (reviewId, customerId = null) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      let query = supabaseClient
        .from('reviews')
        .update({ is_deleted: true })
        .eq('id', reviewId);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error deleting review:', e);
      throw e;
    }
  },

  /**
   * Mark a review as helpful (toggles support)
   */
  toggleHelpful: async (reviewId, customerId, hasAlreadyVoted) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      if (hasAlreadyVoted) {
        // Delete helpful vote
        const { error } = await supabaseClient
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('customer_id', customerId);
        if (error) throw error;
        return { voted: false };
      } else {
        // Add helpful vote
        const { error } = await supabaseClient
          .from('review_helpful')
          .insert([{ review_id: reviewId, customer_id: customerId }]);
        if (error) throw error;
        return { voted: true };
      }
    } catch (e) {
      console.error('Error toggling helpful vote:', e);
      throw e;
    }
  },

  /**
   * Report a review for moderation
   */
  reportReview: async (reviewId, reporterId, reason, details = '') => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      const { data, error } = await supabaseClient
        .from('review_reports')
        .insert([{
          review_id: reviewId,
          reporter_id: reporterId,
          reason,
          details
        }])
        .select();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error reporting review:', e);
      throw e;
    }
  },

  /**
   * Submit a reply to a review (Sellers/Creators)
   */
  submitReply: async (reviewId, storeId, replyText) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      const { data, error } = await supabaseClient
        .from('seller_replies')
        .upsert({
          review_id: reviewId,
          store_id: storeId,
          reply_text: replyText,
          updated_at: new Date().toISOString()
        }, { onConflict: 'review_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error submitting reply:', e);
      throw e;
    }
  },

  /**
   * Delete a seller reply
   */
  deleteReply: async (replyId) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      const { error } = await supabaseClient
        .from('seller_replies')
        .delete()
        .eq('id', replyId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting reply:', e);
      throw e;
    }
  },

  /**
   * Fetch all reviews for a specific store (for Seller Dashboard)
   */
  getSellerReviews: async (storeId) => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select(`
          *,
          product:product_id!inner(id, name, price, store_id),
          customer:customer_id(full_name, email, avatar_url),
          seller_replies(*)
        `)
        .eq('product.store_id', storeId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching seller reviews:', e);
      return [];
    }
  },

  /**
   * Fetch all reported reviews (for Admin Dashboard)
   */
  getAdminReportedReviews: async () => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('review_reports')
        .select(`
          *,
          review:review_id(
            id,
            rating,
            title,
            description,
            is_verified,
            helpful_count,
            created_at,
            product:product_id(id, name, store:store_id(name)),
            customer:customer_id(id, full_name, email, banned_from_reviews),
            review_images(id, image_url)
          ),
          reporter:reporter_id(email, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching admin reported reviews:', e);
      return [];
    }
  },

  /**
   * Moderate a review (Admin action)
   */
  moderateReview: async (reviewId, action, options = {}) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      if (action === 'delete') {
        // Soft delete the review
        const { error } = await supabaseClient
          .from('reviews')
          .update({ is_deleted: true })
          .eq('id', reviewId);
        if (error) throw error;
      } else if (action === 'remove_images') {
        // Delete all images attached to the review
        const { error } = await supabaseClient
          .from('review_images')
          .delete()
          .eq('review_id', reviewId);
        if (error) throw error;
      } else if (action === 'dismiss') {
        // Delete reports for this review
        const { error } = await supabaseClient
          .from('review_reports')
          .delete()
          .eq('review_id', reviewId);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('Error moderating review:', e);
      throw e;
    }
  },

  /**
   * Ban a customer from review capability (Admin action)
   */
  banCustomerFromReviews: async (customerId, isBanned = true) => {
    if (!supabaseClient) throw new Error('Supabase client not initialized.');
    try {
      const { data, error } = await supabaseClient
        .from('customers')
        .update({ banned_from_reviews: isBanned })
        .eq('id', customerId)
        .select();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error banning customer:', e);
      throw e;
    }
  }
};

export default reviewService;
