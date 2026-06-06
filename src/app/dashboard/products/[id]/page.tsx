import { redirect } from 'next/navigation';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { calculateSeoScore } from '@/lib/seo';
import ProductDetailsClient from './ProductDetailsClient';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

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

  let productData = null;

  if (process.env.MOCK_MODE === 'true') {
    // Generate mock details based on the selected ID for local testing
    if (productId === 'prod_1') {
      productData = {
        id: 'prod_1',
        name: 'تمر خلاص القصيم فاخر 1 كيلو',
        description: 'تمر خلاص خلاص الأحساء والقصيم منتقى بعناية فائقة، مغلف حراري لحفظ الجودة والطعم اللذيذ.',
        price: 45.0,
        imageUrl: 'https://images.unsplash.com/photo-1596568129885-f38f128551ec?auto=format&fit=crop&w=400&q=80',
        categoryName: 'التمور الفاخرة',
        seoScore: 65,
      };
    } else if (productId === 'prod_2') {
      productData = {
        id: 'prod_2',
        name: 'قهوة سعودية شقراء بالهيل والزعفران 500 جرام',
        description: 'قهوة عربية سعودية شقراء محضرة من أجود حبوب البن الهرري مع الهيل الفاخر والزعفران الأصيل.',
        price: 65.0,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
        categoryName: 'القهوة العربية',
        seoScore: 30,
      };
    } else {
      productData = {
        id: productId,
        name: 'منتج تجريبي فاخر',
        description: 'وصف قصير للمنتج للتجربة.',
        price: 100.0,
        imageUrl: null,
        categoryName: 'عام',
        seoScore: 20,
      };
    }
  } else {
    // Fetch live product details from Salla API
    let accessToken = '';
    try {
      accessToken = decrypt(merchant.accessTokenEncrypted);
    } catch (err) {
      redirect('/login');
    }

    try {
      const apiBase = process.env.SALLA_API_BASE || 'https://api.salla.dev/admin/v2';
      const sallaRes = await fetch(`${apiBase}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!sallaRes.ok) {
        redirect('/dashboard/products');
      }

      const sallaData = await sallaRes.json();
      const item = sallaData.data || {};
      
      const keywords = item.metadata?.keywords || '';
      const altTexts = item.images?.map((img: any) => img.alt || '') || [];
      const score = calculateSeoScore(
        item.name || '',
        item.description || '',
        item.metadata?.title || '',
        item.metadata?.description || '',
        keywords,
        altTexts
      );

      productData = {
        id: String(item.id),
        name: item.name || '',
        description: item.description || '',
        price: item.price?.amount ? parseFloat(item.price.amount) : null,
        imageUrl: item.main_image || null,
        categoryName: item.categories?.[0]?.name || null,
        seoScore: score,
      };
    } catch (error) {
      console.error('Failed to fetch product on server:', error);
      redirect('/dashboard/products');
    }
  }

  return (
    <ProductDetailsClient
      product={productData}
      storeName={merchant.storeName}
    />
  );
}
export const dynamic = 'force-dynamic';
