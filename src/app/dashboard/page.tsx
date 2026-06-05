import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { dbService } from '@/lib/dbService';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const merchantId = await getSessionMerchantId();
  if (!merchantId) {
    redirect('/login');
  }

  const merchant = await dbService.getMerchant(merchantId);
  if (!merchant) {
    redirect('/login');
  }

  const stats = await dbService.getDashboardStats(merchantId);

  const lastAnalyzedMapped = stats.lastAnalyzed.map((p: any) => ({
    id: p.id,
    name: p.name,
    categoryName: p.categoryName,
    imageUrl: p.imageUrl,
    seoScore: p.seoScore,
    analysisStatus: p.analysisStatus,
    lastAnalyzedAt: p.lastAnalyzedAt 
      ? typeof p.lastAnalyzedAt === 'string'
        ? p.lastAnalyzedAt
        : p.lastAnalyzedAt.toISOString() 
      : null,
  }));

  const initialStats = {
    totalProducts: stats.totalProducts,
    needsOptimization: stats.needsOptimization,
    averageSeo: stats.averageSeo,
    lastAnalyzed: lastAnalyzedMapped,
  };

  return (
    <DashboardContent
      initialStats={initialStats}
      storeName={merchant.storeName}
      hasWriteAccess={merchant.hasWriteAccess}
    />
  );
}
export const dynamic = 'force-dynamic';
