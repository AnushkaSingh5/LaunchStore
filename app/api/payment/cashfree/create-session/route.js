import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';

export async function POST(request) {
  try {
    const { orderId, amount, customerInfo, slug } = await request.json();

    if (!orderId || !amount || !customerInfo || !customerInfo.email) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderId, amount, and customer email are required.' },
        { status: 400 }
      );
    }

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    console.log('🔑 [create-session] Current env check:');
    console.log('   - CASHFREE_CLIENT_ID:', clientId ? `${clientId.slice(0, 4)}... (length: ${clientId.length})` : 'undefined / not loaded');
    console.log('   - CASHFREE_CLIENT_SECRET:', clientSecret ? `${clientSecret.slice(0, 4)}... (length: ${clientSecret.length})` : 'undefined / not loaded');
    console.log('   - NEXT_PUBLIC_ACTIVE_PAYMENT_PROVIDER:', process.env.NEXT_PUBLIC_ACTIVE_PAYMENT_PROVIDER);

    // If API credentials are not configured, generate a Mock session for local development
    if (!clientId || !clientSecret) {
      console.log('ℹ️ [create-session]: Cashfree credentials not configured. Generating a Mock Payment Session.');
      return NextResponse.json({
        id: `cf_mock_order_${Date.now()}`,
        payment_session_id: `cf_mock_session_${Date.now()}`,
        mock: true
      });
    }

    // Configure Cashfree SDK
    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? Cashfree.PRODUCTION 
      : Cashfree.SANDBOX;

    const cashfree = new Cashfree(environment, clientId, clientSecret);

    // Build return redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const storeSlug = slug || 'store1';
    const returnUrl = `${baseUrl}/api/payment/cashfree/verify?order_id={order_id}&slug=${storeSlug}`;

    console.log(`🔄 [create-session]: Creating Cashfree order for system order ID: ${orderId}, amount: ${amount}, return_url: ${returnUrl}`);

    const requestPayload = {
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: customerInfo.id || `cust_${Date.now()}`,
        customer_phone: customerInfo.phone ? customerInfo.phone.trim() : '9999999999',
        customer_email: customerInfo.email
      },
      order_meta: {
        return_url: returnUrl
      }
    };

    const response = await cashfree.PGCreateOrder(requestPayload);
    const responseData = response.data;

    return NextResponse.json({
      id: responseData.order_id,
      payment_session_id: responseData.payment_session_id,
      mock: false
    });

  } catch (error) {
    console.error('❌ [create-session] Exception details:', error.message);
    if (error.response && error.response.data) {
      console.error('   - Cashfree API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return NextResponse.json(
      { error: error.response?.data?.message || error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
