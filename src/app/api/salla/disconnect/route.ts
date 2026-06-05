import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId, deleteSession } from '@/lib/session';
import { dbService } from '@/lib/dbService';

export async function POST(request: NextRequest) {
  try {
    const merchantId = await getSessionMerchantId();
    if (!merchantId) {
      return NextResponse.json(
        { error: 'غير مصرح بالعملية. يرجى تسجيل الدخول.' },
        { status: 401 }
      );
    }

    // Delete merchant from database (cascades to products and optimization history)
    await dbService.deleteMerchant(merchantId);
    
    // Wipe session cookie
    await deleteSession();

    return NextResponse.json({ 
      success: true, 
      message: 'تم إلغاء ربط المتجر وحذف كافة بيانات المنتجات بنجاح.' 
    });
  } catch (error: any) {
    console.error('Disconnect API error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء إلغاء ربط المتجر.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
