import { History, Sparkles, Clock, Calendar } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none" dir="rtl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-navy">سجل العمليات والتحسينات</h2>
        <p className="text-xs text-slate-gray mt-1">عرض ومراجعة كافة عمليات توليد ووصف المنتجات السابقة.</p>
      </div>

      {/* Feature Coming Soon Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#5B4DFF]/10 text-[#5B4DFF] flex items-center justify-center border border-[#5B4DFF]/10 animate-pulse">
          <History className="w-8 h-8" />
        </div>
        
        <div className="max-w-md space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5B4DFF] bg-[#5B4DFF]/10 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> ميزة قريباً
          </span>
          <h3 className="text-lg font-black text-navy">سجل التغييرات ومقارنة النصوص التاريخية</h3>
          <p className="text-xs text-slate-gray leading-relaxed">
            سيقوم بروز بحفظ أرشيف كامل لجميع التغييرات التي قمت بنسخها وتحديثها ليعطيك القدرة على العودة لأي وصف قديم أو مقارنة أداء محركات البحث تاريخياً.
          </p>
        </div>

        {/* Mock Timeline Layout */}
        <div className="w-full max-w-md border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-4 text-right opacity-50">
          <div className="relative border-r border-slate-200 pr-4 space-y-4">
            <div className="absolute right-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">منذ يومين</span>
              <span className="text-xs font-bold text-slate-700 block">تحسين منتج: قهوة سعودية شقراء</span>
            </div>
            
            <div className="absolute right-[-4px] top-[74px] w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">منذ 5 أيام</span>
              <span className="text-xs font-bold text-slate-700 block">تحسين منتج: تمر خلاص القصيم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
