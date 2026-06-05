import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.APP_ENCRYPTION_KEY || '';

function getEncryptionKey(): Buffer {
  if (!KEY_HEX) {
    if (process.env.MOCK_MODE === 'true') {
      return Buffer.alloc(32, 'a'); // 32-byte key for mock environment
    }
    throw new Error('APP_ENCRYPTION_KEY environment variable is not defined!');
  }

  if (KEY_HEX.length === 64) {
    try {
      return Buffer.from(KEY_HEX, 'hex');
    } catch {
      // fallback if not valid hex
    }
  }

  return crypto.createHash('sha256').update(KEY_HEX).digest();
}

export function encrypt(text: string): string {
  if (!text) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format. Expected iv:authTag:encryptedText');
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
