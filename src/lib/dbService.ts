import fs from 'fs';
import path from 'path';
import { prisma } from './db';
import { encrypt, decrypt } from './encryption';

const MOCK_DB_PATH = path.join(process.cwd(), 'mock_db.json');

interface MockSchema {
  merchants: any[];
  products: any[];
  history: any[];
  webhooks: any[];
}

// Helper to read Mock DB
function readMockDb(): MockSchema {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const defaultData: MockSchema = {
      merchants: [
        {
          id: 'mock_merchant_id',
          sallaMerchantId: 'mock_merchant_salla_id',
          storeName: 'متجر بروز التجريبي',
          accessTokenEncrypted: encrypt('mock_access_token_xyz'),
          refreshTokenEncrypted: encrypt('mock_refresh_token_xyz'),
          tokenExpiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
          hasWriteAccess: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      products: [
        {
          id: 'mock_prod_1',
          merchantId: 'mock_merchant_id',
          sallaProductId: 'prod_1',
          name: 'تمر خلاص القصيم فاخر 1 كيلو',
          description: 'تمر خلاص خلاص الأحساء والقصيم منتقى بعناية فائقة، مغلف حراري لحفظ الجودة والطعم اللذيذ.',
          price: 45.0,
          imageUrl: 'https://images.unsplash.com/photo-1596568129885-f38f128551ec?auto=format&fit=crop&w=400&q=80',
          categoryName: 'التمور الفاخرة',
          seoScore: 65,
          analysisStatus: 'pending',
          lastError: null,
          lastAnalyzedAt: null,
          rawJson: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mock_prod_2',
          merchantId: 'mock_merchant_id',
          sallaProductId: 'prod_2',
          name: 'قهوة سعودية شقراء بالهيل والزعفران 500 جرام',
          description: 'قهوة عربية سعودية شقراء محضرة من أجود حبوب البن الهرري مع الهيل الفاخر والزعفران الأصيل.',
          price: 65.0,
          imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
          categoryName: 'القهوة العربية',
          seoScore: 30,
          analysisStatus: 'pending',
          lastError: null,
          lastAnalyzedAt: null,
          rawJson: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mock_prod_3',
          merchantId: 'mock_merchant_id',
          sallaProductId: 'prod_3',
          name: 'عسل سدر طبيعي جبل الغابة 250 جرام',
          description: 'عسل سدر أصلي مستخلص من زهور السدر في جبال المملكة العربية السعودية، طبيعي 100% بدون إضافات.',
          price: 120.0,
          imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
          categoryName: 'العسل الطبيعي',
          seoScore: 55,
          analysisStatus: 'pending',
          lastError: null,
          lastAnalyzedAt: null,
          rawJson: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mock_prod_4',
          merchantId: 'mock_merchant_id',
          sallaProductId: 'prod_4',
          name: 'سجادة صلاة فاخرة مبطنة ومريحة',
          description: 'سجادة صلاة مصممة لتوفير أقصى درجات الراحة أثناء الصلاة بفضل الحشوة الناعمة والتطريز الإسلامي الفخم.',
          price: 89.0,
          imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
          categoryName: 'مستلزمات الصلاة',
          seoScore: 40,
          analysisStatus: 'pending',
          lastError: null,
          lastAnalyzedAt: null,
          rawJson: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      history: [],
      webhooks: [],
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
  } catch {
    // If corruption, reset
    return { merchants: [], products: [], history: [], webhooks: [] };
  }
}

// Helper to write Mock DB
function writeMockDb(data: MockSchema) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export const dbService = {
  // MERCHANT SERVICES
  async getMerchant(id: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      return db.merchants.find((m) => m.id === id) || null;
    }
    return prisma.merchant.findUnique({ where: { id } });
  },

  async findMerchantBySallaId(sallaMerchantId: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      return db.merchants.find((m) => m.sallaMerchantId === sallaMerchantId) || null;
    }
    return prisma.merchant.findUnique({ where: { sallaMerchantId } });
  },

  async upsertMerchant(
    sallaMerchantId: string,
    storeName: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    hasWriteAccess = false
  ) {
    const accessTokenEncrypted = encrypt(accessToken);
    const refreshTokenEncrypted = encrypt(refreshToken);

    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      let merchant = db.merchants.find((m) => m.sallaMerchantId === sallaMerchantId);
      
      if (merchant) {
        merchant.storeName = storeName;
        merchant.accessTokenEncrypted = accessTokenEncrypted;
        merchant.refreshTokenEncrypted = refreshTokenEncrypted;
        merchant.tokenExpiresAt = expiresAt.toISOString();
        // If write access is already granted, keep it true, or update if new request granted write access
        merchant.hasWriteAccess = merchant.hasWriteAccess || hasWriteAccess;
        merchant.updatedAt = new Date().toISOString();
      } else {
        merchant = {
          id: `merchant_${Math.random().toString(36).substring(2, 9)}`,
          sallaMerchantId,
          storeName,
          accessTokenEncrypted,
          refreshTokenEncrypted,
          tokenExpiresAt: expiresAt.toISOString(),
          hasWriteAccess,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.merchants.push(merchant);
      }
      
      writeMockDb(db);
      return merchant;
    }

    // Prisma implementation
    // We should upsert based on sallaMerchantId
    return prisma.merchant.upsert({
      where: { sallaMerchantId },
      update: {
        storeName,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt: expiresAt,
        hasWriteAccess,
      },
      create: {
        sallaMerchantId,
        storeName,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt: expiresAt,
        hasWriteAccess,
      },
    });
  },

  async deleteMerchant(id: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      db.merchants = db.merchants.filter((m) => m.id !== id);
      db.products = db.products.filter((p) => p.merchantId !== id);
      db.history = db.history.filter((h) => h.merchantId !== id);
      writeMockDb(db);
      return true;
    }
    await prisma.merchant.delete({ where: { id } });
    return true;
  },

  // PRODUCT SERVICES
  async getProducts(merchantId: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      return db.products.filter((p) => p.merchantId === merchantId);
    }
    return prisma.product.findMany({
      where: { merchantId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getProduct(merchantId: string, sallaProductId: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      return db.products.find((p) => p.merchantId === merchantId && p.sallaProductId === sallaProductId) || null;
    }
    return prisma.product.findUnique({
      where: {
        merchantId_sallaProductId: {
          merchantId,
          sallaProductId,
        },
      },
    });
  },

  async getProductById(id: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      return db.products.find((p) => p.id === id) || null;
    }
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async upsertProduct(merchantId: string, sallaProductId: string, data: {
    name: string;
    description: string;
    price: number | null;
    imageUrl: string | null;
    categoryName: string | null;
    seoScore: number;
    rawJson: any;
  }) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      let product = db.products.find((p) => p.merchantId === merchantId && p.sallaProductId === sallaProductId);
      
      if (product) {
        product.name = data.name;
        product.description = data.description;
        product.price = data.price !== undefined ? data.price : product.price;
        product.imageUrl = data.imageUrl !== undefined ? data.imageUrl : product.imageUrl;
        product.categoryName = data.categoryName !== undefined ? data.categoryName : product.categoryName;
        // Don't overwrite existing analyzed status/score if syncing, unless we want to reset
        if (product.analysisStatus !== 'analyzed') {
          product.seoScore = data.seoScore;
        }
        product.rawJson = data.rawJson;
        product.updatedAt = new Date().toISOString();
      } else {
        product = {
          id: `prod_${Math.random().toString(36).substring(2, 9)}`,
          merchantId,
          sallaProductId,
          name: data.name,
          description: data.description,
          price: data.price || null,
          imageUrl: data.imageUrl || null,
          categoryName: data.categoryName || null,
          seoScore: data.seoScore,
          analysisStatus: 'pending',
          lastError: null,
          lastAnalyzedAt: null,
          rawJson: data.rawJson,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.products.push(product);
      }
      
      writeMockDb(db);
      return product;
    }

    return prisma.product.upsert({
      where: {
        merchantId_sallaProductId: {
          merchantId,
          sallaProductId,
        },
      },
      update: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryName: data.categoryName,
        rawJson: data.rawJson,
      },
      create: {
        merchantId,
        sallaProductId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryName: data.categoryName,
        seoScore: data.seoScore,
        analysisStatus: 'pending',
        rawJson: data.rawJson,
      },
    });
  },

  async updateProductStatus(
    productId: string,
    status: 'pending' | 'analyzed' | 'failed',
    lastError: string | null = null,
    seoScore?: number,
    lastAnalyzedAt?: Date
  ) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      const product = db.products.find((p) => p.id === productId);
      if (product) {
        product.analysisStatus = status;
        product.lastError = lastError;
        if (seoScore !== undefined) product.seoScore = seoScore;
        if (lastAnalyzedAt !== undefined) product.lastAnalyzedAt = lastAnalyzedAt.toISOString();
        product.updatedAt = new Date().toISOString();
        writeMockDb(db);
      }
      return product;
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        analysisStatus: status,
        lastError,
        ...(seoScore !== undefined ? { seoScore } : {}),
        ...(lastAnalyzedAt !== undefined ? { lastAnalyzedAt } : {}),
      },
    });
  },

  // OPTIMIZATION HISTORY SERVICES
  async saveOptimizationHistory(
    merchantId: string,
    productId: string,
    data: {
      mode: string;
      oldTitle: string;
      oldDescription: string;
      suggestedTitle: string;
      suggestedShortDescription: string;
      suggestedDescription: string;
      suggestedMetaTitle: string;
      suggestedMetaDescription: string;
      suggestedKeywords: string[];
      suggestedAltTexts: string[];
      seoNotes: string[];
      beforeScore: number;
      afterScore: number;
      appliedToSalla: boolean;
    }
  ) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      const historyRecord = {
        id: `hist_${Math.random().toString(36).substring(2, 9)}`,
        merchantId,
        productId,
        mode: data.mode,
        oldTitle: data.oldTitle,
        oldDescription: data.oldDescription,
        suggestedTitle: data.suggestedTitle,
        suggestedShortDescription: data.suggestedShortDescription,
        suggestedDescription: data.suggestedDescription,
        suggestedMetaTitle: data.suggestedMetaTitle,
        suggestedMetaDescription: data.suggestedMetaDescription,
        suggestedKeywordsJson: data.suggestedKeywords,
        suggestedAltTextJson: data.suggestedAltTexts,
        seoNotesJson: data.seoNotes,
        beforeScore: data.beforeScore,
        afterScore: data.afterScore,
        appliedToSalla: data.appliedToSalla,
        createdAt: new Date().toISOString(),
      };
      db.history.push(historyRecord);
      writeMockDb(db);
      return historyRecord;
    }

    return prisma.optimizationHistory.create({
      data: {
        merchantId,
        productId,
        mode: data.mode,
        oldTitle: data.oldTitle,
        oldDescription: data.oldDescription,
        suggestedTitle: data.suggestedTitle,
        suggestedShortDescription: data.suggestedShortDescription,
        suggestedDescription: data.suggestedDescription,
        suggestedMetaTitle: data.suggestedMetaTitle,
        suggestedMetaDescription: data.suggestedMetaDescription,
        suggestedKeywordsJson: data.suggestedKeywords,
        suggestedAltTextJson: data.suggestedAltTexts,
        seoNotesJson: data.seoNotes,
        beforeScore: data.beforeScore,
        afterScore: data.afterScore,
        appliedToSalla: data.appliedToSalla,
      },
    });
  },

  async getOptimizationHistory(merchantId: string, productId?: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      let list = db.history.filter((h) => h.merchantId === merchantId);
      if (productId) {
        list = list.filter((h) => h.productId === productId);
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return prisma.optimizationHistory.findMany({
      where: {
        merchantId,
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // WEBHOOK EVENT SERVICES
  async saveWebhookEvent(merchantId: string | null, eventName: string, payload: any) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      const event = {
        id: `web_${Math.random().toString(36).substring(2, 9)}`,
        merchantId,
        eventName,
        payloadJson: payload,
        processed: false,
        createdAt: new Date().toISOString(),
      };
      db.webhooks.push(event);
      writeMockDb(db);
      return event;
    }

    return prisma.webhookEvent.create({
      data: {
        merchantId,
        eventName,
        payloadJson: payload,
        processed: false,
      },
    });
  },

  // STATS
  async getDashboardStats(merchantId: string) {
    if (process.env.MOCK_MODE === 'true') {
      const db = readMockDb();
      const products = db.products.filter((p) => p.merchantId === merchantId);
      
      const totalProducts = products.length;
      // Products needing optimization are those with score < 60
      const needsOptimization = products.filter((p) => p.seoScore < 60).length;
      
      const averageSeo = totalProducts > 0 
        ? Math.round(products.reduce((acc, p) => acc + p.seoScore, 0) / totalProducts) 
        : 0;

      // Last analyzed: filter and sort products that have been analyzed
      const lastAnalyzed = products
        .filter((p) => p.analysisStatus === 'analyzed' && p.lastAnalyzedAt)
        .sort((a, b) => new Date(b.lastAnalyzedAt).getTime() - new Date(a.lastAnalyzedAt).getTime())
        .slice(0, 5);

      return {
        totalProducts,
        needsOptimization,
        averageSeo,
        lastAnalyzed,
      };
    }

    const products = await prisma.product.findMany({
      where: { merchantId },
    });

    const totalProducts = products.length;
    const needsOptimization = products.filter((p) => p.seoScore < 60).length;
    const averageSeo = totalProducts > 0 
      ? Math.round(products.reduce((acc, p) => acc + p.seoScore, 0) / totalProducts) 
      : 0;

    const lastAnalyzed = await prisma.product.findMany({
      where: { 
        merchantId,
        analysisStatus: 'analyzed',
        lastAnalyzedAt: { not: null }
      },
      orderBy: { lastAnalyzedAt: 'desc' },
      take: 5
    });

    return {
      totalProducts,
      needsOptimization,
      averageSeo,
      lastAnalyzed,
    };
  },
};
export type DbService = typeof dbService;
