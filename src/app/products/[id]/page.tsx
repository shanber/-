import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import ProductEditorClient from './ProductEditorClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    redirect('/login');
  }

  const merchant = await dbService.getMerchant(merchantId);
  if (!merchant) {
    redirect('/login');
  }

  const product = await dbService.getProductById(productId);
  if (!product || product.merchantId !== merchantId) {
    redirect('/products');
  }

  // Fetch optimization attempts for this product
  const historyList = await dbService.getOptimizationHistory(merchantId, productId);

  // Map product and history structures to pass serializable props
  const mappedProduct = {
    id: product.id,
    sallaProductId: product.sallaProductId,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    categoryName: product.categoryName,
    seoScore: product.seoScore,
    rawJson: product.rawJson,
  };

  const mappedHistory = historyList.map((h: any) => ({
    id: h.id,
    mode: h.mode,
    oldTitle: h.oldTitle,
    oldDescription: h.oldDescription,
    suggestedTitle: h.suggestedTitle,
    suggestedShortDescription: h.suggestedShortDescription,
    suggestedDescription: h.suggestedDescription,
    suggestedMetaTitle: h.suggestedMetaTitle,
    suggestedMetaDescription: h.suggestedMetaDescription,
    suggestedKeywordsJson: h.suggestedKeywordsJson,
    suggestedAltTextJson: h.suggestedAltTextJson,
    seoNotesJson: h.seoNotesJson,
    beforeScore: h.beforeScore,
    afterScore: h.afterScore,
    appliedToSalla: h.appliedToSalla,
    createdAt: typeof h.createdAt === 'string'
      ? h.createdAt
      : h.createdAt.toISOString(),
  }));

  return (
    <ProductEditorClient
      product={mappedProduct}
      history={mappedHistory}
      hasWriteAccess={merchant.hasWriteAccess}
      storeName={merchant.storeName}
    />
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;
