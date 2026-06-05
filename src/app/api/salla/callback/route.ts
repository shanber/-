import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getSallaMerchantInfo } from '@/lib/salla';
import { dbService } from '@/lib/dbService';
import { setSessionMerchantId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent('رمز التفويض من سلة مفقود.')}`);
    }
    
    // Exchange OAuth code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Retrieve merchant profile
    const merchantInfo = await getSallaMerchantInfo(tokens.access_token);
    
    // Check scopes
    const scopes = tokens.scope?.split(' ') || [];
    const hasWriteAccess = scopes.includes('products.read_write');
    
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    
    // Store merchant details and encrypted credentials
    const merchant = await dbService.upsertMerchant(
      merchantInfo.id,
      merchantInfo.store_name,
      tokens.access_token,
      tokens.refresh_token,
      expiresAt,
      hasWriteAccess
    );
    
    // Setup encrypted merchant session
    await setSessionMerchantId(merchant.id);
    
    // Redirect to dashboard
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error: any) {
    console.error('Salla callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/?error=${encodeURIComponent(
        error.message || 'حدث خطأ غير متوقع أثناء ربط المتجر.'
      )}`
    );
  }
}
export const dynamic = 'force-dynamic';
