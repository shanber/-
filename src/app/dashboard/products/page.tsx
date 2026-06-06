import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import ProductsListClient from './ProductsListClient';

export default async function ProductsListPage() {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    redirect('/login');
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId }
  });

  if (!merchant) {
    redirect('/login');
  }

  return (
    <ProductsListClient storeName={merchant.storeName} />
  );
}
export const dynamic = 'force-dynamic';
