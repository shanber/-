'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  Save, 
  Send,
  Eye,
  Award,
  Database,
  RefreshCw,
  ExternalLink,
  ShieldAlert
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
  rawJson: any;
}

interface OptimizationResult {
  improvedTitle: string;
  shortDescription: string;
  fullDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  imageAltTexts: string[];
  seoNotes: string[];
  warnings: string[];
  beforeScore: number;
  afterScore: number;
}

interface ProductEditorClientProps {
  product: Product;
  history: any[];
  hasWriteAccess: boolean;
  storeName: string;
}

export default function ProductEditorClient({ 
  product, 
  history, 
  hasWriteAccess,
  storeName 
}: ProductEditorClientProps) {
  const router = useRouter();
  const [optMode, setOptMode] = useState<'description' | 'seo' | 'both'>('both');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Suggestion state
  const [historyId, setHistoryId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );
  const [suggestion, setSuggestion] = useState<OptimizationResult | null>(
    history.length > 0 ? {
      improvedTitle: history[0].suggestedTitle,
      shortDescription: history[0].suggestedShortDescription,
      fullDescription: history[0].suggestedDescription,
      metaTitle: history[0].suggestedMetaTitle,
      metaDescription: history[0].suggestedMetaDescription,
      keywords: history[0].suggestedKeywordsJson,
      imageAltTexts: history[0].suggestedAltTextJson,
      seoNotes: history[0].seoNotesJson,
      warnings: [], // Warnings are not stored in history
      beforeScore: history[0].beforeScore,
      afterScore: history[0].afterScore,
    } : null
  );

  // Edit / Form states for custom updates
  const [editedTitle, setEditedTitle] = useState('');
  const [editedShortDesc, setEditedShortDesc] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedMetaTitle, setEditedMetaTitle] = useState('');
  const [editedMetaDesc, setEditedMetaDesc] = useState('');
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  
  // UI states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Initialize form with generated values
  const initForm = (opt: OptimizationResult) => {
    setEditedTitle(opt.improvedTitle);
    setEditedShortDesc(opt.shortDescription);
    setEditedDesc(opt.fullDescription);
    setEditedMetaTitle(opt.metaTitle);
    setEditedMetaDesc(opt.metaDescription);
    setEditedKeywords(opt.keywords);
  };

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch('/api/products/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, mode: optMode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuggestion(data.optimization);
        setHistoryId(data.historyId);
        initForm(data.optimization);
        setApiSuccess('تم تحليل وتوليد الاقتراحات وحفظها كمسودة بنجاح.');
        router.refresh(); // Refresh history
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

  const handleOpenPreview = () => {
    if (!suggestion) return;
    // If form was not initialized, init it
    if (!editedTitle) {
      initForm(suggestion);
    }
    setShowPreviewModal(true);
  };

  const handleApplyToSalla = async () => {
    if (!historyId) return;
    setIsApplying(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch('/api/products/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          historyId,
          name: editedTitle,
          description: editedDesc,
          metaTitle: editedMetaTitle,
          metaDescription: editedMetaDesc,
          keywords: editedKeywords,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiSuccess(data.message);
        setShowPreviewModal(false);
        router.refresh();
      } else {
        setApiError(data.error || 'فشل تطبيق التعديلات.');
      }
    } catch (err) {
      setApiError('حدث خطأ أثناء إرسال البيانات لسلة.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Navbar */}
      <header className="bg-navy text-white h-16 sticky top-0 z-40 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="font-extrabold text-lg">محرر ومحلل منتج بروز</span>
          </div>
          <span className="text-xs text-slate-300 bg-navy-light px-3 py-1.5 rounded-lg border border-slate-700">
            {storeName}
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb / Top Info */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-navy">{product.name}</h2>
            <p className="text-xs text-slate-gray mt-1">
              تصنيف المنتج: <span className="font-semibold">{product.categoryName || 'غير محدد'}</span> &bull; 
              معرف سلة: <span className="font-mono">{product.sallaProductId}</span>
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold text-slate-gray hover:text-navy border border-slate-200 bg-white px-4 py-2 rounded-lg shadow-sm">
            العودة لجدول المنتجات
          </Link>
        </div>

        {/* Status Alerts */}
        {apiError && (
          <div className="p-4 rounded-xl mb-6 border bg-red-50 border-red-200 text-red-800 text-sm font-medium">
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="p-4 rounded-xl mb-6 border bg-green-50 border-green-200 text-green-800 text-sm font-medium">
            {apiSuccess}
          </div>
        )}

        {/* Top Control Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">لوحة التحكم بالذكاء الاصطناعي</h3>
          
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Mode Select */}
            <div className="flex-grow space-y-2 w-full">
              <label className="text-xs font-bold text-slate-gray">خيار التحسين بالذكاء الاصطناعي:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOptMode('description')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    optMode === 'description' 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-slate-gray border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  تحسين الوصف فقط
                </button>
                <button
                  onClick={() => setOptMode('seo')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    optMode === 'seo' 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-slate-gray border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  تحسين SEO فقط
                </button>
                <button
                  onClick={() => setOptMode('both')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    optMode === 'both' 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-slate-gray border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  الوصف + SEO معاً
                </button>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={isAnalyzing}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                isAnalyzing 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary hover:bg-primary-dark shadow-primary/20'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'جاري توليد التحسين...' : 'توليد التحسين بالذكاء الاصطناعي'}
            </button>
          </div>
        </div>

        {/* Comparative Columns (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Column A: Original Content */}
          <div className="space-y-6">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-md font-black text-navy flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-slate-500" /> المحتوى الحالي في سلة
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h4 className="text-xs font-bold text-slate-gray">اسم المنتج الحالي:</h4>
                  <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-navy">
                    {product.name}
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

                {/* SEO Title & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-gray">Meta Title الحالي:</h4>
                    <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-navy truncate font-medium">
                      {product.rawJson?.metadata?.title || '-'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-gray">Meta Description الحالي:</h4>
                    <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-gray truncate font-medium">
                      {product.rawJson?.metadata?.description || '-'}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="text-xs font-bold text-slate-gray">الكلمات المفتاحية الحالية:</h4>
                  <div className="mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-gray font-medium">
                    {product.rawJson?.metadata?.keywords || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column B: Suggested Optimization */}
          <div className="space-y-6">
            {suggestion ? (
              <div className="bg-white border border-primary/20 rounded-2xl p-6 shadow-sm ring-1 ring-primary/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-md font-black text-navy flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> الاقتراحات المحسنة بـ AI
                  </h3>
                  
                  {/* SEO Score comparison */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-gray font-bold">مقياس الجاهزية:</span>
                    <span className="text-xs text-red-600 font-extrabold bg-red-50 px-2 py-0.5 rounded-full">{suggestion.beforeScore}%</span>
                    <span className="text-xs text-slate-400 font-bold">&larr;</span>
                    <span className="text-xs text-green-600 font-extrabold bg-green-50 px-2 py-0.5 rounded-full">{suggestion.afterScore}%</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Suggested Title */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">العنوان المقترح:</h4>
                      <button 
                        onClick={() => handleCopy(suggestion.improvedTitle, 'title')}
                        className="text-slate-gray hover:text-primary p-1.5 rounded transition-colors"
                        title="نسخ العنوان"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-navy">
                      {suggestion.improvedTitle}
                    </div>
                  </div>

                  {/* Suggested Short Description */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">الوصف التسويقي القصير (المقترح):</h4>
                      <button 
                        onClick={() => handleCopy(suggestion.shortDescription, 'shortdesc')}
                        className="text-slate-gray hover:text-primary p-1.5 rounded transition-colors"
                      >
                        {copiedField === 'shortdesc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-gray leading-relaxed font-medium">
                      {suggestion.shortDescription}
                    </p>
                  </div>

                  {/* Suggested Full Description */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary">الوصف التفصيلي المقترح:</h4>
                      <button 
                        onClick={() => handleCopy(suggestion.fullDescription, 'fulldesc')}
                        className="text-slate-gray hover:text-primary p-1.5 rounded transition-colors"
                      >
                        {copiedField === 'fulldesc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div 
                      className="mt-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-gray leading-relaxed max-h-60 overflow-y-auto space-y-2 prose-sm"
                      dangerouslySetInnerHTML={{ __html: suggestion.fullDescription }}
                    />
                  </div>

                  {/* Suggested Meta Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-primary">Meta Title المقترح:</h4>
                        <button 
                          onClick={() => handleCopy(suggestion.metaTitle, 'metatitle')}
                          className="text-slate-gray hover:text-primary p-1 rounded transition-colors"
                        >
                          {copiedField === 'metatitle' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-navy truncate font-medium">
                        {suggestion.metaTitle}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-primary">Meta Description المقترح:</h4>
                        <button 
                          onClick={() => handleCopy(suggestion.metaDescription, 'metadesc')}
                          className="text-slate-gray hover:text-primary p-1 rounded transition-colors"
                        >
                          {copiedField === 'metadesc' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-gray truncate font-medium">
                        {suggestion.metaDescription}
                      </div>
                    </div>
                  </div>

                  {/* Alt Texts */}
                  <div>
                    <h4 className="text-xs font-bold text-primary">نصوص الصور البديلة (Alt Text) المقترحة:</h4>
                    <div className="mt-1.5 space-y-1">
                      {suggestion.imageAltTexts.map((alt, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs">
                          <span className="truncate text-slate-gray">{alt}</span>
                          <button onClick={() => handleCopy(alt, `alt_${idx}`)} className="text-slate-400 hover:text-primary pr-2">
                            {copiedField === `alt_${idx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Notes */}
                  {suggestion.seoNotes.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <span className="font-bold text-navy block">ملاحظات الـ SEO:</span>
                      <ul className="list-disc list-inside text-slate-gray space-y-1">
                        {suggestion.seoNotes.map((note, idx) => (
                          <li key={idx} className="leading-relaxed">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="border-t border-slate-100 pt-6">
                    {hasWriteAccess ? (
                      <button
                        onClick={handleOpenPreview}
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/20 text-sm"
                      >
                        <Eye className="w-4 h-4" /> معاينة وتطبيق التعديل في سلة
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        <div className="flex gap-2 text-xs font-semibold text-amber-800">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>تحديث المنتج يتطلب تفعيل صلاحية التعديل على المنتجات.</span>
                        </div>
                        <Link
                          href="/api/salla/auth?write=true"
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition-colors text-xs text-center"
                        >
                          تفعيل صلاحية التعديل والكتابة <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-gray flex flex-col items-center justify-center min-h-[400px]">
                <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold">بانتظار توليد الاقتراحات بالذكاء الاصطناعي.</p>
                <p className="text-xs mt-1 text-slate-400">حدد وضع التحسين المطلوب في لوحة التحكم بالأعلى واضغط على الزر.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Preview & Confirmation Modal */}
      {showPreviewModal && suggestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-navy flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> معاينة وتأكيد النشر على متجر سلة
              </h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-gray hover:text-navy text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body (Editable Fields before push) */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                <strong>تنبيه:</strong> سيتم استبدال محتوى المنتج في متجرك ببيانات المعاينة أدناه بمجرد الضغط على تأكيد. يمكنك تعديل الحقول يدوياً قبل النشر.
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-gray">اسم المنتج النهائي:</label>
                <input 
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-navy"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-gray">الوصف التفصيلي النهائي (تنسيق HTML):</label>
                <textarea 
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  rows={8}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-slate-gray leading-relaxed font-mono"
                />
              </div>

              {/* Meta Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-gray">Meta Title النهائي:</label>
                  <input 
                    type="text"
                    value={editedMetaTitle}
                    onChange={(e) => setEditedMetaTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-navy"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-gray">Meta Description النهائي:</label>
                  <input 
                    type="text"
                    value={editedMetaDesc}
                    onChange={(e) => setEditedMetaDesc(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-slate-gray"
                  />
                </div>
              </div>

              {/* Keywords Tagging */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-gray">الكلمات المفتاحية (مفصولة بفاصلة):</label>
                <input 
                  type="text"
                  value={editedKeywords.join(', ')}
                  onChange={(e) => setEditedKeywords(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-slate-gray"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-white hover:bg-slate-100 text-navy border border-slate-200 text-xs font-bold py-2.5 px-5 rounded-lg transition-all"
              >
                إلغاء المعاينة
              </button>
              
              <button
                onClick={handleApplyToSalla}
                disabled={isApplying}
                className={`inline-flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-6 rounded-lg text-white transition-all shadow-md ${
                  isApplying 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-primary hover:bg-primary-dark shadow-primary/20'
                }`}
              >
                {isApplying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isApplying ? 'جاري التحديث والنشر...' : 'تأكيد وتطبيق التحديث على سلة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>بروز لشركاء سله &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
