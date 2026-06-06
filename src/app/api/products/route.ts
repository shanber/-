import { NextRequest, NextResponse } from 'next/server';
import { getSessionMerchantId } from '@/lib/session';
import { prisma } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/encryption';
import { fetchSallaProducts, refreshSallaToken } from '@/lib/salla';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Session & merchantId
    const merchantId = await getSessionMerchantId();
    if (!merchantId) {
      return NextResponse.json(
        { error: 'غير مصرح بالعملية. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      );
    }

    // 2. Fetch Merchant from Database
    let merchant;
    try {
      merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
      });
    } catch (dbError: any) {
      console.error('Database error fetching merchant:', dbError);
      return NextResponse.json(
        { error: `خطأ في قاعدة البيانات: ${dbError.message || dbError}` },
        { status: 500 }
      );
    }

    if (!merchant) {
      return NextResponse.json(
        { error: 'لم يتم العثور على التاجر في قاعدة البيانات. يرجى إعادة ربط المتجر.' },
        { status: 404 }
      );
    }

    // 3. Check Token Expiration & Decrypt
    let accessToken = '';
    const now = new Date();
    const isTokenExpired = new Date(merchant.tokenExpiresAt).getTime() - 60000 < now.getTime();

    if (isTokenExpired) {
      // Attempt to refresh the token using refreshSallaToken
      try {
        console.log('Token is expired. Attempting refresh...');
        const decryptedRefreshToken = decrypt(merchant.refreshTokenEncrypted);
        const newTokens = await refreshSallaToken(decryptedRefreshToken);
        
        // Save new tokens to DB
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
        await prisma.merchant.update({
          where: { id: merchantId },
          data: {
            accessTokenEncrypted: encrypt(newTokens.access_token),
            refreshTokenEncrypted: encrypt(newTokens.refresh_token),
            tokenExpiresAt: expiresAt,
          },
        });
        
        accessToken = newTokens.access_token;
        console.log('Token refreshed successfully.');
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        return NextResponse.json(
          { 
            error: 'انتهت صلاحية رمز الوصول وفشلت عملية التجديد تلقائياً. يرجى إعادة تسجيل الدخول وربط المتجر.',
            details: refreshError.message || refreshError
          },
          { status: 401 }
        );
      }
    } else {
      // Decrypt accessToken
      try {
        accessToken = decrypt(merchant.accessTokenEncrypted);
      } catch (decryptError: any) {
        console.error('Decryption error:', decryptError);
        return NextResponse.json(
          { error: 'فشل فك تشفير توكن متجر سلة. يرجى إعادة ربط المتجر.' },
          { status: 500 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'رمز الوصول الخاص بالمتجر مفقود أو تالف.' },
        { status: 401 }
      );
    }

    // 4. Fetch Products from Salla API
    try {
      const sallaProducts = await fetchSallaProducts(accessToken);
      return NextResponse.json({ success: true, products: sallaProducts });
    } catch (sallaError: any) {
      console.error('Salla API error fetching products:', sallaError);
      return NextResponse.json(
        { 
          error: 'فشل جلب المنتجات من منصة سلة (خطأ من خوادم سلة API).',
          details: sallaError.message || sallaError
        },
        { status: 502 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in GET /api/products:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
