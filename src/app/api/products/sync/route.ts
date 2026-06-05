import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import { decrypt } from '@/lib/encryption';
import { fetchSallaProducts } from '@/lib/salla';
import { calculateSeoScore } from '@/lib/seo';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const merchantId = await getSessionMerchantId();
    if (!merchantId) {
      return NextResponse.json(
        { error: 'غير مصرح بالدخول. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      );
    }

    // 2. Fetch merchant info
    const merchant = await dbService.getMerchant(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { error: 'التاجر غير موجود في قاعدة البيانات.' },
        { status: 404 }
      );
    }

    // 3. Decrypt access token
    let accessToken = '';
    try {
      accessToken = decrypt(merchant.accessTokenEncrypted);
    } catch (err) {
      console.error('Failed to decrypt access token:', err);
      return NextResponse.json(
        { error: 'فشل فك تشفير رمز الوصول لسلة، يرجى إعادة ربط المتجر.' },
        { status: 500 }
      );
    }

    // 4. Fetch products from Salla API
    let sallaProducts = [];
    try {
      sallaProducts = await fetchSallaProducts(accessToken);
    } catch (err: any) {
      console.error('Failed to fetch Salla products:', err);
      return NextResponse.json(
        { error: `فشل جلب المنتجات من سلة: ${err.message || err}` },
        { status: 502 }
      );
    }

    // 5. Sync products to database
    let syncedCount = 0;
    for (const prod of sallaProducts) {
      const keywords = prod.metadata?.keywords || '';
      const altTexts = prod.images?.map((img: any) => img.alt || '') || [];
      
      const initialScore = calculateSeoScore(
        prod.name,
        prod.description,
        prod.metadata?.title || '',
        prod.metadata?.description || '',
        keywords,
        altTexts
      );

      await dbService.upsertProduct(merchantId, prod.id, {
        name: prod.name,
        description: prod.description,
        price: prod.price !== undefined ? prod.price : null,
        imageUrl: prod.main_image || null,
        categoryName: prod.category || null,
        seoScore: initialScore,
        rawJson: prod,
      });

      syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `تمت مزامنة ${syncedCount} منتجًا من متجرك بنجاح.`,
      syncedCount 
    });
  } catch (error: any) {
    console.error('Products sync error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء مزامنة المنتجات.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
