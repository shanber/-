import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import { generateProductOptimization } from '@/lib/openai';
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

    // 2. Parse request body
    const body = await request.json();
    const { productId, mode } = body;

    if (!productId || !mode || !['description', 'seo', 'both'].includes(mode)) {
      return NextResponse.json(
        { error: 'معطيات الطلب غير مكتملة أو غير صالحة.' },
        { status: 400 }
      );
    }

    // 3. Rate limiting check (using DB optimization history)
    const history = await dbService.getOptimizationHistory(merchantId);
    const nowMs = Date.now();
    const oneMinAgo = nowMs - 60 * 1000;
    const oneHourAgo = nowMs - 60 * 60 * 1000;

    const reqsInLastMin = history.filter(
      (h) => new Date(h.createdAt).getTime() > oneMinAgo
    ).length;
    
    const reqsInLastHour = history.filter(
      (h) => new Date(h.createdAt).getTime() > oneHourAgo
    ).length;

    if (reqsInLastMin >= 5) {
      return NextResponse.json(
        { error: 'لقد تجاوزت حد الطلبات المسموح به (5 طلبات في الدقيقة). يرجى الانتظار قليلاً.' },
        { status: 429 }
      );
    }

    if (reqsInLastHour >= 30) {
      return NextResponse.json(
        { error: 'لقد تجاوزت حد الطلبات المسموح به (30 طلبًا في الساعة).' },
        { status: 429 }
      );
    }

    // 4. Fetch product
    const product = await dbService.getProductById(productId);
    if (!product || product.merchantId !== merchantId) {
      return NextResponse.json(
        { error: 'المنتج غير موجود أو لا ينتمي لمتجرك.' },
        { status: 404 }
      );
    }

    // Retrieve original fields and images alt
    const rawJson = (product.rawJson as any) || {};
    const imagesAlt = rawJson.images?.map((img: any) => img.alt || '') || [];

    // Calculate before SEO score
    const beforeScore = calculateSeoScore(
      product.name,
      product.description,
      rawJson.metadata?.title || '',
      rawJson.metadata?.description || '',
      rawJson.metadata?.keywords || '',
      imagesAlt
    );

    let aiResult;
    try {
      // 5. Generate AI Optimization
      aiResult = await generateProductOptimization(
        product.name,
        product.description,
        product.categoryName,
        mode,
        imagesAlt
      );
    } catch (err: any) {
      console.error('AI analysis API error:', err);
      // Update product status as failed
      await dbService.updateProductStatus(
        productId,
        'failed',
        err.message || 'فشل الاتصال بمزود الذكاء الاصطناعي.'
      );
      return NextResponse.json(
        { error: `فشل التحليل: ${err.message || 'فشل الاتصال بالذكاء الاصطناعي.'}` },
        { status: 502 }
      );
    }

    // 6. Calculate after SEO score
    const afterScore = calculateSeoScore(
      aiResult.improvedTitle,
      aiResult.fullDescription,
      aiResult.metaTitle,
      aiResult.metaDescription,
      aiResult.keywords,
      aiResult.imageAltTexts
    );

    // 7. Save to optimization history
    const historyRecord = await dbService.saveOptimizationHistory(merchantId, productId, {
      mode,
      oldTitle: product.name,
      oldDescription: product.description,
      suggestedTitle: aiResult.improvedTitle,
      suggestedShortDescription: aiResult.shortDescription,
      suggestedDescription: aiResult.fullDescription,
      suggestedMetaTitle: aiResult.metaTitle,
      suggestedMetaDescription: aiResult.metaDescription,
      suggestedKeywords: aiResult.keywords,
      suggestedAltTexts: aiResult.imageAltTexts,
      seoNotes: aiResult.seoNotes,
      beforeScore,
      afterScore,
      appliedToSalla: false,
    });

    // 8. Update product status to analyzed
    await dbService.updateProductStatus(productId, 'analyzed', null, afterScore, new Date());

    return NextResponse.json({
      success: true,
      historyId: historyRecord.id,
      optimization: {
        ...aiResult,
        beforeScore,
        afterScore,
      }
    });
  } catch (error: any) {
    console.error('Product analyze route error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء تحليل المنتج.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
