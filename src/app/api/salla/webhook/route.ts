import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const eventName = payload.event || 'unknown';
    const sallaMerchantId = String(payload.merchant || '');

    // Try to link this event to an existing merchant by sallaMerchantId
    let merchantId: string | null = null;
    if (sallaMerchantId) {
      const merchant = await dbService.findMerchantBySallaId(sallaMerchantId);
      if (merchant) {
        merchantId = merchant.id;
      }
    }

    // Persist the event payload in the WebhookEvent database model
    await dbService.saveWebhookEvent(merchantId, eventName, payload);

    return NextResponse.json({ success: true, message: 'تم استلام الحدث بنجاح.' });
  } catch (error: any) {
    console.error('Salla Webhook error:', error);
    
    // We return status 200 with success: false to prevent Salla's engine 
    // from disabling the webhook in case of request format errors.
    return NextResponse.json(
      { success: false, error: error.message || 'خطأ أثناء معالجة التنبيه.' },
      { status: 200 }
    );
  }
}
export const dynamic = 'force-dynamic';
