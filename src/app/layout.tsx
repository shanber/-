import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "بروز | وصف أذكى، ظهور أوضح",
  description: "تطبيق ذكاء اصطناعي يساعد متاجر سلة على تحسين أوصاف المنتجات وجاهزيتها لمحركات البحث (SEO).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-light text-navy">
        {children}
      </body>
    </html>
  );
}
