import Link from 'next/link';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import { ShieldCheck, Sparkles, LineChart, CheckCircle } from 'lucide-react';

export default async function Home() {
  const merchantId = await getSessionMerchantId();
  let merchant = null;
  
  if (merchantId) {
    merchant = await dbService.getMerchant(merchantId);
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-navy tracking-tight">بروز <span className="text-primary">.</span></span>
            <span className="text-xs text-slate-gray hidden sm:inline border-r border-slate-200 pr-3">وصف أذكى، ظهور أوضح</span>
          </div>
          
          <div>
            {merchant ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-gray font-medium">متصل: {merchant.storeName}</span>
                <Link 
                  href="/dashboard" 
                  className="bg-navy hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  لوحة التحكم
                </Link>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/20"
              >
                ربط متجر سلة
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 sm:py-28 text-center max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" /> مساعد الذكاء الاصطناعي الأول لتجار سلة
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-navy leading-tight tracking-tight mb-6">
            بروز <span className="text-primary">Boroz</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-gray font-medium mb-4">
            وصف أذكى، ظهور أوضح.
          </p>
          <p className="text-base sm:text-lg text-slate-gray max-w-2xl mx-auto mb-10 leading-relaxed">
            تطبيق ذكاء اصطناعي يساعد متاجر سلة على تحسين أوصاف المنتجات وجاهزيتها التقنية واللغوية لمحركات البحث (SEO) لظهور أوضح أمام عملائك.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 text-base"
            >
              ابدأ بربط متجرك الآن
            </Link>
            
            {merchant && (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-navy border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all text-base"
              >
                دخول لوحة التحكم
              </Link>
            )}
          </div>

          <p className="text-xs text-slate-gray mt-6 max-w-md mx-auto leading-relaxed">
            * تطبيق بروز لا يقدم وعوداً غير مثبتة بتصدر نتائج بحث Google، بل يقدم تحسينات عملية لجودة محتوى المنتج وجاهزيته للظهور.
          </p>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">كيف يساعدك بروز في تطوير متجرك؟</h2>
              <p className="text-slate-gray mt-2 text-sm sm:text-base">مميزات صممت خصيصاً لتجار سلة بمظهر احترافي ومخرجات عملية.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">تحسين فوري للأوصاف والعناوين</h3>
                <p className="text-slate-gray text-sm leading-relaxed">
                  يحلل الذكاء الاصطناعي المنتج كخبير محتوى وصانع مبيعات، ليعيد صياغة العناوين والأوصاف بأسلوب جذاب وبنية صحيحة تلائم المشترين في الخليج.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">مقياس جاهزية الـ SEO</h3>
                <p className="text-slate-gray text-sm leading-relaxed">
                  احسب درجة تقريبية لجاهزية منتجك لمحركات البحث بناءً على طول العناوين، الأوصاف، الكلمات الدلالية وتوفر الوصف البديل للصور.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">مزامنة وتطبيق مباشر بنقرة واحدة</h3>
                <p className="text-slate-gray text-sm leading-relaxed">
                  اسحب منتجاتك من متجر سلة بضغطة زر، وعاين الاقتراحات المحسنة، ثم طبق التحديثات مباشرة على متجرك بأمان تام ودون مغادرة المنصة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-2xl mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy mb-4">حماية وأمان على مستوى القطاع</h2>
          <p className="text-slate-gray text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            نحن نأخذ خصوصية وأمن متجرك بجدية بالغة. يتم حفظ جميع رموز الوصول (Tokens) مشفرة بالكامل في قاعدة البيانات باستخدام خوارزمية التشفير القياسية <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">AES-256-GCM</code>، ولن تظهر أبداً في المتصفح.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-white mb-2">بروز - Boroz</p>
          <p className="text-xs text-slate-500 mb-6">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
          <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
            تطبيق بروز هو أداة تحسين مستقلة ولا تعتبر شريكاً رسمياً أو جهة تابعة لشركة جوجل (Google). بروز يساعد على تهيئة وتنسيق محتوى المنتج تقنياً لملائمة متطلبات البحث، الترتيب الفعلي يعتمد كلياً على خوارزميات محركات البحث ومستوى التنافسية.
          </p>
        </div>
      </footer>
    </div>
  );
}
