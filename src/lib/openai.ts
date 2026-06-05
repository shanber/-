import { z } from 'zod';
import { calculateSeoScore } from './seo';

export const AIResponseSchema = z.object({
  improvedTitle: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  imageAltTexts: z.array(z.string()),
  seoNotes: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

export async function generateProductOptimization(
  name: string,
  description: string,
  categoryName: string | null,
  mode: 'description' | 'seo' | 'both',
  imagesAlt: string[]
): Promise<AIResponse> {
  if (process.env.MOCK_MODE === 'true') {
    // Generate high quality mock optimization result
    const hasWrite = true;
    const improvedTitle = mode === 'seo' ? name : `${name} - فاخر وطبيعي 100%`;
    const shortDescription = `استمتع بـ ${name} الفاخر المحضر بأعلى معايير الجودة لتجربة فريدة ومميزة. طبيعي 100% بدون أي إضافات صناعية.`;
    const fullDescription = mode === 'seo' ? description : `
<p>نقدم لكم <strong>${name}</strong> الفاخر، الذي تم انتقاؤه وتعبئته بعناية فائقة لضمان أعلى مستويات الجودة والنكهة الغنية الأصيلة.</p>

<h3>لماذا تختار ${name} من متجرنا؟</h3>
<ul>
  <li><strong>طبيعي وأصيل:</strong> مستخلص من مصادر طبيعية ومضمونة 100%.</li>
  <li><strong>جودة ممتازة:</strong> نطبق رقابة صارمة على التعبئة والتغليف لضمان وصول المنتج طازجاً ومحفوظاً بشكل ممتاز.</li>
  <li><strong>مثالي للتقديم:</strong> خيار رائع للتقديم للضيوف أو للإهداء الفاخر في المناسبات.</li>
</ul>

<p>اطلبه الآن وتمتع بتجربة تسوق فريدة مع شحن سريع ودعم فني على مدار الساعة!</p>
`.trim();

    const metaTitle = `شراء ${name} الفاخر الأصلي | شحن سريع`;
    const metaDescription = `تسوق الآن عسل وتمر وبن ${name} الطبيعي 100%. جودة ممتازة، شحن آمن، أسعار منافسة. اضغط هنا للمزيد من التفاصيل والطلب.`;
    const keywords = [name, 'طبيعي', 'أصلي', 'فاخر', 'متجر سعودي'];
    
    // Create suggested alt texts
    const imageAltTexts = imagesAlt.length > 0 
      ? imagesAlt.map((_, idx) => `${name} طبيعي ومغلف فاخر - صورة رقم ${idx + 1}`)
      : [`${name} فاخر مع التغليف الأصلي للحفاظ على الجودة`];

    return {
      improvedTitle,
      shortDescription,
      fullDescription,
      metaTitle,
      metaDescription,
      keywords,
      imageAltTexts,
      seoNotes: [
        'تم تحسين صياغة العنوان لتضمين الكلمات المفتاحية الأكثر بحثاً.',
        'تم تنظيم الوصف باستخدام وسوم HTML (العناوين والقوائم) لتحسين القراءة وتسهيل زحف محركات البحث.',
        'تم توفير عناوين وأوصاف بديلة (Meta tags) متوافقة تماماً مع الأطوال القياسية لـ Google.',
        'تمت إضافة نصوص بديلة (Alt Text) للصور للمساعدة في أرشفتها بمحرك بحث الصور.'
      ],
      warnings: name.length < 8 ? ['عنوان المنتج الحالي قصير جداً، يفضل تفصيل اسم المنتج ليكون أكثر وضوحاً.'] : [],
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('مفتاح OpenAI_API_KEY غير موجود في متغيرات البيئة.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const cleanDesc = description.replace(/<[^>]*>/g, '').trim();

  const prompt = `
أنت خبير تجارة إلكترونية عربي ومحترف تهيئة محركات البحث (SEO).
مهمتك هي تحليل وتحسين المنتج التالي باللغة العربية:
- اسم المنتج الحالي: "${name}"
- وصف المنتج الحالي: "${cleanDesc}"
- تصنيف المنتج: "${categoryName || 'عام'}"
- وضع التحسين المطلوب: "${mode}" (الأوضاع المتاحة: description لتحسين الوصف فقط، seo لتحسين حقول محركات البحث فقط، both لتحسين كلاهما معاً).

التعليمات الفنية والتسويقية الحتمية:
1. استخدم لغة عربية سليمة تماماً وتناسب السوق السعودي والخليجي.
2. ركز على إبراز الفوائد والخصائص بشكل مقنع للعميل (نبرة تسويقية رصينة وراقية).
3. تجنب تماماً حشو الكلمات المفتاحية بشكل مصطنع أو مزعج.
4. لا تخترع مواصفات أو معلومات غير موجودة في النص الأصلي (مثل الوزن أو المكونات إذا لم تكن مذكورة). ضع أي نواقص في حقل التحذيرات "warnings" كطلب للمعلومات بدلاً من ابتكارها.
5. لا تعد التاجر بضمان تصدر نتائج البحث أو بضمان الترتيب في Google.
6. إذا كان وضع التحسين "description"، ركز بشكل أساسي على صياغة وصف تفصيلي جذاب للغاية ومرتب باستخدام قوائم وعناوين.
7. إذا كان وضع التحسين "seo"، ركز على حقول meta title و meta description وصياغة نصوص بديلة ممتازة للصور.
8. إذا كان وضع التحسين "both"، قم بالتحسين الشامل للمنتج.

يجب أن تكون مخرجاتك بتنسيق JSON مطابق تماماً للهيكل المحدد في الـ Response Schema.
`;

  // OpenAI JSON schema structured outputs definition
  const jsonSchema = {
    name: "product_optimization",
    strict: true,
    schema: {
      type: "object",
      properties: {
        improvedTitle: { type: "string", description: "العنوان الجديد المحسن للمنتج" },
        shortDescription: { type: "string", description: "وصف تسويقي قصير وجذاب (سطرين إلى ثلاثة)" },
        fullDescription: { type: "string", description: "الوصف الكامل مع استخدام وسوم HTML مثل <p>, <ul>, <li>, <strong> للتنسيق" },
        metaTitle: { type: "string", description: "العنوان لمحركات البحث Meta Title (50-60 حرفاً)" },
        metaDescription: { type: "string", description: "الوصف لمحركات البحث Meta Description (120-160 حرفاً)" },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "الكلمات المفتاحية للمنتج (3-5 كلمات دلالية)"
        },
        imageAltTexts: {
          type: "array",
          items: { type: "string" },
          description: "النصوص البديلة المقترحة لصور المنتج لمساعدتها في الظهور"
        },
        seoNotes: {
          type: "array",
          items: { type: "string" },
          description: "ملاحظات وتوضيحات فنية للتاجر توضح ما تم تعديله ولماذا"
        },
        warnings: {
          type: "array",
          items: { type: "string" },
          description: "تحذيرات للتاجر حول أي معلومات هامة قد تكون ناقصة في الوصف الأصلي"
        }
      },
      required: [
        "improvedTitle",
        "shortDescription",
        "fullDescription",
        "metaTitle",
        "metaDescription",
        "keywords",
        "imageAltTexts",
        "seoNotes",
        "warnings"
      ],
      additionalProperties: false
    }
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`خطأ من OpenAI API: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const choiceContent = result.choices?.[0]?.message?.content;
  if (!choiceContent) {
    throw new Error('لم يعيد خادم OpenAI أي استجابة.');
  }

  const parsed = JSON.parse(choiceContent);
  return AIResponseSchema.parse(parsed);
}
