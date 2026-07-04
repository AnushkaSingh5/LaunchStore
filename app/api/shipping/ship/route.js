// app/api/shipping/ship/route.js
import { NextResponse } from 'next/server';
import { shippingService } from '@/services/shipping/shippingService';

export async function POST(request) {
  const reqUrl = request.url;
  const reqMethod = request.method;
  console.log(`📥 [API Request] URL: ${reqUrl} | Method: ${reqMethod}`);

  try {
    let orderId;
    try {
      const body = await request.json();
      orderId = body.orderId;
    } catch (parseErr) {
      console.error('❌ [api/shipping/ship] Failed to parse request body as JSON:', parseErr);
      const resData = { success: false, message: 'Invalid JSON request body.' };
      console.log(`📤 [API Response] Status: 400 | Body:`, JSON.stringify(resData));
      return NextResponse.json(resData, { status: 400 });
    }
    
    if (!orderId) {
      const resData = { success: false, message: 'Missing required orderId in request body.' };
      console.log(`📤 [API Response] Status: 400 | Body:`, JSON.stringify(resData));
      return NextResponse.json(resData, { status: 400 });
    }

    console.log(`🔄 [api/shipping/ship]: Manually triggering shipment for Order: ${orderId}`);
    const result = await shippingService.createShipment(orderId);
    
    const resData = {
      success: true,
      message: 'Shipment created and AWB generated successfully',
      ...result
    };
    console.log(`📤 [API Response] Status: 200 | Body:`, JSON.stringify(resData));
    return NextResponse.json(resData);
  } catch (error) {
    const err = error || {};
    const errMsg = err.message || (typeof error === 'string' ? error : 'Internal Server Error during shipment creation.');
    const errStack = err.stack || new Error().stack;
    console.error(`❌ [api/shipping/ship]: Failed to initialize shipment. Stack Trace:`, errStack);
    
    const resData = { success: false, message: errMsg };
    console.log(`📤 [API Response] Status: 500 | Body:`, JSON.stringify(resData));
    return NextResponse.json(resData, { status: 500 });
  }
}
