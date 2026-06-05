import { NextRequest, NextResponse } from 'next/server';
import { getSallaAuthUrl } from '@/lib/salla';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const write = searchParams.get('write') === 'true';
    
    // Build and redirect to Salla OAuth URL
    const sallaUrl = getSallaAuthUrl(write);
    return NextResponse.redirect(sallaUrl);
  } catch (error: any) {
    console.error('Salla Auth redirect error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء الاتصال بمنصة سلة.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
