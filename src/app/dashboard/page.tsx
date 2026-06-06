import Link from 'next/link';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Store, AlertCircle, Database, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';

export default async function DashboardPage() {
  const merchantId = await getSessionMerchantId();
  
  let merchant = null;
  let productsCount = 0;

  if (merchantId) {
    try {
      merchant = await prisma.merchant.findUnique({
        where: { id: merchantId }
      });
      
      if (merchant) {
        productsCount = await prisma.product.count({
          where: { merchantId }
        });
      }
    } catch (error) {
      console.error('Failed to query merchant stats:', error);
    }
  }

  // Case 1: Store is not connected
  if (!merchant) {
    return (
      <div className="flex flex-col justify-center items-center py-12 px-4 select-none">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-navy mb-2">لا يوجد متجر مربوط حالياً</h2>
          <p className="text-slate-gray text-xs leading-relaxed mb-6">
            من أجل الوصول إلى لوحة تحكم بروز وعرض منتجاتك، يجب أولاً ربط حساب متجرك على سلة بالتطبيق ومنح الصلاحيات اللازمة.
          </p>
          
          <Link 
            href="/login" 
            className="w-full inline-flex items-center justify-center gap-2 bg-[#5B4DFF] hover:bg-[#4a3ee6] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-[#5B4DFF]/20 mb-4 text-sm"
          >
            <Store className="w-5 h-5" /> ربط متجر سلة الآن
          </Link>
          
          <Link 
            href="/" 
            className="text-xs font-bold text-slate-gray hover:text-navy transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Store is connected successfully
  return (
    <div className="space-y-8 select-none">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Connection Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#475569] uppercase mb-4 font-black">حالة ربط المتجر</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-navy">{merchant.storeName}</h4>
                  <span className="text-[10px] text-slate-gray block mt-0.5 font-mono">معرف المتجر: {merchant.sallaMerchantId}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-gray">حالة الصلاحيات:</span>
                {merchant.hasWriteAccess ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> قراءة وكتابة (نشطة)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    <ShieldAlert className="w-3.5 h-3.5" /> قراءة فقط (محدودة)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Products Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#475569] uppercase mb-4 font-black">المنتجات المتاحة</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-navy">{productsCount}</span>
              <span className="text-xs text-slate-gray">منتج مضاف</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-gray">لمزامنة منتجات جديدة أو تحديث القائمة:</span>
            <Link 
              href="/dashboard/connection" 
              className="text-xs text-[#5B4DFF] font-bold hover:underline"
            >
              تحديث وحالة الربط
            </Link>
          </div>
        </div>

      </div>

      {/* Action Button Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5B4DFF]/5 text-[#5B4DFF] flex items-center justify-center border border-[#5B4DFF]/10">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h4 className="text-sm font-bold text-navy">جدول المنتجات وتحسين محركات البحث</h4>
            <p className="text-xs text-slate-gray mt-0.5">افتح جدول المنتجات لمراجعة الأوصاف وبدء تحسينها بالذكاء الاصطناعي.</p>
          </div>
        </div>
        
        <Link 
          href="/dashboard/products" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5B4DFF] hover:bg-[#4a3ee6] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-[#5B4DFF]/20 text-xs"
        >
          الانتقال إلى المنتجات <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
