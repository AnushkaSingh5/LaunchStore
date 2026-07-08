import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { orderId, amount, customerInfo, provider } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderId and amount are required.' },
        { status: 400 }
      );
    }

    if (supabaseClient) {
      const { data: dbOrder, error: dbErr } = await supabaseClient
        .from('orders')
        .select('store:store_id(status)')
        .eq('id', orderId)
        .single();
      
      if (dbErr) {
        console.error('Failed to query order details in payment API:', dbErr);
      } else if (dbOrder?.store?.status !== 'approved') {
        return NextResponse.json(
          { error: 'This store is currently under admin review and is not available for orders.' },
          { status: 400 }
        );
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If API keys are missing, return a Mock order for local development/sandboxing
    if (!keyId || !keySecret) {
      console.log('ℹ️ [create-order]: Razorpay keys not configured. Generating a Mock Payment Order.');
      return NextResponse.json({
        id: `rzp_mock_order_${Date.now()}`,
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        mock: true
      });
    }

    // Call actual Razorpay Orders API via fetch REST request
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          systemOrderId: orderId,
          customerName: customerInfo?.name || '',
          customerEmail: customerInfo?.email || ''
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay API error: ${response.status} - ${errText}`);
    }

    const razorpayOrder = await response.json();
    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      mock: false
    });

  } catch (error) {
    console.error('❌ [create-order] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
