'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  RefreshCw,
  LayoutGrid,
  Settings,
  ArrowRight
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  main_image?: string;
  category?: string;
}

interface ProductsListClientProps {
  storeName: string;
}

export default function ProductsListClient({ storeName }: ProductsListClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setProducts(data.products || []);
      } else {
        setErrorMessage(data.error || 'فشل جلب المنتجات من متجرك.');
      }
    } catch (err) {
      setErrorMessage('خطأ في الاتصال بالخادم. يرجى التأكد من تشغيل المشروع وضبط الإعدادات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter list by search term
  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Link href="/dashboard/products" className="text-white font-bold border-b-2 border-primary pb-1">المنتجات</Link>
              <Link href="/settings" className="text-slate-300 hover:text-white transition-colors">الإعدادات</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-slate-300 bg-navy-light px-3 py-1.5 rounded-lg border border-slate-700">
              {storeName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 p-3 rounded-xl mb-6 shadow-sm">
          <Link href="/dashboard" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <LayoutGrid className="w-4 h-4" /> لوحة التحكم
          </Link>
          <Link href="/dashboard/products" className="text-primary font-bold text-xs flex flex-col items-center gap-1">
            <Database className="w-4 h-4" /> المنتجات
          </Link>
          <Link href="/settings" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <Settings className="w-4 h-4" /> الإعدادات
          </Link>
        </div>

        {/* Header Title */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy">منتجات متجر سلة</h1>
            <p className="text-sm text-slate-gray mt-1">
              مزامنة وعرض مباشر للمنتجات الحالية في حساب متجرك على سلة.
            </p>
          </div>

          <button
            onClick={loadProducts}
            disabled={isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark shadow-primary/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث القائمة
          </button>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 mb-8 flex gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">فشل جلب المنتجات</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Search Input */}
        {!errorMessage && !isLoading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="text"
                placeholder="ابحث باسم المنتج أو التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-bold text-navy">جاري الاتصال بـ Salla API...</p>
            <p className="text-xs text-slate-gray mt-1">يرجى الانتظار قليلاً لحين تحميل قائمة منتجات متجرك.</p>
          </div>
        ) : (
          /* Products Table */
          !errorMessage && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-gray uppercase">
                      <th className="p-4 sm:p-5">صورة المنتج</th>
                      <th className="p-4 sm:p-5">اسم المنتج</th>
                      <th className="p-4 sm:p-5 text-center">السعر</th>
                      <th className="p-4 sm:p-5 text-center">هل يوجد وصف؟</th>
                      <th className="p-4 sm:p-5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((prod) => {
                        const cleanDesc = (prod.description || '').replace(/<[^>]*>/g, '').trim();
                        const hasDesc = cleanDesc.length > 5;
                        
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                            {/* Image */}
                            <td className="p-4 sm:p-5">
                              {prod.main_image ? (
                                <img
                                  src={prod.main_image}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                                  <Database className="w-5 h-5" />
                                </div>
                              )}
                            </td>

                            {/* Name & Category */}
                            <td className="p-4 sm:p-5 max-w-xs sm:max-w-md">
                              <div>
                                <span className="font-bold text-navy block truncate" title={prod.name}>
                                  {prod.name}
                                </span>
                                <span className="text-[10px] text-slate-gray block mt-0.5">
                                  التصنيف: {prod.category || 'غير محدد'}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="p-4 sm:p-5 text-center text-navy font-semibold">
                              {prod.price !== undefined ? `${prod.price} ر.س` : '-'}
                            </td>

                            {/* Has Description? */}
                            <td className="p-4 sm:p-5 text-center">
                              {hasDesc ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                                  نعم
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                                  لا
                                </span>
                              )}
                            </td>

                            {/* Action button */}
                            <td className="p-4 sm:p-5 text-center">
                              <Link
                                href={`/dashboard/products/${prod.id}`}
                                className="inline-flex items-center justify-center gap-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/15 hover:border-primary text-xs font-bold px-4 py-2 rounded-lg transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> تحسين المنتج
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-gray">
                          لا توجد منتجات مطابقة لخيارات البحث الحالية.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
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
