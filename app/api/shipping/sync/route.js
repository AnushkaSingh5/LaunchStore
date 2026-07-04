// app/api/shipping/sync/route.js
import { NextResponse } from 'next/server';
import { shippingService } from '@/services/shipping/shippingService';

export async function GET(request) {
  const reqUrl = request.url;
  const reqMethod = request.method;
  console.log(`📥 [API Request] URL: ${reqUrl} | Method: ${reqMethod}`);

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      const resData = { success: false, message: 'Missing required order_id parameter.' };
      console.log(`📤 [API Response] Status: 400 | Body:`, JSON.stringify(resData));
      return NextResponse.json(resData, { status: 400 });
    }

    console.log(`🔄 [api/shipping/sync]: Syncing shipping status for Order: ${orderId}`);
    const trackingInfo = await shippingService.syncTrackingStatus(orderId);
    
    const resData = {
      success: true,
      message: 'Shipping status synced successfully',
      ...trackingInfo
    };
    console.log(`📤 [API Response] Status: 200 | Body:`, JSON.stringify(resData));
    return NextResponse.json(resData);
  } catch (error) {
    const err = error || {};
    const errMsg = err.message || (typeof error === 'string' ? error : 'Internal Server Error during tracking sync.');
    const errStack = err.stack || new Error().stack;
    console.error(`❌ [api/shipping/sync]: Failed to sync status. Stack Trace:`, errStack);
    
    const resData = { success: false, message: errMsg };
    console.log(`📤 [API Response] Status: 500 | Body:`, JSON.stringify(resData));
    return NextResponse.json(resData, { status: 500 });
  }
}
