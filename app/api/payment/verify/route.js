import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { paymentDetails, provider } = await request.json();

    if (!paymentDetails) {
      return NextResponse.json({ error: 'Missing paymentDetails' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;

    // Handle mock payment verification
    if (
      (razorpay_order_id && razorpay_order_id.startsWith('rzp_mock_')) ||
      (razorpay_payment_id && razorpay_payment_id.startsWith('pay_mock_'))
    ) {
      console.log('ℹ️ [verify]: Verifying mock payment credentials.');
      return NextResponse.json({ verified: true, mock: true });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.warn('⚠️ [verify]: RAZORPAY_KEY_SECRET is not configured. Rejecting signature verification.');
      return NextResponse.json({ verified: false, error: 'Razorpay keys not configured on server.' }, { status: 500 });
    }

    // Verify HMAC SHA256 Signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    return NextResponse.json({ verified });
  } catch (error) {
    console.error('❌ [verify] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
