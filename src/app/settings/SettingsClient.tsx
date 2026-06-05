'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Settings,
  LayoutGrid,
  Database,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Link2,
  Trash2,
  RefreshCw,
  LogOut,
  ArrowLeft
} from 'lucide-react';

interface SettingsClientProps {
  storeName: string;
  hasWriteAccess: boolean;
  appUrl: string;
}

export default function SettingsClient({ 
  storeName, 
  hasWriteAccess,
  appUrl 
}: SettingsClientProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callbackUrl = `${appUrl}/api/salla/callback`;
  const webhookUrl = `${appUrl}/api/salla/webhook`;
  const settingsUrl = `${appUrl}/settings`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDisconnect = async () => {
    const confirmed = confirm(
      'تحذير: هل أنت متأكد من رغبتك في إلغاء ربط المتجر وحذف كافة المنتجات والتفاصيل المزامنة وسجلات التحسين؟ لا يمكن التراجع عن هذا الإجراء.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/salla/disconnect', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/';
      } else {
        setErrorMessage(data.error || 'فشل إلغاء ربط المتجر.');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم لإلغاء ربط المتجر.');
    } finally {
      setIsDeleting(false);
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
              <Link href="/products" className="text-slate-300 hover:text-white transition-colors">المنتجات</Link>
              <Link href="/settings" className="text-white font-bold border-b-2 border-primary pb-1">الإعدادات</Link>
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

      {/* Main Layout */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 p-3 rounded-xl mb-6 shadow-sm">
          <Link href="/dashboard" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <LayoutGrid className="w-4 h-4" /> لوحة التحكم
          </Link>
          <Link href="/products" className="text-slate-gray text-xs flex flex-col items-center gap-1">
            <Database className="w-4 h-4" /> المنتجات
          </Link>
          <Link href="/settings" className="text-primary font-bold text-xs flex flex-col items-center gap-1">
            <Settings className="w-4 h-4" /> الإعدادات
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-navy">إعدادات التطبيق</h1>
            <p className="text-sm text-slate-gray mt-1">
              إدارة اتصال المتجر والروابط الخاصة بالتكامل مع منصة شركاء سلة.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-slate-gray hover:text-navy flex items-center gap-1">
             لوحة التحكم <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl mb-6 border bg-red-50 border-red-200 text-red-800 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Section 1: Connection Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">حالة ربط المتجر</h3>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <div>
              <span className="text-xs text-slate-gray">اسم المتجر المربوط:</span>
              <h4 className="text-md font-bold text-navy mt-1">{storeName}</h4>
            </div>

            <div className="flex items-center gap-2">
              {hasWriteAccess ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> صلاحية القراءة والتعديل نشطة
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <ShieldAlert className="w-4 h-4" /> صلاحية قراءة فقط
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!hasWriteAccess && (
              <Link 
                href="/api/salla/auth?write=true"
                className="flex-grow inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
              >
                تفعيل صلاحية التعديل على سلة
              </Link>
            )}

            <button
              onClick={handleDisconnect}
              disabled={isDeleting}
              className={`inline-flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 rounded-xl text-xs border transition-all ${
                isDeleting 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'جاري إلغاء ربط المتجر...' : 'حذف ربط المتجر والبيانات بالكامل'}
            </button>
          </div>
        </div>

        {/* Section 2: Integration URLs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">روابط منصة شركاء سله</h3>
          <p className="text-xs text-slate-gray mb-6 leading-relaxed">
            انسخ الروابط التالية والصقها في الحقول المقابلة لها في إعدادات تطبيقك على بوابة مطوري سلة (Salla Partners Portal) لتفعيل استلام التنبيهات وإكمال تسجيل الدخول:
          </p>

          <div className="space-y-5">
            {/* Callback URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-navy">رابط الرد (Callback URL):</span>
                <button 
                  onClick={() => handleCopy(callbackUrl, 'callback')}
                  className="text-primary hover:underline text-xs flex items-center gap-1 font-bold"
                >
                  {copiedField === 'callback' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'callback' ? 'تم النسخ!' : 'نسخ الرابط'}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-xs text-navy select-all break-all direction-ltr text-right">
                {callbackUrl}
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-navy">رابط التنبيهات (Webhook URL):</span>
                <button 
                  onClick={() => handleCopy(webhookUrl, 'webhook')}
                  className="text-primary hover:underline text-xs flex items-center gap-1 font-bold"
                >
                  {copiedField === 'webhook' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'webhook' ? 'تم النسخ!' : 'نسخ الرابط'}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-xs text-navy select-all break-all direction-ltr text-right">
                {webhookUrl}
              </div>
            </div>

            {/* Settings URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-navy">رابط الإعدادات (Settings URL):</span>
                <button 
                  onClick={() => handleCopy(settingsUrl, 'settings')}
                  className="text-primary hover:underline text-xs flex items-center gap-1 font-bold"
                >
                  {copiedField === 'settings' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'settings' ? 'تم النسخ!' : 'نسخ الرابط'}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-xs text-navy select-all break-all direction-ltr text-right">
                {settingsUrl}
              </div>
            </div>
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
