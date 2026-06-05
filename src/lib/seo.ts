/**
 * دالة لحساب درجة الجاهزية التقريبية لمحركات البحث (SEO Score) من 100.
 * هذه الدرجة تقريبية ومبنية على أفضل الممارسات الفنية لمحتوى صفحة المنتج.
 */
export function calculateSeoScore(
  name: string,
  description: string,
  metaTitle?: string,
  metaDescription?: string,
  keywords?: string | string[],
  imagesAlt?: string[]
): number {
  let score = 0;

  // 1. طول العنوان (الحد الأقصى: 15 نقطة)
  const titleLen = name?.length || 0;
  if (titleLen >= 25 && titleLen <= 60) {
    score += 15; // طول مثالي
  } else if (titleLen > 10 && titleLen < 25) {
    score += 10; // قصير قليلاً
  } else if (titleLen > 60 && titleLen < 90) {
    score += 8;  // طويل قليلاً
  } else if (titleLen > 0) {
    score += 4;
  }

  // إزالة وسوم HTML لتقييم النص الفعلي للوصف
  const cleanDesc = (description || '').replace(/<[^>]*>/g, '').trim();
  const descLen = cleanDesc.length;

  // 2. طول وصف المنتج (الحد الأقصى: 25 نقطة)
  if (descLen >= 150 && descLen <= 1200) {
    score += 25; // تفاصيل ممتازة
  } else if (descLen >= 50 && descLen < 150) {
    score += 15; // وصف متوسط
  } else if (descLen > 1200) {
    score += 18; // طويل جداً قد يشتت الباحث
  } else if (descLen > 0) {
    score += 5;  // قصير جداً وغير كافٍ
  }

  // 3. هيكلة الفوائد والخصائص (الحد الأقصى: 15 نقطة)
  // البحث عن القوائم المنقطة أو الكلمات الدلالية
  const hasBullets = (description || '').includes('<li>') || 
                      cleanDesc.includes('-') || 
                      cleanDesc.includes('•') || 
                      cleanDesc.includes('*');
  const hasBenefitKeywords = cleanDesc.includes('مميزات') || 
                             cleanDesc.includes('فوائد') || 
                             cleanDesc.includes('مواصفات') ||
                             cleanDesc.includes('يتميز');

  if (hasBullets) {
    score += 15;
  } else if (descLen > 100 && hasBenefitKeywords) {
    score += 10;
  }

  // 4. العنوان البديل لمحركات البحث Meta Title (الحد الأقصى: 10 نقاط)
  if (metaTitle && metaTitle.trim().length > 10) {
    score += 10;
  } else if (metaTitle && metaTitle.trim().length > 0) {
    score += 5;
  }

  // 5. الوصف البديل Meta Description (الحد الأقصى: 15 نقطة)
  const metaDescLen = metaDescription?.trim().length || 0;
  if (metaDescLen >= 80 && metaDescLen <= 160) {
    score += 15; // طول مثالي لمحركات البحث
  } else if (metaDescLen > 0) {
    score += 8;
  }

  // 6. الكلمات المفتاحية (الحد الأقصى: 10 نقاط)
  let kwCount = 0;
  if (Array.isArray(keywords)) {
    kwCount = keywords.length;
  } else if (typeof keywords === 'string' && keywords.trim().length > 0) {
    kwCount = keywords.split(',').filter(k => k.trim()).length;
  }

  if (kwCount >= 3) {
    score += 10;
  } else if (kwCount > 0) {
    score += 5;
  }

  // 7. النصوص البديلة للصور Alt Text (الحد الأقصى: 10 نقاط)
  if (Array.isArray(imagesAlt) && imagesAlt.length > 0) {
    const filledAlts = imagesAlt.filter(alt => alt && alt.trim().length > 2).length;
    if (filledAlts === imagesAlt.length) {
      score += 10;
    } else if (filledAlts > 0) {
      score += 5;
    }
  } else {
    // في حال عدم وجود صور، نفترض تقييم مبدئي متوسط لحقل Alt
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}
