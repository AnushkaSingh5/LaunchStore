// app/api/shipping/label/route.js
import { NextResponse } from 'next/server';
import { shippingService } from '@/services/shipping/shippingService';

export async function GET(request) {
  const reqUrl = request.url;
  const reqMethod = request.method;
  console.log(`📥 [API Request] URL: ${reqUrl} | Method: ${reqMethod}`);

  let orderId;
  try {
    const { searchParams } = new URL(request.url);
    orderId = searchParams.get('order_id');

    if (!orderId) {
      const resData = { success: false, message: 'Missing required order_id parameter.' };
      console.log(`📤 [API Response] Status: 400 | Body:`, JSON.stringify(resData));
      return NextResponse.json(resData, { status: 400 });
    }

    console.log(`🔄 [api/shipping/label]: Fetching shipping label for Order: ${orderId}`);
    const labelUrl = await shippingService.getLabelUrl(orderId);
    
    // Fetch the PDF from the generated label URL securely on the server
    const pdfResponse = await fetch(labelUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download label PDF from source: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    console.log(`📤 [API Response] Status: 200 | Body: [PDF Binary Data]`);
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="shipping_label_${orderId}.pdf"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    const err = error || {};
    const errMsg = err.message || (typeof error === 'string' ? error : 'Internal Server Error during label retrieval.');
    const errStack = err.stack || new Error().stack;
    console.error(`❌ [api/shipping/label]: Failed to get label. Stack Trace:`, errStack);
    
    const resData = { success: false, message: errMsg };
    console.log(`📤 [API Response] Status: 500 | Body:`, JSON.stringify(resData));
    return NextResponse.json(resData, { status: 500 });
  }
}
