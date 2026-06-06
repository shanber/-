import Link from 'next/link';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ShieldCheck, ShieldAlert, Store, Link2, ArrowLeft } from 'lucide-react';

export default async function ConnectionPage() {
  const merchantId = await getSessionMerchantId();
  let merchant = null;

  if (merchantId) {
    try {
      merchant = await prisma.merchant.findUnique({
        where: { id: merchantId }
      });
    } catch (error) {
      console.error('Failed to fetch merchant details on connection page:', error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none" dir="rtl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-navy">حالة ربط المتجر بالمنصة</h2>
          <p className="text-xs text-slate-gray mt-1">تتبع صلاحيات وصول بروز ومعلومات متجرك المربوط على سلة.</p>
        </div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-gray hover:text-navy border border-slate-200 bg-white px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> العودة للوحة التحكم
        </Link>
      </div>

      {merchant ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">{merchant.storeName}</h3>
              <p className="text-xs text-slate-gray mt-0.5">معرف المتجر على سلة: <span className="font-mono">{merchant.sallaMerchantId}</span></p>
            </div>
            <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
              <Link2 className="w-3.5 h-3.5" /> متصل ونشط
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-gray font-medium">حالة صلاحيات الوصول:</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-navy">صلاحيات التحديث والتعديل:</span>
                {merchant.hasWriteAccess ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100/50 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> كاملة (قراءة/كتابة)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    <ShieldAlert className="w-3.5 h-3.5" /> محدودة (قراءة فقط)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-gray font-medium">تاريخ الربط وتحديث الجلسة:</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-navy flex justify-between">
                <span>تاريخ الربط:</span>
                <span>{new Date(merchant.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-gray leading-relaxed text-right">
              لتغيير الصلاحيات أو لتحديث توكن الربط الخاص بالمتجر، يرجى الضغط على زر إعادة الربط.
            </p>
            <a 
              href="/api/salla/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5B4DFF] hover:bg-[#4a3ee6] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-[#5B4DFF]/20 text-xs"
            >
              <Store className="w-4 h-4" /> إعادة ربط متجر سلة
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-navy mb-2">لا يوجد متجر مربوط حالياً</h3>
          <p className="text-slate-gray text-xs leading-relaxed mb-6">
            تحتاج إلى ربط حساب متجر سلة الخاص بك أولاً مع تطبيق بروز لتستطيع تتبع حالة الاتصال ومزامنة المنتجات.
          </p>
          <a 
            href="/api/salla/auth" 
            className="w-full inline-flex items-center justify-center gap-2 bg-[#5B4DFF] hover:bg-[#4a3ee6] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-[#5B4DFF]/20 text-sm"
          >
            <Store className="w-5 h-5" /> ربط متجر سلة الآن
          </a>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
