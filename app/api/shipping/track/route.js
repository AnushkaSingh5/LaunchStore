// app/api/shipping/track/route.js
import { NextResponse } from 'next/server';
import { shippingFactory } from '@/services/shipping/shippingFactory';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const waybill = searchParams.get('waybill');

    if (!waybill) {
      return NextResponse.json({ success: false, message: 'Missing required waybill parameter.' }, { status: 400 });
    }

    const providerName = process.env.NEXT_PUBLIC_ACTIVE_SHIPPING_PROVIDER || 'Delhivery';
    const provider = shippingFactory.getProvider(providerName);
    
    console.log(`🔍 [api/shipping/track]: Querying tracking details for waybill ${waybill}...`);
    const trackingInfo = await provider.getTrackingStatus(waybill);
    
    return NextResponse.json({
      success: true,
      tracking: trackingInfo
    });
  } catch (error) {
    console.error('❌ [api/shipping/track] Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
