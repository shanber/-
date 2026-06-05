import { encrypt, decrypt } from './encryption';

export interface SallaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // in seconds
  token_type: string;
  scope?: string;
}

export interface SallaMerchantInfo {
  id: string;
  name: string;
  email: string;
  store_name: string;
  domain: string;
}

export interface SallaProduct {
  id: string;
  name: string;
  description: string;
  price?: number;
  main_image?: string;
  category?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  images?: Array<{ url: string; alt?: string }>;
}

export function validateEnv() {
  if (process.env.MOCK_MODE === 'true') {
    return;
  }
  const required = [
    'SALLA_CLIENT_ID',
    'SALLA_CLIENT_SECRET',
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'APP_ENCRYPTION_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `الملفات والرموز المطلوبة للتشغيل ناقصة: ${missing.join(', ')}. يرجى تعيين MOCK_MODE=true للتشغيل التجريبي.`
    );
  }
}

export function getSallaAuthUrl(writeAccess = false, state = ''): string {
  validateEnv();
  
  if (process.env.MOCK_MODE === 'true') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${appUrl}/api/salla/callback?code=mock_code_123&state=${state}`;
  }

  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.SALLA_REDIRECT_URI || '');
  const authBase = process.env.SALLA_AUTH_URL || 'https://accounts.salla.sa/oauth2/auth';
  
  const scopes = writeAccess 
    ? ['products.read', 'products.read_write', 'offline_access']
    : ['products.read', 'offline_access'];
    
  const scopeStr = encodeURIComponent(scopes.join(' '));
  
  return `${authBase}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopeStr}&state=${state}`;
}

export async function exchangeCodeForTokens(code: string): Promise<SallaTokenResponse> {
  validateEnv();

  if (process.env.MOCK_MODE === 'true') {
    return {
      access_token: 'mock_access_token_xyz',
      refresh_token: 'mock_refresh_token_xyz',
      expires_in: 86400,
      token_type: 'Bearer',
      scope: 'products.read offline_access',
    };
  }

  const tokenUrl = process.env.SALLA_TOKEN_URL || 'https://accounts.salla.sa/oauth2/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SALLA_CLIENT_ID || '',
      client_secret: process.env.SALLA_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.SALLA_REDIRECT_URI || '',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to exchange authorization code: ${errorData}`);
  }

  return response.json();
}

export async function refreshSallaToken(refreshToken: string): Promise<SallaTokenResponse> {
  validateEnv();

  if (process.env.MOCK_MODE === 'true') {
    return {
      access_token: 'mock_refreshed_access_token_xyz',
      refresh_token: 'mock_refreshed_refresh_token_xyz',
      expires_in: 86400,
      token_type: 'Bearer',
    };
  }

  const tokenUrl = process.env.SALLA_TOKEN_URL || 'https://accounts.salla.sa/oauth2/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SALLA_CLIENT_ID || '',
      client_secret: process.env.SALLA_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to refresh token: ${errorData}`);
  }

  return response.json();
}

export async function getSallaMerchantInfo(accessToken: string): Promise<SallaMerchantInfo> {
  if (process.env.MOCK_MODE === 'true') {
    return {
      id: 'mock_merchant_salla_id',
      name: 'متجر بروز التجريبي',
      email: 'demo@boroz.sa',
      store_name: 'متجر بروز التجريبي',
      domain: 'demo-store.salla.sa',
    };
  }

  const apiBase = process.env.SALLA_API_BASE || 'https://api.salla.dev/admin/v2';
  const response = await fetch(`${apiBase}/user/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch merchant info: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: String(data.data.id),
    name: data.data.name,
    email: data.data.email,
    store_name: data.data.store.name,
    domain: data.data.store.domain,
  };
}

