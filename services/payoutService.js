import { supabaseClient } from '@/lib/supabase';

// In-memory arrays for offline/mock data fallback
let mockCreatorEarnings = [];
let mockPayoutRequests = [];
let forceMockMode = false;

// Helper to seed realistic data for offline testing
const seedMockData = (creatorId, storeId) => {
  if (mockCreatorEarnings.length > 0) return;
  const now = new Date();
  const cid = creatorId || 'mock-creator-uid';
  const sid = storeId || 'mock-store-id';

  // Available Earning 1 (10 days ago)
  const d1 = new Date();
  d1.setDate(now.getDate() - 10);
  mockCreatorEarnings.push({
    id: 'earn-mock-1',
    creator_id: cid,
    store_id: sid,
    order_id: 'ORD-MOCK-9001',
    order_amount: 1500.00,
    platform_fee: 0.00,
    creator_amount: 1500.00,
    status: 'available',
    created_at: d1.toISOString()
  });

  // Available Earning 2 (8 days ago)
  const d2 = new Date();
  d2.setDate(now.getDate() - 8);
  mockCreatorEarnings.push({
    id: 'earn-mock-2',
    creator_id: cid,
    store_id: sid,
    order_id: 'ORD-MOCK-9002',
    order_amount: 2500.00,
    platform_fee: 0.00,
    creator_amount: 2500.00,
    status: 'available',
    created_at: d2.toISOString()
  });

  // Pending Earning 3 (2 days ago)
  const d3 = new Date();
  d3.setDate(now.getDate() - 2);
  mockCreatorEarnings.push({
    id: 'earn-mock-3',
    creator_id: cid,
    store_id: sid,
    order_id: 'ORD-MOCK-9003',
    order_amount: 1200.00,
    platform_fee: 0.00,
    creator_amount: 1200.00,
    status: 'pending',
    created_at: d3.toISOString()
  });

  // Completed Request (5 days ago)
  const r1 = new Date();
  r1.setDate(now.getDate() - 5);
  mockPayoutRequests.push({
    id: 'req-mock-1',
    creator_id: cid,
    amount: 1000.00,
    payout_method: 'UPI',
    account_details: 'creator@upi',
    status: 'completed',
    admin_notes: 'Settled automatically',
    requested_at: r1.toISOString(),
    processed_at: new Date(r1.getTime() + 12 * 60 * 60 * 1000).toISOString()
  });

  // Pending Request (1 day ago)
  const r2 = new Date();
  r2.setDate(now.getDate() - 1);
  mockPayoutRequests.push({
    id: 'req-mock-2',
    creator_id: cid,
    amount: 500.00,
    payout_method: 'Bank Transfer',
    account_details: 'A/C: 9876543210, IFSC: HDFC0000123',
    status: 'pending',
    admin_notes: null,
    requested_at: r2.toISOString(),
    processed_at: null
  });
};

