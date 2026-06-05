'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  Search, 
  SlidersHorizontal, 
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  LayoutGrid,
  Settings,
  XCircle,
  LogOut
} from 'lucide-react';

interface Product {
  id: string;
  sallaProductId: string;
  name: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  categoryName: string | null;
  seoScore: number;
  analysisStatus: string; // pending | analyzed | failed
  lastError: string | null;
  lastAnalyzedAt: string | null;
}

interface ProductsClientProps {
  products: Product[];
  storeName: string;
}

export default function ProductsClient({ products, storeName }: ProductsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (prod.categoryName && prod.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || prod.analysisStatus === statusFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'good') {
      matchesScore = prod.seoScore >= 80;
    } else if (scoreFilter === 'medium') {
      matchesScore = prod.seoScore >= 60 && prod.seoScore < 80;
    } else if (scoreFilter === 'poor') {
      matchesScore = prod.seoScore < 60;
    }

    return matchesSearch && matchesStatus && matchesScore;
  });

  const handleQuickAnalyze = async (productId: string) => {
    setAnalyzingId(productId);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/products/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, mode: 'both' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.refresh(); // Update the local state
      } else {
        setAnalysisError(data.error || 'فشل التحليل السريع للمنتج.');
      }
    } catch (err) {
      setAnalysisError('خطأ في الاتصال بالخادم.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
      try {
        await fetch('/api/salla/logout', { method: 'POST' });
      } catch {}
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
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">لوحة التحكم</Link>
              <Link href="/products" className="text-white font-bold border-b-2 border-primary pb-1">المنتجات</Link>
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

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Nav */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 p-3 rounded-xl mb-6 shadow-sm">
          <Link href="/dashboard" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <LayoutGrid className="w-4 h-4" /> لوحة التحكم
          </Link>
          <Link href="/products" className="text-primary font-bold text-xs flex flex-col items-center gap-1">
            <Database className="w-4 h-4" /> المنتجات
          </Link>
          <Link href="/settings" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <Settings className="w-4 h-4" /> الإعدادات
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy">المنتجات المزامنة</h1>
          <p className="text-sm text-slate-gray mt-1">
            استعرض منتجاتك المزامنة، افحص نقاط الجاهزية للـ SEO، وابدأ بالتحسين الفردي.
          </p>
        </div>

        {/* Error Alert */}
        {analysisError && (
          <div className="p-4 rounded-xl mb-6 border bg-red-50 border-red-200 text-red-800 text-sm font-medium flex justify-between items-center">
            <span>{analysisError}</span>
            <button onClick={() => setAnalysisError(null)} className="text-red-500 hover:text-red-700 font-bold">إغلاق</button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="text"
                placeholder="ابحث باسم المنتج أو التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            {/* Filter 1: Analysis Status */}
            <div className="flex gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">حالة التحليل: الكل</option>
                <option value="pending">بانتظار التحليل</option>
                <option value="analyzed">تم التحليل</option>
                <option value="failed">فشل التحليل</option>
              </select>

              {/* Filter 2: SEO Score */}
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">درجة SEO: الكل</option>
                <option value="good">ممتازة (&gt;= 80)</option>
                <option value="medium">متوسطة (60 - 79)</option>
                <option value="poor">تحتاج تحسين (أقل من 60)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table/List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-gray uppercase">
                  <th className="p-4 sm:p-5">المنتج</th>
                  <th className="p-4 sm:p-5">التصنيف</th>
                  <th className="p-4 sm:p-5 text-center">السعر</th>
                  <th className="p-4 sm:p-5 text-center">حالة التحليل</th>
                  <th className="p-4 sm:p-5 text-center">درجة الجاهزية SEO</th>
                  <th className="p-4 sm:p-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Product Name & Image */}
                      <td className="p-4 sm:p-5 max-w-xs sm:max-w-md">
                        <div className="flex gap-3 items-center">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                              <Database className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-navy block truncate" title={prod.name}>
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-slate-gray block mt-0.5">معرف المنتج: {prod.sallaProductId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 sm:p-5 text-slate-gray font-medium">
                        {prod.categoryName || 'غير مصنف'}
                      </td>

                      {/* Price */}
                      <td className="p-4 sm:p-5 text-center text-navy font-semibold">
                        {prod.price !== null ? `${prod.price} ر.س` : '-'}
                      </td>

                      {/* Analysis Status */}
                      <td className="p-4 sm:p-5 text-center">
                        <div className="inline-flex justify-center items-center gap-1.5">
                          {prod.analysisStatus === 'analyzed' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" /> تم التحليل
                            </span>
                          ) : prod.analysisStatus === 'failed' ? (
                            <span 
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full cursor-help"
                              title={prod.lastError || 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي'}
                            >
                              <XCircle className="w-3.5 h-3.5" /> فشل التحليل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-gray bg-slate-100 px-2.5 py-1 rounded-full">
                              <HelpCircle className="w-3.5 h-3.5" /> بانتظار التحليل
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SEO Score */}
                      <td className="p-4 sm:p-5 text-center">
                        <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                          prod.seoScore >= 80
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : prod.seoScore >= 60
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {prod.seoScore}%
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuickAnalyze(prod.id)}
                            disabled={analyzingId !== null}
                            className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                              analyzingId === prod.id
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/20 hover:border-primary'
                            }`}
                          >
                            {analyzingId === prod.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            تحليل سريع
                          </button>

                          <Link
                            href={`/products/${prod.id}`}
                            className="inline-flex items-center justify-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-navy border-slate-200 transition-all"
                          >
                            فتح المحرر <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-gray">
                      لا توجد منتجات مطابقة لخيارات البحث الحالية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
