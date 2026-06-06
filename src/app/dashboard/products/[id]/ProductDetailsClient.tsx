'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  Award,
  Database,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  categoryName: string | null;
  seoScore: number;
}

interface AnalysisResult {
  score: number;
  priority: 'low' | 'medium' | 'high';
  issues: string[];
  improved_description: string;
  seo_title: string;
  meta_description: string;
  keywords: string[];
  recommendations: string[];
}

interface ProductDetailsClientProps {
  product: ProductData;
  storeName: string;
}

export default function ProductDetailsClient({ 
  product, 
  storeName 
}: ProductDetailsClientProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/products/${product.id}/analyze`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok && !data.error) {
        setAnalysisResult(data);
      } else {
        setApiError(data.error || 'فشلت عملية التحليل.');
      }
    } catch (err) {
      setApiError('حدث خطأ أثناء الاتصال بالخادم لتوليد التحسين.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const priorityColor = (prio: string) => {
    if (prio === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (prio === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const priorityLabel = (prio: string) => {
    if (prio === 'high') return 'مرتفعة جداً';
    if (prio === 'medium') return 'متوسطة';
    return 'منخفضة';
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Navbar */}
      <header className="bg-navy text-white h-16 sticky top-0 z-40 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/products" 
              className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="font-extrabold text-base">تحسين المنتج بالذكاء الاصطناعي</span>
          </div>
          <span className="text-xs text-slate-300 bg-navy-light px-3 py-1.5 rounded-lg border border-slate-700">
            {storeName}
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link & Info */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-navy">{product.name}</h2>
            <p className="text-xs text-slate-gray mt-1">
              تصنيف المنتج: <span className="font-semibold">{product.categoryName || 'عام'}</span> &bull; 
              المعرف: <span className="font-mono">{product.id}</span>
            </p>
          </div>
          <Link 
            href="/dashboard/products" 
            className="text-xs font-bold text-slate-gray hover:text-navy border border-slate-200 bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            العودة للمنتجات
          </Link>
        </div>

        {/* Error State */}
        {apiError && (
          <div className="p-4 rounded-xl mb-6 border bg-red-50 border-red-200 text-red-800 text-sm font-medium">
            {apiError}
          </div>
        )}

        {/* Initial SEO State */}
        {!analysisResult && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy">التقييم التقني الأولي لمحتوى الصفحة</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-gray">درجة الجاهزية الحالية:</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    product.seoScore >= 80 
                      ? 'bg-green-50 text-green-700' 
                      : product.seoScore >= 60 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-red-50 text-red-700'
                  }`}>
                    {product.seoScore} / 100
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                isAnalyzing 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary hover:bg-primary-dark shadow-primary/20'
              }`}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isAnalyzing ? 'جاري التحليل وتوليد التحسين...' : 'تحليل وتحسين بالذكاء الاصطناعي'}
            </button>
          </div>
        )}

        {/* Comparative Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Column A: Original Content */}
          <div className="space-y-6">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-md font-black text-navy flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-slate-500" /> المحتوى الحالي في سلة
              </h3>

              <div className="space-y-4">
                {/* Image if available */}
                {product.imageUrl && (
                  <div>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 rounded-xl object-cover border border-slate-200 mb-4 bg-white"
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <h4 className="text-xs font-bold text-slate-gray">اسم المنتج:</h4>
                  <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-navy">
                    {product.name}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-xs font-bold text-slate-gray">السعر الحالي:</h4>
                  <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-navy">
                    {product.price !== null ? `${product.price} ر.س` : '-'}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-gray">الوصف الحالي:</h4>
                  <div 
                    className="mt-1.5 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-gray leading-relaxed max-h-80 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: product.description || '<p className="text-slate-300">لا يوجد وصف للمنتج</p>' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column B: Suggested Optimization */}
          <div className="space-y-6">
            {analysisResult ? (
              <div className="bg-white border border-primary/20 rounded-2xl p-6 shadow-sm ring-1 ring-primary/5">
                
                {/* Analysis Title & Scores */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-md font-black text-navy flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> الاقتراحات المقترحة بـ AI
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-gray font-bold">أولوية التحسين:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor(analysisResult.priority)}`}>
                        {priorityLabel(analysisResult.priority)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-gray font-bold">مقياس الجاهزية المتوقع:</span>
                    <span className="text-xs text-green-600 font-extrabold bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                      {analysisResult.score} / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  
                  {/* Suggested Title */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">عنوان SEO المقترح:</h4>
                      <button 
                        onClick={() => handleCopy(analysisResult.seo_title, 'seotitle')}
                        className="text-slate-gray hover:text-primary p-1 rounded transition-colors"
                      >
                        {copiedField === 'seotitle' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-navy">
                      {analysisResult.seo_title}
                    </div>
                  </div>

                  {/* Suggested Meta Description */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">وصف Meta Description المقترح:</h4>
                      <button 
                        onClick={() => handleCopy(analysisResult.meta_description, 'metadesc')}
                        className="text-slate-gray hover:text-primary p-1 rounded transition-colors"
                      >
                        {copiedField === 'metadesc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-gray leading-relaxed font-medium">
                      {analysisResult.meta_description}
                    </div>
                  </div>

                  {/* Suggested Description */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">الوصف التفصيلي المقترح (تنسيق HTML):</h4>
                      <button 
                        onClick={() => handleCopy(analysisResult.improved_description, 'impdesc')}
                        className="text-slate-gray hover:text-primary p-1.5 rounded transition-colors"
                      >
                        {copiedField === 'impdesc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div 
                      className="mt-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-gray leading-relaxed max-h-60 overflow-y-auto space-y-2 prose-sm"
                      dangerouslySetInnerHTML={{ __html: analysisResult.improved_description }}
                    />
                  </div>

                  {/* Suggested Keywords */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">الكلمات المفتاحية المقترحة:</h4>
                      <button 
                        onClick={() => handleCopy(analysisResult.keywords.join(', '), 'keywords')}
                        className="text-slate-gray hover:text-primary p-1 rounded transition-colors"
                      >
                        {copiedField === 'keywords' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {analysisResult.keywords.map((kw, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  {analysisResult.issues.length > 0 && (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-xs space-y-1.5">
                      <span className="font-bold text-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" /> المشاكل المكتشفة في المحتوى الحالي:
                      </span>
                      <ul className="list-disc list-inside text-red-700 space-y-1 pr-1">
                        {analysisResult.issues.map((issue, idx) => (
                          <li key={idx} className="leading-relaxed">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <span className="font-bold text-navy flex items-center gap-1">
                        <Info className="w-4 h-4 text-slate-500" /> نصائح إضافية لتحسين الصفحة:
                      </span>
                      <ul className="list-disc list-inside text-slate-gray space-y-1 pr-1">
                        {analysisResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="leading-relaxed">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Copy Alert Warning */}
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 text-[11px] text-slate-gray">
                    في هذه المرحلة، يمكنك نسخ النصوص المقترحة أعلاه يدوياً وتطبيقها في لوحة تحكم سلة.
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-gray flex flex-col items-center justify-center min-h-[400px]">
                <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold">اضغط على زر "تحليل وتحسين بالذكاء الاصطناعي"</p>
                <p className="text-xs mt-1 text-slate-400">سيتولى الذكاء الاصطناعي تحليل منتجك وتوليد اقتراحات SEO محسنة.</p>
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
