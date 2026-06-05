import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import { decrypt } from '@/lib/encryption';
import { updateSallaProduct } from '@/lib/salla';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

    // 2. Parse request body
    const body = await request.json();
    const { 
      productId, 
      historyId, 
      name, 
      description, 
      metaTitle, 
      metaDescription, 
      keywords 
    } = body;

    if (!productId || !historyId || !name || !description) {
      return NextResponse.json(
        { error: 'معطيات الطلب غير مكتملة.' },
        { status: 400 }
      );
    }

    // 3. Fetch merchant
    const merchant = await dbService.getMerchant(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { error: 'التاجر غير موجود في قاعدة البيانات.' },
        { status: 404 }
      );
    }

    // 4. Verify write access permission
    if (!merchant.hasWriteAccess) {
      return NextResponse.json(
        { error: 'تحديث المنتج يتطلب تفعيل صلاحية التعديل على المنتجات.' },
        { status: 403 }
      );
    }

    // 5. Rate limiting check (using DB optimization history)
    const history = await dbService.getOptimizationHistory(merchantId);
    const nowMs = Date.now();
    const oneMinAgo = nowMs - 60 * 1000;
    
    // Count applied changes in last minute
    const appliedInLastMin = history.filter(
      (h) => h.appliedToSalla && new Date(h.createdAt).getTime() > oneMinAgo
    ).length;

    if (appliedInLastMin >= 5) {
      return NextResponse.json(
        { error: 'لقد تجاوزت حد تحديث المنتجات المسموح به (5 عمليات في الدقيقة). يرجى الانتظار.' },
        { status: 429 }
      );
    }

    // 6. Fetch product
    const product = await dbService.getProductById(productId);
    if (!product || product.merchantId !== merchantId) {
      return NextResponse.json(
        { error: 'المنتج غير موجود أو لا ينتمي لمتجرك.' },
        { status: 404 }
      );
    }

    // 7. Decrypt access token
    let accessToken = '';
    try {
      accessToken = decrypt(merchant.accessTokenEncrypted);
    } catch (err) {
      return NextResponse.json(
        { error: 'فشل فك تشفير رمز الوصول، يرجى إعادة ربط المتجر.' },
        { status: 500 }
      );
    }

    // 8. Apply updates to Salla API
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords || '';
    try {
      await updateSallaProduct(accessToken, product.sallaProductId, {
        name,
        description,
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: keywordsStr,
      });
    } catch (err: any) {
      console.error('Failed to update product on Salla:', err);
      return NextResponse.json(
        { error: `فشل تحديث المنتج في سلة: ${err.message || err}` },
        { status: 502 }
      );
    }

    // 9. Update local database product details and history status
    if (process.env.MOCK_MODE === 'true') {
      const MOCK_DB_PATH = path.join(process.cwd(), 'mock_db.json');
      if (fs.existsSync(MOCK_DB_PATH)) {
        try {
          const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
          
          // update product
          const pIdx = db.products.findIndex((p: any) => p.id === productId);
          if (pIdx > -1) {
            db.products[pIdx].name = name;
            db.products[pIdx].description = description;
            db.products[pIdx].updatedAt = new Date().toISOString();
          }
          
          // update history
          const hIdx = db.history.findIndex((h: any) => h.id === historyId);
          if (hIdx > -1) {
            db.history[hIdx].appliedToSalla = true;
          }
          
          fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        } catch (dbErr) {
          console.error('Mock database update error:', dbErr);
        }
      }
    } else {
      // Prisma implementation
      await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          description,
        },
      });

      await prisma.optimizationHistory.update({
        where: { id: historyId },
        data: {
          appliedToSalla: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تمت مزامنة وتطبيق التعديلات على متجرك في سلة بنجاح!',
    });
  } catch (error: any) {
    console.error('Apply updates API error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء تطبيق التعديلات.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
