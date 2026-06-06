import { Settings, Languages, Sparkles, Sliders, LineChart, Globe } from 'lucide-react';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'إعدادات اللغة والترجمة',
      icon: Languages,
      items: [
        { label: 'اللغة الافتراضية للوصف', value: 'العربية (السعودية والخليج)' },
        { label: 'دعم الترجمة التلقائية للغات متعددة', value: 'غير مفعل' },
      ],
    },
    {
      title: 'أسلوب صياغة الوصف والذكاء الاصطناعي',
      icon: Sparkles,
      items: [
        { label: 'نبرة الكتابة الافتراضية', value: 'تسويقية رصينة وجذابة' },
        { label: 'مستوى التفاعل والإقناع', value: 'مرتفع' },
      ],
    },
    {
      title: 'مستوى تفصيل محتوى الصفحة',
      icon: Sliders,
      items: [
        { label: 'طول الوصف المفضل', value: 'متوسط (يحتوي على فقرات وقوائم فوائد)' },
        { label: 'تنسيق هيكلية الـ HTML التلقائية', value: 'مفعل (p, strong, ul, li)' },
      ],
    },
    {
      title: 'تفضيلات محركات البحث (SEO)',
      icon: LineChart,
      items: [
        { label: 'الكلمات الدلالية الموصى بها لكل منتج', value: 'توليد تلقائي (5 - 8 كلمات مفتاحية)' },
        { label: 'طول عنوان محركات البحث المفضل', value: '50 - 60 حرفاً' },
        { label: 'طول وصف Meta Description المفضل', value: '120 - 160 حرفاً' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none" dir="rtl">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-navy">إعدادات تطبيق بروز</h2>
          <p className="text-xs text-slate-gray mt-1">تخصيص تفضيلات صياغة الأوصاف ومعايير تحسين محركات البحث لمتجرك.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          حالة الميزة: قريباً
        </span>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
        {settingsSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-3 border-b border-slate-100">
                <Icon className="w-4 h-4 text-[#5B4DFF]" />
                {section.title}
              </h3>
              
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-start gap-4 text-xs">
                    <span className="text-slate-gray font-medium">{item.label}:</span>
                    <span className="text-navy font-bold text-left">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-gray leading-relaxed">
        * يتم تسيير معالجة المحتوى وتحليله مباشرة عبر خوادم بروز المشفرة دون الحاجة لطلب أي مفاتيح تشغيل خارجية من التاجر لضمان أفضل تجربة استخدام وأقصى درجات الحماية.
      </div>
    </div>
  );
}
