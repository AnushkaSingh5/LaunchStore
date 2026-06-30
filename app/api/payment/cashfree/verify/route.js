import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { orderService } from '@/services/orderService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  const slug = searchParams.get('slug') || 'store1';

  const envUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = (envUrl && envUrl.trim() !== '') ? envUrl : `${protocol}://${host}`;

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/store/${slug}`);
  }

  try {
    // 1. Handle mock payment redirection verification
    if (orderId.startsWith('cf_mock_order_') || orderId.startsWith('rzp_mock_') || orderId.startsWith('mock_')) {
      console.log(`ℹ️ [verify-redirect]: Processing mock transaction verification for: ${orderId}`);
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentProvider: 'Cashfree',
        paymentId: `cf_pay_mock_${Date.now()}`,
        paymentOrderId: orderId
      });
      return NextResponse.redirect(`${baseUrl}/store/${slug}/checkout/success?orderId=${orderId}`);
    }

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('⚠️ [verify-redirect]: Cashfree credentials missing on server. Treating as failed redirect.');
      return NextResponse.redirect(`${baseUrl}/store/${slug}/checkout/failed?orderId=${orderId}&error=Credentials+missing`);
    }

    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? Cashfree.PRODUCTION 
      : Cashfree.SANDBOX;
    const cashfree = new Cashfree(environment, clientId, clientSecret);

    console.log(`🔄 [verify-redirect]: Fetching order status from Cashfree for ID: ${orderId}`);
    const response = await cashfree.PGFetchOrder(orderId);
    const cfOrder = response.data;

    if (cfOrder && cfOrder.order_status === 'PAID') {
      console.log(`✅ [verify-redirect]: Cashfree order ${orderId} is PAID. Marking confirmed in database.`);
      const transactionId = cfOrder.payment_session_id || `cf_txn_${Date.now()}`;
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentProvider: 'Cashfree',
        paymentId: transactionId,
        paymentOrderId: orderId
      });
      return NextResponse.redirect(`${baseUrl}/store/${slug}/checkout/success?orderId=${orderId}`);
    } else {
      console.log(`❌ [verify-redirect]: Cashfree order ${orderId} status is: ${cfOrder?.order_status || 'UNKNOWN'}. Marking failed.`);
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'failed',
        status: 'awaiting_payment',
        paymentProvider: 'Cashfree'
      });
      return NextResponse.redirect(`${baseUrl}/store/${slug}/checkout/failed?orderId=${orderId}&error=Payment+unconfirmed`);
    }

  } catch (error) {
    console.error('❌ [verify-redirect] Exception details:', error.message);
    if (error.response && error.response.data) {
      console.error('   - Cashfree API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    const errorMsg = error.response?.data?.message || error.message || 'Verification error';
    return NextResponse.redirect(`${baseUrl}/store/${slug}/checkout/failed?orderId=${orderId}&error=${encodeURIComponent(errorMsg)}`);
  }
}
