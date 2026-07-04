import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { orderService } from '@/services/orderService';

export async function POST(request) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const rawBody = await request.text();

    if (!signature || !timestamp) {
      console.warn('⚠️ [webhook]: Missing verification headers.');
      return NextResponse.json({ error: 'Missing verification headers' }, { status: 400 });
    }

    const secretKey = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_CLIENT_SECRET;
    if (!secretKey) {
      console.warn('⚠️ [webhook]: Cashfree keys/secrets not configured on server.');
      return NextResponse.json({ error: 'Server payment configurations missing' }, { status: 500 });
    }

    // Verify Cashfree Webhook Signature: computed using HMAC SHA256 of (timestamp + rawBody)
    const payloadToSign = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadToSign)
      .digest('base64');

    if (computedSignature !== signature) {
      console.error('❌ [webhook]: Signature verification failed.');
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
    }

    // Parse verified payload
    const event = JSON.parse(rawBody);
    console.log(`🔔 [webhook]: Received verified Cashfree event: ${event.type}`);

    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = event.data?.order?.order_id;
      const cfPaymentId = event.data?.payment?.cf_payment_id;

      if (!orderId) {
        return NextResponse.json({ error: 'Missing order_id in webhook data' }, { status: 400 });
      }

      console.log(`✅ [webhook]: Updating payment status to paid for order ${orderId} (Payment ID: ${cfPaymentId})`);
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentProvider: 'Cashfree',
        paymentId: cfPaymentId ? String(cfPaymentId) : `cf_webhook_${Date.now()}`,
        paymentOrderId: orderId
      });

      // Auto-trigger Shiprocket shipment creation (handled gracefully so failures do not crash the webhook listener)
      try {
        const { shippingService } = await import('@/services/shipping/shippingService');
        await shippingService.createShipment(orderId);
      } catch (shipErr) {
        console.error('⚠️ [webhook]: Auto shipment creation failed:', shipErr.message);
      }
    }

    return NextResponse.json({ status: 'OK' }, { status: 200 });

  } catch (error) {
    console.error('❌ [webhook] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
