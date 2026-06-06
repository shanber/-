import { LineChart, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none" dir="rtl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-navy">التحليلات الذكية وفرص تحسين SEO</h2>
        <p className="text-xs text-slate-gray mt-1">تتبع جودة المنتجات، الكلمات المفتاحية الضعيفة، ونسب تزايد الظهور.</p>
      </div>

      {/* Feature Coming Soon Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#5B4DFF]/10 text-[#5B4DFF] flex items-center justify-center border border-[#5B4DFF]/10 animate-pulse">
          <LineChart className="w-8 h-8" />
        </div>
        
        <div className="max-w-md space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5B4DFF] bg-[#5B4DFF]/10 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> ميزة حصرية قريباً
          </span>
          <h3 className="text-lg font-black text-navy">لوحة تحليل الكلمات الدلالية وجاهزية محركات البحث</h3>
          <p className="text-xs text-slate-gray leading-relaxed">
            نقوم حالياً بتطوير لوحة تحليلات متكاملة تساعدك على اكتشاف الكلمات المفتاحية الأكثر ربحاً لمتجرك وتحديد المنتجات ذات الجودة المنخفضة فورياً.
          </p>
        </div>

        {/* Mock Graphic Layout */}
        <div className="w-full max-w-lg border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-4 opacity-50">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <div className="h-4 w-32 bg-slate-300 rounded" />
            <div className="h-4 w-12 bg-slate-300 rounded" />
          </div>
          <div className="flex items-end gap-3 h-28 pt-4">
            <div className="w-full h-[30%] bg-[#5B4DFF]/30 rounded-t" />
            <div className="w-full h-[60%] bg-[#5B4DFF]/40 rounded-t" />
            <div className="w-full h-[45%] bg-[#5B4DFF]/30 rounded-t" />
            <div className="w-full h-[85%] bg-[#5B4DFF]/60 rounded-t" />
            <div className="w-full h-[70%] bg-[#5B4DFF]/50 rounded-t" />
          </div>
        </div>
      </div>
    </div>
  );
}
