'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  Award, 
  ArrowLeft, 
  Settings, 
  LayoutGrid, 
  Sparkles,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  categoryName: string | null;
  imageUrl: string | null;
  seoScore: number;
  analysisStatus: string;
  lastAnalyzedAt: string | null;
}

interface DashboardContentProps {
  initialStats: {
    totalProducts: number;
    needsOptimization: number;
    averageSeo: number;
    lastAnalyzed: Product[];
  };
  storeName: string;
  hasWriteAccess: boolean;
}

export default function DashboardContent({ 
  initialStats, 
  storeName, 
  hasWriteAccess 
}: DashboardContentProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/products/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult({ success: true, message: data.message });
        router.refresh(); // Refresh server side data
      } else {
        setSyncResult({ success: false, message: data.error || 'فشلت المزامنة.' });
      }
    } catch (err) {
      setSyncResult({ success: false, message: 'حدث خطأ في الاتصال بالخادم.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
      // Create a form or fetch route to clear cookies
      try {
        await fetch('/api/salla/logout', { method: 'POST' });
      } catch {}
      // Force reload to home page
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Navbar */}
      <header className="bg-navy text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              بروز <span className="text-primary">.</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="text-white font-bold border-b-2 border-primary pb-1">لوحة التحكم</Link>
              <Link href="/products" className="text-slate-300 hover:text-white transition-colors">المنتجات</Link>
              <Link href="/settings" className="text-slate-300 hover:text-white transition-colors">الإعدادات</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-slate-300 bg-navy-light px-3 py-1.5 rounded-lg border border-slate-700">
              {storeName}
            </span>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 rounded-lg transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation for mobile screens */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 p-3 rounded-xl mb-6 shadow-sm">
          <Link href="/dashboard" className="text-primary font-bold text-xs flex flex-col items-center gap-1">
            <LayoutGrid className="w-4 h-4" /> لوحة التحكم
          </Link>
          <Link href="/products" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <Database className="w-4 h-4" /> المنتجات
          </Link>
          <Link href="/settings" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <Settings className="w-4 h-4" /> الإعدادات
          </Link>
        </div>

        {/* Top bar with sync controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-navy">لوحة التحكم</h1>
            <p className="text-sm text-slate-gray mt-1">نظرة عامة على حالة المنتجات وأداء تهيئة محركات البحث.</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                isSyncing 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary hover:bg-primary-dark shadow-primary/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'جاري مزامنة المنتجات...' : 'مزامنة المنتجات من سلة'}
            </button>
            
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-navy border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Database className="w-4 h-4" /> عرض المنتجات
            </Link>
          </div>
        </div>

        {/* Sync notifications */}
        {syncResult && (
          <div className={`p-4 rounded-xl mb-8 border text-sm font-medium ${
            syncResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {syncResult.message}
          </div>
        )}

        {/* Quick permissions alert */}
        {!hasWriteAccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-800">حالة الربط: قراءة فقط</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  أنت متصل بصلاحيات القراءة فقط. لتحسين وتعديل المنتجات مباشرة في سلة بنقرة واحدة، يُرجى تفعيل صلاحية الكتابة.
                </p>
              </div>
            </div>
            <Link 
              href="/api/salla/auth?write=true"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              تفعيل صلاحية التعديل
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-gray uppercase">إجمالي المنتجات</span>
              <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-navy">{initialStats.totalProducts}</h2>
            <p className="text-xs text-slate-gray mt-2">منتج تمت مزامنته من متجرك.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-gray uppercase">منتجات بحاجة لتحسين</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-red-600">{initialStats.needsOptimization}</h2>
            <p className="text-xs text-slate-gray mt-2">منتجات تقل درجة الـ SEO الخاصة بها عن 60.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-gray uppercase">متوسط درجة جاهزية الـ SEO</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-green-600">{initialStats.averageSeo}%</h2>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-green-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${initialStats.averageSeo}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recently Analyzed Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-black text-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> آخر المنتجات التي تم تحليلها
            </h3>
            <Link 
              href="/products" 
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              عرض كافة المنتجات <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {initialStats.lastAnalyzed.length > 0 ? (
              initialStats.lastAnalyzed.map((prod) => (
                <div key={prod.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4 items-center">
                    {prod.imageUrl ? (
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-14 h-14 rounded-xl border border-slate-100 object-cover bg-slate-50"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
                        <Database className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-navy text-sm sm:text-base leading-snug">{prod.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-gray">
                        <span>التصنيف: {prod.categoryName || 'غير محدد'}</span>
                        {prod.lastAnalyzedAt && (
                          <>
                            <span>&bull;</span>
                            <span>تاريخ التحليل: {new Date(prod.lastAnalyzedAt).toLocaleDateString('ar-SA')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-gray">درجة جاهزية الـ SEO:</span>
                      <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
                        prod.seoScore >= 80 
                          ? 'bg-green-50 text-green-700' 
                          : prod.seoScore >= 60 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {prod.seoScore}%
                      </span>
                    </div>

                    <Link 
                      href={`/products/${prod.id}`}
                      className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-navy hover:text-primary border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-lg transition-all"
                    >
                      محرر المنتج <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-gray">
                <p className="text-sm">لم يتم تحليل أي منتج حتى الآن.</p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold mt-3"
                >
                  انتقل لجدول المنتجات وابدأ التحليل الآن <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
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
