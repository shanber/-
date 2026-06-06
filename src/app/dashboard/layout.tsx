import { ReactNode } from 'react';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let storeName: string | null = null;
  let isConnected = false;

  try {
    const merchantId = await getSessionMerchantId();
    if (merchantId) {
      const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId }
      });
      if (merchant) {
        storeName = merchant.storeName;
        isConnected = true;
      }
    }
  } catch (error) {
    console.error('Failed to fetch merchant session in layout:', error);
    // Gracefully handle db/session errors by falling back to unconnected state
  }

  return (
    <DashboardLayoutShell storeName={storeName} isConnected={isConnected}>
      {children}
    </DashboardLayoutShell>
  );
}

export const dynamic = 'force-dynamic';