export const payoutService = {
  // Offline-exposed mock array references for testing and order integrations
  _getMockEarnings: () => {
    return mockCreatorEarnings;
  },
  _getMockPayoutRequests: () => {
    return mockPayoutRequests;
  },

  /**
   * Run self-healing updates to transition pending earnings older than 7 days to available.
   */
  selfHealEarningsAge: async (creatorId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoThreshold = sevenDaysAgo.toISOString();

    if (!supabaseClient || forceMockMode) {
      // Mock Age Transition
      seedMockData(creatorId);
      mockCreatorEarnings.forEach(e => {
        if (e.status === 'pending' && new Date(e.created_at) <= sevenDaysAgo) {
          e.status = 'available';
        }
      });
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('creator_earnings')
        .update({ status: 'available' })
        .eq('status', 'pending')
        .lte('created_at', isoThreshold);
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.selfHealEarningsAge(creatorId);
        }
        throw error;
      }
    } catch (e) {
      console.error('Error in selfHealEarningsAge:', e);
    }
  },

  /**
   * Fetch earnings balances: Total, Pending, Available, and Lifetime Order counts.
   */
  getCreatorEarningsSummary: async (creatorId, storeId) => {
    await payoutService.selfHealEarningsAge(creatorId);

    if (!supabaseClient || forceMockMode) {
      seedMockData(creatorId, storeId);
      const creatorErns = mockCreatorEarnings.filter(e => e.creator_id === creatorId);
      const total = creatorErns.reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
      const pending = creatorErns.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
      const available = creatorErns.filter(e => e.status === 'available' || e.status === 'completed').reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
      return {
        totalEarnings: total,
        pendingEarnings: pending,
        availableEarnings: available,
        lifetimeOrders: creatorErns.length
      };
    }

    try {
      const { data, error } = await supabaseClient
        .from('creator_earnings')
        .select('creator_amount, status')
        .eq('creator_id', creatorId);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.getCreatorEarningsSummary(creatorId, storeId);
        }
        throw error;
      }

      const list = data || [];
      const total = list.reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
      const pending = list.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
      const available = list.filter(e => e.status === 'available' || e.status === 'completed').reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);

      return {
        totalEarnings: total,
        pendingEarnings: pending,
        availableEarnings: available,
        lifetimeOrders: list.length
      };
    } catch (e) {
      console.error('Error fetching creator earnings summary:', e);
      return { totalEarnings: 0, pendingEarnings: 0, availableEarnings: 0, lifetimeOrders: 0 };
    }
  },

  /**
   * Fetch detailed list of order earnings.
   */
  getCreatorEarningsList: async (creatorId, storeId) => {
    await payoutService.selfHealEarningsAge(creatorId);

    if (!supabaseClient || forceMockMode) {
      seedMockData(creatorId, storeId);
      return mockCreatorEarnings
        .filter(e => e.creator_id === creatorId)
        .map(e => ({
          id: e.id,
          orderId: e.order_id,
          date: e.created_at.split('T')[0],
          orderAmount: e.order_amount,
          creatorAmount: e.creator_amount,
          status: e.status
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    try {
      const { data, error } = await supabaseClient
        .from('creator_earnings')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.getCreatorEarningsList(creatorId, storeId);
        }
        throw error;
      }
      return (data || []).map(e => ({
        id: e.id,
        orderId: e.order_id,
        date: e.created_at ? e.created_at.split('T')[0] : 'N/A',
        orderAmount: parseFloat(e.order_amount),
        creatorAmount: parseFloat(e.creator_amount),
        status: e.status
      }));
    } catch (e) {
      console.error('Error fetching creator earnings list:', e);
      return [];
    }
  },

  /**
   * Fetch payout requests for a creator.
   */
  getPayoutRequests: async (creatorId) => {
    if (!supabaseClient || forceMockMode) {
      seedMockData(creatorId);
      return mockPayoutRequests
        .filter(r => r.creator_id === creatorId)
        .map(r => ({
          id: r.id,
          amount: r.amount,
          method: r.payout_method,
          accountDetails: r.account_details,
          status: r.status,
          adminNotes: r.admin_notes,
          requestedAt: r.requested_at ? r.requested_at.split('T')[0] : 'N/A',
          processedAt: r.processed_at ? r.processed_at.split('T')[0] : null
        }))
        .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    }

    try {
      const { data, error } = await supabaseClient
        .from('payout_requests')
        .select('*')
        .eq('creator_id', creatorId)
        .order('requested_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.getPayoutRequests(creatorId);
        }
        throw error;
      }
      return (data || []).map(r => ({
        id: r.id,
        amount: parseFloat(r.amount),
        method: r.payout_method,
        accountDetails: r.account_details,
        status: r.status,
        adminNotes: r.admin_notes,
        requestedAt: r.requested_at ? r.requested_at.split('T')[0] : 'N/A',
        processedAt: r.processed_at ? r.processed_at.split('T')[0] : null
      }));
    } catch (e) {
      console.error('Error fetching payout requests:', e);
      return [];
    }
  },

  /**
   * Create a new payout request for a creator, validating available balance.
   */
  createPayoutRequest: async (creatorId, amount, method, accountDetails) => {
    const reqAmount = parseFloat(amount);
    if (isNaN(reqAmount) || reqAmount <= 0) {
      return { success: false, error: 'Invalid payout amount.' };
    }

    // Minimum payout validation
    const minPayout = 500.00;
    if (reqAmount < minPayout) {
      return { success: false, error: `Minimum payout request is ₹${minPayout}.` };
    }

    // Balance check
    const summary = await payoutService.getCreatorEarningsSummary(creatorId);
    if (reqAmount > summary.availableEarnings) {
      return { success: false, error: `Insufficient available balance. You only have ₹${summary.availableEarnings.toLocaleString()} available.` };
    }

    if (!supabaseClient || forceMockMode) {
      const newRequest = {
        id: `req-mock-${Date.now().toString().slice(-6)}`,
        creator_id: creatorId,
        amount: reqAmount,
        payout_method: method,
        account_details: accountDetails,
        status: 'pending',
        admin_notes: null,
        requested_at: new Date().toISOString(),
        processed_at: null
      };
      mockPayoutRequests.push(newRequest);
      return { success: true, request: newRequest };
    }

    try {
      const { data, error } = await supabaseClient
        .from('payout_requests')
        .insert([{
          creator_id: creatorId,
          amount: reqAmount,
          payout_method: method,
          account_details: accountDetails,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.createPayoutRequest(creatorId, amount, method, accountDetails);
        }
        throw error;
      }
      return { success: true, request: data };
    } catch (e) {
      console.error('Error creating payout request:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Fetch all earnings across the platform for admin stats.
   */
  adminGetAllEarnings: async () => {
    if (!supabaseClient || forceMockMode) {
      return mockCreatorEarnings;
    }
    try {
      const { data, error } = await supabaseClient
        .from('creator_earnings')
        .select('*');
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.adminGetAllEarnings();
        }
        throw error;
      }
      return (data || []).map(e => ({
        ...e,
        creator_amount: parseFloat(e.creator_amount || 0)
      }));
    } catch (e) {
      console.error('Error fetching admin earnings:', e);
      return [];
    }
  },

  /**
   * Fetch all payout requests for platform admin moderation.
   */
  adminGetPayoutRequests: async () => {
    if (!supabaseClient || forceMockMode) {
      seedMockData();
      return mockPayoutRequests.map(r => ({
        id: r.id,
        creatorId: r.creator_id,
        creatorName: 'Mock Creator',
        creatorEmail: 'creator@example.com',
        amount: r.amount,
        method: r.payout_method,
        accountDetails: r.account_details,
        status: r.status,
        adminNotes: r.admin_notes,
        requestedAt: r.requested_at ? r.requested_at.split('T')[0] : 'N/A',
        processedAt: r.processed_at ? r.processed_at.split('T')[0] : null
      }));
    }

    try {
      const { data, error } = await supabaseClient
        .from('payout_requests')
        .select('*, creator:creator_id(name, email)')
        .order('requested_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return payoutService.adminGetPayoutRequests();
        }
        throw error;
      }
      return (data || []).map(r => ({
        id: r.id,
        creatorId: r.creator_id,
        creatorName: r.creator?.name || 'Unknown Creator',
        creatorEmail: r.creator?.email || 'N/A',
        amount: parseFloat(r.amount),
        method: r.payout_method,
        accountDetails: r.account_details,
        status: r.status,
        adminNotes: r.admin_notes,
        requestedAt: r.requested_at ? r.requested_at.split('T')[0] : 'N/A',
        processedAt: r.processed_at ? r.processed_at.split('T')[0] : null
      }));
    } catch (e) {
      console.error('Error fetching admin payout requests:', e);
      return [];
    }
  },

  /**
   * Update payout request status (Approved, Rejected, Completed).
   */
  adminUpdatePayoutStatus: async (requestId, status, notes = '') => {
    const adminEmail = 'admin@launchcart.com'; // Admin seeded identifier

    if (!supabaseClient || forceMockMode) {
      const req = mockPayoutRequests.find(r => r.id === requestId);
      if (!req) return { success: false, error: 'Request not found.' };

      req.status = status;
      req.admin_notes = notes;
      req.processed_at = new Date().toISOString();

      // If status is marked completed, consume mock available earnings ledger
      if (status === 'completed') {
        let accumulated = 0.00;
        mockCreatorEarnings
          .filter(e => e.creator_id === req.creator_id && e.status === 'available')
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .forEach(e => {
            if (accumulated < req.amount) {
              e.status = 'paid';
              accumulated += parseFloat(e.creator_amount || 0);
            }
          });
      }
      return { success: true };
    }

    try {
      if (status === 'completed') {
        // Complete via SQL RPC to ensure secure atomic ledger updates
        const { data, error } = await supabaseClient
          .rpc('admin_complete_payout', { p_request_id: requestId, p_admin_email: adminEmail });

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            forceMockMode = true;
            return payoutService.adminUpdatePayoutStatus(requestId, status, notes);
          }
          throw error;
        }
        
        // Also update notes
        if (notes) {
          await supabaseClient
            .from('payout_requests')
            .update({ admin_notes: notes })
            .eq('id', requestId);
        }
        return { success: true };
      } else {
        const { error } = await supabaseClient
          .from('payout_requests')
          .update({
            status,
            admin_notes: notes,
            processed_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            forceMockMode = true;
            return payoutService.adminUpdatePayoutStatus(requestId, status, notes);
          }
          throw error;
        }
        return { success: true };
      }
    } catch (e) {
      console.error('Error updating payout request status:', e);
      return { success: false, error: e.message };
    }
  }
};

export default payoutService;
