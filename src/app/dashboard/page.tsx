import Link from 'next/link';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Store, Link2, AlertCircle, Database, Settings, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';

export default async function DashboardPage() {
  const merchantId = await getSessionMerchantId();
  
  let merchant = null;
  let productsCount = 0;

  if (merchantId) {
    merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });
    
    if (merchant) {
      productsCount = await prisma.product.count({
        where: { merchantId }
      });
    }
  }

  // Case 1: Store is not connected / Session missing
  if (!merchant) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col justify-center items-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-navy mb-2">لا يوجد متجر مربوط حالياً</h1>
          <p className="text-slate-gray text-xs leading-relaxed mb-6">
            من أجل الوصول إلى لوحة تحكم بروز وعرض منتجاتك، يجب أولاً ربط حساب متجرك على سلة بالتطبيق ومنح الصلاحيات اللازمة.
          </p>
          
          <Link 
            href="/login" 
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20 mb-4"
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
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Navbar */}
      <header className="bg-navy text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-extrabold tracking-tight">بروز <span className="text-primary">.</span></span>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="text-white font-bold border-b-2 border-primary pb-1">لوحة التحكم</Link>
              <Link href="/dashboard/products" className="text-slate-300 hover:text-white transition-colors">المنتجات</Link>
              <Link href="/settings" className="text-slate-300 hover:text-white transition-colors">الإعدادات</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-slate-300 bg-navy-light px-3 py-1.5 rounded-lg border border-slate-700">
              {merchant.storeName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy">لوحة التحكم</h1>
          <p className="text-sm text-slate-gray mt-1">نظرة عامة على حالة ربط متجرك والمنتجات المزامنة.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: Connection Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-gray uppercase mb-4">حالة ربط المتجر</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy">{merchant.storeName}</h4>
                  <span className="text-[10px] text-slate-gray block mt-0.5">معرف المتجر: {merchant.sallaMerchantId}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-gray">حالة الصلاحيات:</span>
                {merchant.hasWriteAccess ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> قراءة وكتابة (نشطة)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    <ShieldAlert className="w-3.5 h-3.5" /> قراءة فقط (محدودة)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Products Count */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-gray uppercase mb-4">المنتجات في قاعدة البيانات</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy">{productsCount}</span>
                <span className="text-xs text-slate-gray">منتج مضاف</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-gray">لمزامنة منتجات جديدة أو تحديث القائمة:</span>
              <Link 
                href="/settings" 
                className="text-xs text-primary font-bold hover:underline"
              >
                تحديث من الإعدادات
              </Link>
            </div>
          </div>

        </div>

        {/* Action Button Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy">جدول المنتجات وتحسين محركات البحث</h4>
              <p className="text-xs text-slate-gray mt-0.5">افتح جدول المنتجات لمراجعة الأوصاف وبدء تحسينها بالذكاء الاصطناعي.</p>
            </div>
          </div>
          
          <Link 
            href="/dashboard/products" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20 text-sm"
          >
            الانتقال إلى المنتجات <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>بروز لشركاء سله &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
export const dynamic = 'force-dynamic';
