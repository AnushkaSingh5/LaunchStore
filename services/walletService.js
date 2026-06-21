import { supabaseClient } from '@/lib/supabase';
import { payoutService } from './payoutService';

let forceMockMode = false;

// Mock transactions in memory
let mockTransactions = [];

const seedMockTransactions = (creatorId) => {
  if (mockTransactions.length > 0) return;
  const cid = creatorId || 'mock-creator-uid';
  
  // Sale credit 1 (10 days ago)
  mockTransactions.push({
    id: 'tx-mock-1',
    creator_id: cid,
    type: 'Sale Credit',
    amount: 1500.00,
    status: 'completed',
    reference_id: 'ORD-MOCK-9001',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Sale credit 2 (8 days ago)
  mockTransactions.push({
    id: 'tx-mock-2',
    creator_id: cid,
    type: 'Sale Credit',
    amount: 2500.00,
    status: 'completed',
    reference_id: 'ORD-MOCK-9002',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Payout request completed (5 days ago)
  mockTransactions.push({
    id: 'tx-mock-3',
    creator_id: cid,
    type: 'Payout Completed',
    amount: -1000.00,
    status: 'completed',
    reference_id: 'req-mock-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Sale credit 3 (2 days ago)
  mockTransactions.push({
    id: 'tx-mock-4',
    creator_id: cid,
    type: 'Sale Credit',
    amount: 1200.00,
    status: 'completed',
    reference_id: 'ORD-MOCK-9003',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Payout request pending (1 day ago)
  mockTransactions.push({
    id: 'tx-mock-5',
    creator_id: cid,
    type: 'Payout Request',
    amount: -500.00,
    status: 'pending',
    reference_id: 'req-mock-2',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  });
};

export const walletService = {
  _getMockTransactions: () => mockTransactions,
  _setForceMockMode: (val) => { forceMockMode = val; },

  getWalletOverview: async (creatorId, storeId) => {
    // 1. Fetch creator earnings summary (Total, Pending, Available)
    const earningsSummary = await payoutService.getCreatorEarningsSummary(creatorId, storeId);

    // 2. Fetch payout history to compute total payouts
    const payoutRequests = await payoutService.getPayoutRequests(creatorId);
    const totalPayouts = payoutRequests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    return {
      totalEarnings: earningsSummary.totalEarnings,
      pendingEarnings: earningsSummary.pendingEarnings,
      availableBalance: earningsSummary.availableEarnings,
      totalPayouts: totalPayouts
    };
  },

  getWalletTransactions: async (creatorId) => {
    if (!supabaseClient || forceMockMode) {
      seedMockTransactions(creatorId);
      // Synchronize in-memory changes from mock payoutRequests or mockEarnings
      // If a new payout was created, it won't be in mockTransactions yet
      const currentPayouts = payoutService._getMockPayoutRequests().filter(r => r.creator_id === creatorId);
      currentPayouts.forEach(p => {
        const exists = mockTransactions.some(t => t.reference_id === p.id);
        if (!exists) {
          mockTransactions.push({
            id: `tx-mock-${p.id}`,
            creator_id: creatorId,
            type: p.status === 'completed' ? 'Payout Completed' : 'Payout Request',
            amount: -parseFloat(p.amount),
            status: p.status,
            reference_id: p.id,
            created_at: p.requested_at
          });
        } else {
          // Sync status
          const idx = mockTransactions.findIndex(t => t.reference_id === p.id);
          if (idx !== -1) {
            mockTransactions[idx].status = p.status;
            mockTransactions[idx].type = p.status === 'completed' ? 'Payout Completed' : 'Payout Request';
          }
        }
      });

      // Same for earnings
      const currentEarnings = payoutService._getMockEarnings().filter(e => e.creator_id === creatorId);
      currentEarnings.forEach(e => {
        const exists = mockTransactions.some(t => t.reference_id === e.order_id);
        if (!exists) {
          mockTransactions.push({
            id: `tx-mock-${e.id}`,
            creator_id: creatorId,
            type: 'Sale Credit',
            amount: parseFloat(e.creator_amount),
            status: 'completed',
            reference_id: e.order_id,
            created_at: e.created_at
          });
        }
      });

      return mockTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    try {
      const { data, error } = await supabaseClient
        .from('wallet_transactions')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return walletService.getWalletTransactions(creatorId);
        }
        throw error;
      }

      return (data || []).map(t => ({
        id: t.id,
        creator_id: t.creator_id,
        type: t.type,
        amount: parseFloat(t.amount),
        status: t.status,
        reference_id: t.reference_id,
        created_at: t.created_at
      }));
    } catch (e) {
      console.error('Error fetching wallet transactions:', e);
      return [];
    }
  }
};

export default walletService;
