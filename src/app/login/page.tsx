import Link from 'next/link';
import { Shield, ArrowRight, Store, KeyRound } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light justify-center items-center px-4 py-12">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-sm text-slate-gray hover:text-navy mb-8 transition-colors self-center"
      >
        <ArrowRight className="w-4 h-4" /> العودة للرئيسية
      </Link>

      {/* Login Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-navy mb-2">ربط متجرك على سلة</h1>
          <p className="text-slate-gray text-sm leading-relaxed">
            اربط متجرك بخطوات بسيطة لتمكين بروز من قراءة منتجاتك والبدء في تحليلها وتحسينها.
          </p>
        </div>

        {/* Action Button */}
        <Link 
          href="/api/salla/auth" 
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20 mb-6 text-center"
        >
          <Store className="w-5 h-5" /> ربط متجر سلة (OAuth)
        </Link>

        {/* Scopes Explanation */}
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">حدود الصلاحيات الحالية:</h3>
          
          <div className="flex gap-3 items-start text-xs text-slate-gray">
            <div className="text-primary mt-0.5"><KeyRound className="w-4 h-4" /></div>
            <p className="leading-relaxed">
              <strong>قراءة المنتجات فقط:</strong> سيقوم بروز بسحب قائمة المنتجات وعرضها لك لتحليلها. لن يتم تعديل أي بيانات في متجرك حالياً.
            </p>
          </div>

          <div className="flex gap-3 items-start text-xs text-slate-gray">
            <div className="text-green-600 mt-0.5"><Shield className="w-4 h-4" /></div>
            <p className="leading-relaxed">
              <strong>أمان تام:</strong> يتم حفظ وتشفير جميع التوكنات برموز أمان مخصصة في خوادم التطبيق، ولن يُسمح للواجهة بالوصول إليها مطلقاً.
            </p>
          </div>
        </div>

        {/* Fine Print */}
        <p className="text-[10px] text-slate-400 text-center mt-8 leading-relaxed">
          بالضغط على زر الربط أعلاه، سيتم تحويلك إلى صفحة حسابات سلة للموافقة على منح تطبيق بروز الصلاحيات المطلوبة.
        </p>
      </div>
    </div>
  );
}
