import { cookies } from 'next/headers';
import { encrypt, decrypt } from './encryption';

const COOKIE_NAME = 'boroz_session';

export async function getSessionMerchantId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    
    const decryptedId = decrypt(sessionCookie.value);
    return decryptedId || null;
  } catch (error) {
    console.error('Failed to decrypt session cookie:', error);
    return null;
  }
}

export async function setSessionMerchantId(merchantId: string): Promise<void> {
  const encryptedId = encrypt(merchantId);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, encryptedId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });
}
