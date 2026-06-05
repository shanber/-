import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    redirect('/login');
  }

  const merchant = await dbService.getMerchant(merchantId);
  if (!merchant) {
    redirect('/login');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <SettingsClient
      storeName={merchant.storeName}
      hasWriteAccess={merchant.hasWriteAccess}
      appUrl={appUrl}
    />
  );
}
export const dynamic = 'force-dynamic';
