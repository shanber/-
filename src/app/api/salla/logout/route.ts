import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تسجيل الخروج.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
