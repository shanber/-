'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutGrid, 
  Database, 
  Link2, 
  LineChart, 
  History, 
  Settings, 
  Store, 
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface DashboardSidebarProps {
  storeName: string | null;
  isConnected: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DashboardSidebar({
  storeName,
  isConnected,
  isOpen,
  setIsOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: Home, desc: 'الرجوع للصفحة التعريفية' },
    { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutGrid, desc: 'ملخص وحالة التطبيق' },
    { href: '/dashboard/products', label: 'المنتجات', icon: Database, desc: 'إدارة وتحسين المنتجات' },
    { href: '/dashboard/connection', label: 'حالة الربط', icon: Link2, desc: 'تفاصيل ربط متجر سلة' },
    { href: '/dashboard/insights', label: 'التحليلات', icon: LineChart, desc: 'فرص تحسين SEO' },
    { href: '/dashboard/history', label: 'سجل التحسينات', icon: History, desc: 'العمليات السابقة' },
    { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings, desc: 'إعدادات بروز' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 p-6 select-none">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#5B4DFF] flex items-center justify-center font-black text-white text-lg">
            ب
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            بروز <span className="text-[#5B4DFF]">.</span>
          </span>
        </Link>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-grow mt-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-[#5B4DFF] text-white shadow-md shadow-[#5B4DFF]/10 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-right">
                <span className="text-sm block">{item.label}</span>
                <span className={`text-[10px] block font-normal leading-none mt-0.5 ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                  {item.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Connection Status Panel */}
      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        {isConnected ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">المتجر المتصل:</span>
                <span className="text-xs font-bold text-white block truncate max-w-[150px]" title={storeName || ''}>
                  {storeName}
                </span>
                <span className="inline-block mt-1 text-[9px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/10">
                  متصل بنجاح
                </span>
              </div>
            </div>
            
            <a
              href="/api/salla/auth"
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-[11px] transition-all"
            >
              <Store className="w-3.5 h-3.5" /> إعادة ربط المتجر
            </a>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-right">
                <span className="text-xs font-bold text-white block">متجر غير متصل</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  اربط حسابك بسلة لمزامنة منتجاتك.
                </span>
              </div>
            </div>

            <a
              href="/api/salla/auth"
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-[#5B4DFF] hover:bg-[#4a3ee6] text-white font-bold py-2 px-4 rounded-xl text-[11px] transition-all shadow-md shadow-[#5B4DFF]/15"
            >
              <Store className="w-3.5 h-3.5" /> ربط متجر سلة الآن
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed top-0 right-0 bottom-0 w-64 z-20 hidden md:block border-l border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          {/* Sidebar Area */}
          <div className="w-64 h-full shrink-0 animate-slide-in-right">
            {sidebarContent}
          </div>
          {/* Overlay area to close */}
          <div className="flex-grow" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
