import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { orderService } from '@/services/orderService';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('⚠️ [Webhook]: Webhook signature mismatch.');
        return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
      }
    } else {
      console.log('ℹ️ [Webhook]: Processing webhook without signature verification (no secret or signature header).');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`📦 [Webhook]: Received payment gateway event: ${event}`);

    // Extract order info
    const payment = payload.payload?.payment?.entity;
    const orderId = payment?.notes?.systemOrderId;
    const gatewayPaymentId = payment?.id;
    const gatewayOrderId = payment?.order_id;

    if (!orderId) {
      console.warn('⚠️ [Webhook]: Missing notes.systemOrderId in payload.');
      return NextResponse.json({ status: 'ignored', reason: 'No systemOrderId found' });
    }

    if (event === 'order.paid' || event === 'payment.captured') {
      console.log(`✅ [Webhook]: Payment captured for order: ${orderId}`);
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'Paid',
        paymentId: gatewayPaymentId,
        paymentOrderId: gatewayOrderId,
        status: 'Confirmed'
      });
    } else if (event === 'payment.failed') {
      console.log(`❌ [Webhook]: Payment failed for order: ${orderId}`);
      await orderService.updateOrderPayment(orderId, {
        paymentStatus: 'Failed',
        paymentId: gatewayPaymentId,
        paymentOrderId: gatewayOrderId,
        status: 'Pending'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [Webhook] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
