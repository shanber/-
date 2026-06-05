import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    redirect('/login');
  }

  const merchant = await dbService.getMerchant(merchantId);
  if (!merchant) {
    redirect('/login');
  }

  const dbProducts = await dbService.getProducts(merchantId);

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    sallaProductId: p.sallaProductId,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    categoryName: p.categoryName,
    seoScore: p.seoScore,
    analysisStatus: p.analysisStatus,
    lastError: p.lastError,
    lastAnalyzedAt: p.lastAnalyzedAt 
      ? typeof p.lastAnalyzedAt === 'string'
        ? p.lastAnalyzedAt
        : p.lastAnalyzedAt.toISOString()
      : null,
  }));

  return (
    <ProductsClient
      products={products}
      storeName={merchant.storeName}
    />
  );
}
export const dynamic = 'force-dynamic';
