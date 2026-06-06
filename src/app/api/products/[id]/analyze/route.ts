import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { calculateSeoScore } from '@/lib/seo';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sallaProductId = resolvedParams.id;

    // 1. Verify Session & merchantId
    const merchantId = await getSessionMerchantId();
    if (!merchantId) {
      return NextResponse.json(
        { error: 'غير مصرح بالعملية. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      );
    }

    // 2. Fetch Merchant from Database
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: 'لم يتم العثور على التاجر في قاعدة البيانات. يرجى إعادة ربط المتجر.' },
        { status: 404 }
      );
    }

    // 3. Decrypt access token
    let accessToken = '';
    try {
      accessToken = decrypt(merchant.accessTokenEncrypted);
    } catch (err) {
      return NextResponse.json(
        { error: 'فشل فك تشفير توكن متجر سلة. يرجى إعادة ربط المتجر.' },
        { status: 500 }
      );
    }

    // 4. Fetch Product details from Salla API or Mock
    let productName = '';
    let productDescription = '';
    let categoryName = 'عام';

    if (process.env.MOCK_MODE === 'true') {
      // Mock Product lookup
      if (sallaProductId === 'prod_1') {
        productName = 'تمر خلاص القصيم فاخر 1 كيلو';
        productDescription = 'تمر خلاص خلاص الأحساء والقصيم منتقى بعناية فائقة، مغلف حراري لحفظ الجودة والطعم اللذيذ.';
        categoryName = 'التمور الفاخرة';
      } else if (sallaProductId === 'prod_2') {
        productName = 'قهوة سعودية شقراء بالهيل والزعفران 500 جرام';
        productDescription = 'قهوة عربية سعودية شقراء محضرة من أجود حبوب البن الهرري مع الهيل الفاخر والزعفران الأصيل.';
        categoryName = 'القهوة العربية';
      } else {
        productName = 'منتج تجريبي فاخر';
        productDescription = 'وصف تجريبي قصير للمنتج.';
      }
    } else {
      // Fetch live product from Salla API
      const apiBase = process.env.SALLA_API_BASE || 'https://api.salla.dev/admin/v2';
      const sallaRes = await fetch(`${apiBase}/products/${sallaProductId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!sallaRes.ok) {
        const errText = await sallaRes.text();
        return NextResponse.json(
          { error: `فشل جلب تفاصيل المنتج من سلة: ${errText}` },
          { status: sallaRes.status }
        );
      }

      const sallaData = await sallaRes.json();
      const item = sallaData.data || {};
      productName = item.name || '';
      productDescription = item.description || '';
      categoryName = item.categories?.[0]?.name || 'عام';
    }

    // 5. Run OpenAI Optimization
    if (process.env.MOCK_MODE === 'true') {
      const beforeScore = calculateSeoScore(productName, productDescription);
      
      const responseSchema = {
        score: beforeScore,
        priority: beforeScore < 50 ? 'high' : beforeScore < 80 ? 'medium' : 'low',
        issues: [
          'الوصف الحالي للمنتج يفتقر للهيكلية والتنسيق المناسب لمحركات البحث.',
          'لم يتم توفير كلمات مفتاحية دلالية للمنتج.'
        ],
        improved_description: `<p>نقدم لكم <strong>${productName}</strong> الفاخر، الذي تم انتقاؤه وتعبئته بعناية فائقة لضمان أعلى مستويات الجودة والنكهة الغنية الأصيلة.</p><h3>لماذا تختار هذا المنتج؟</h3><ul><li><strong>طبيعي وأصيل:</strong> مستخلص من مصادر طبيعية ومضمونة 100%.</li><li><strong>جودة ممتازة:</strong> نطبق رقابة صارمة على التعبئة والتغليف لضمان وصول المنتج طازجاً.</li><li><strong>مثالي للاستخدام:</strong> خيار رائع للتقديم وللمناسبات الخاصة.</li></ul><p>اطلبه الآن وتمتع بتجربة تسوق فريدة مع شحن سريع ودعم فني على مدار الساعة!</p>`,
        seo_title: `شراء ${productName} | متجرنا الرسمي`,
        meta_description: `احصل على أجود أنواع ${productName} الطبيعي 100% بسعر مميز وتوصيل سريع. اطلبه الآن وتأكد من الجودة الفائقة.`,
        keywords: [productName.split(' ')[0], 'طبيعي', 'أصلي', 'فاخر', 'سلة'],
        recommendations: [
          'أضف قوائم منقطة للوصف لتسهيل قراءته بواسطة محركات البحث والزوار.',
          'تأكد من توفير نصوص بديلة (Alt Text) لصور المنتج عند رفعها.'
        ]
      };

      return NextResponse.json(responseSchema);
    }

    // OpenAI live API call
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح OpenAI_API_KEY غير متوفر في متغيرات البيئة.' },
        { status: 500 }
      );
    }

    const cleanDesc = productDescription.replace(/<[^>]*>/g, '').trim();

    const prompt = `
أنت خبير تجارة إلكترونية عربي ومحترف تهيئة محركات البحث (SEO).
مهمتك هي تحليل وتحسين المنتج التالي باللغة العربية:
- اسم المنتج الحالي: "${productName}"
- وصف المنتج الحالي: "${cleanDesc}"
- تصنيف المنتج: "${categoryName}"

التعليمات الفنية والتسويقية الحتمية:
1. استخدم لغة عربية سليمة تماماً وتناسب السوق السعودي والخليجي.
2. ركز على إبراز الفوائد والخصائص بشكل مقنع للعميل (نبرة تسويقية رصينة وراقية).
3. تجنب تماماً حشو الكلمات المفتاحية بشكل مصطنع أو مزعج.
4. لا تخترع مواصفات أو معلومات غير موجودة في النص الأصلي.
5. لا تعد التاجر بضمان تصدر نتائج البحث أو بضمان الترتيب في Google.
`;

    // OpenAI JSON Schema output format
    const jsonSchema = {
      name: "seo_analysis",
      strict: true,
      schema: {
        type: "object",
        properties: {
          score: { type: "integer", description: "درجة جاهزية محركات البحث التقريبية للمحتوى الحالي من 100" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "أولوية التحسين بناءً على جودة المحتوى الحالي" },
          issues: {
            type: "array",
            items: { type: "string" },
            description: "قائمة المشاكل المكتشفة في العنوان والوصف الحاليين"
          },
          improved_description: { type: "string", description: "الوصف التفصيلي المقترح والمنسق باستخدام وسوم HTML بسيطة مثل p و ul و li" },
          seo_title: { type: "string", description: "عنوان محركات البحث المقترح (50-60 حرفاً)" },
          meta_description: { type: "string", description: "الوصف التعريفي المقترح لمحركات البحث (120-160 حرفاً)" },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "الكلمات المفتاحية المقترحة للمنتج"
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "نصائح وإرشادات إضافية للتاجر لتحسين صفحة المنتج"
          }
        },
        required: [
          "score",
          "priority",
          "issues",
          "improved_description",
          "seo_title",
          "meta_description",
          "keywords",
          "recommendations"
        ],
        additionalProperties: false
      }
    };

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكاء اصطناعي متخصص في تحسين محتوى المنتجات ومحركات البحث للمتاجر العربية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: jsonSchema
        },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json(
        { error: `خطأ من OpenAI API: ${aiResponse.status} - ${errText}` },
        { status: 502 }
      );
    }

    const result = await aiResponse.json();
    const choiceContent = result.choices?.[0]?.message?.content;
    if (!choiceContent) {
      return NextResponse.json(
        { error: 'لم يعيد خادم OpenAI أي استجابة.' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(choiceContent);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Products analyze route error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء تحليل المنتج.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
