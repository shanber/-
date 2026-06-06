'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, ExternalLink } from 'lucide-react';

interface DashboardTopbarProps {
  storeName: string | null;
  isConnected: boolean;
  toggleSidebar: () => void;
}

export default function DashboardTopbar({
  storeName,
  isConnected,
  toggleSidebar,
}: DashboardTopbarProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'لوحة التحكم';
    if (path.startsWith('/dashboard/products')) {
      if (path.match(/\/dashboard\/products\/[a-zA-Z0-9-]+/)) {
        return 'تفاصيل وتحسين المنتج بالذكاء الاصطناعي';
      }
      return 'منتجات متجر سلة';
    }
    if (path === '/dashboard/connection') return 'حالة ربط المتجر';
    if (path === '/dashboard/insights') return 'التحليلات وفرص تحسين SEO';
    if (path === '/dashboard/history') return 'سجل عمليات التحسين';
    if (path === '/dashboard/settings') return 'إعدادات بروز';
    return 'لوحة التحكم';
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-[#475569] transition-colors"
          title="افتح القائمة الجانبية"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        
        <h1 className="text-sm sm:text-base md:text-lg font-black text-[#111827]">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Quick Links & Connected Badge */}
      <div className="flex items-center gap-4">
        {/* Connection Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 px-3 py-1.5 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold text-[#475569] max-w-[120px] truncate">
            {isConnected ? storeName : 'غير متصل'}
          </span>
        </div>

        {/* Return to Home Landing Page */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#475569] hover:text-[#5B4DFF] transition-colors bg-[#F8FAFC] hover:bg-[#5B4DFF]/5 border border-slate-200 hover:border-[#5B4DFF]/10 px-3 py-1.5 rounded-xl"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">الرئيسية</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </Link>
      </div>
    </header>
  );
}