export async function fetchSallaProducts(accessToken: string): Promise<SallaProduct[]> {
  if (process.env.MOCK_MODE === 'true') {
    // Return high quality dummy products in mock mode
    return [
      {
        id: 'prod_1',
        name: 'تمر خلاص القصيم فاخر 1 كيلو',
        description: 'تمر خلاص خلاص الأحساء والقصيم منتقى بعناية فائقة، مغلف حراري لحفظ الجودة والطعم اللذيذ.',
        price: 45.0,
        main_image: 'https://images.unsplash.com/photo-1596568129885-f38f128551ec?auto=format&fit=crop&w=400&q=80',
        category: 'التمور الفاخرة',
        metadata: {
          title: 'خلاص القصيم فاخر',
          description: 'تمر خلاص القصيم درجه اولى مغلف',
          keywords: 'تمر, خلاص, القصيم, تمور',
        },
      },
      {
        id: 'prod_2',
        name: 'قهوة سعودية شقراء بالهيل والزعفران 500 جرام',
        description: 'قهوة عربية سعودية شقراء محضرة من أجود حبوب البن الهرري مع الهيل الفاخر والزعفران الأصيل.',
        price: 65.0,
        main_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
        category: 'القهوة العربية',
        metadata: {
          title: '',
          description: '',
          keywords: '',
        },
      },
      {
        id: 'prod_3',
        name: 'عسل سدر طبيعي جبل الغابة 250 جرام',
        description: 'عسل سدر أصلي مستخلص من زهور السدر في جبال المملكة العربية السعودية، طبيعي 100% بدون إضافات.',
        price: 120.0,
        main_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
        category: 'العسل الطبيعي',
        metadata: {
          title: 'عسل سدر للبيع',
          description: 'احصل على افضل عسل سدر طبيعي من متجرنا بسعر مميز',
          keywords: 'عسل, سدر, طبيعي',
        },
      },
      {
        id: 'prod_4',
        name: 'سجادة صلاة فاخرة مبطنة ومريحة',
        description: 'سجادة صلاة مصممة لتوفير أقصى درجات الراحة أثناء الصلاة بفضل الحشوة الناعمة والتطريز الإسلامي الفخم.',
        price: 89.0,
        main_image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
        category: 'مستلزمات الصلاة',
        metadata: {
          title: 'سجادة صلاة مريحة مبطنة',
          description: 'سجادة صلاة مريحة لمن يعاني من آلام المفاصل',
          keywords: 'سجادة, صلاة, مريحة, طبي',
        },
      },
    ];
  }

  const apiBase = process.env.SALLA_API_BASE || 'https://api.salla.dev/admin/v2';
  
  // Salla API fetches products with pagination. We fetch page 1 (up to 20 products) for standard use.
  const response = await fetch(`${apiBase}/products?per_page=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Salla products: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.data || []).map((item: any) => ({
    id: String(item.id),
    name: item.name,
    description: item.description,
    price: item.price?.amount ? parseFloat(item.price.amount) : undefined,
    main_image: item.main_image,
    category: item.categories?.[0]?.name || null,
    metadata: {
      title: item.metadata?.title || '',
      description: item.metadata?.description || '',
      keywords: item.metadata?.keywords || '',
    },
  }));
}

export async function updateSallaProduct(
  accessToken: string,
  sallaProductId: string,
  updatedData: {
    name?: string;
    description?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string;
  }
): Promise<void> {
  if (process.env.MOCK_MODE === 'true') {
    console.log(`[Mock Salla Update] Product ${sallaProductId} updated:`, updatedData);
    return;
  }

  const apiBase = process.env.SALLA_API_BASE || 'https://api.salla.dev/admin/v2';
  
  // Format standard update payload for Salla
  const payload: Record<string, any> = {};
  if (updatedData.name) payload.name = updatedData.name;
  if (updatedData.description) payload.description = updatedData.description;
  
  // SEO Metadata fields
  if (updatedData.meta_title || updatedData.meta_description || updatedData.keywords) {
    payload.metadata = {
      title: updatedData.meta_title || '',
      description: updatedData.meta_description || '',
      keywords: updatedData.keywords || '',
    };
  }

  const response = await fetch(`${apiBase}/products/${sallaProductId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to update Salla product ${sallaProductId}: ${errorData}`);
  }
}
