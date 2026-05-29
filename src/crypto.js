import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 12 bytes for GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = 'sha256';

/**
 * Derives a cryptographic key from a password and salt using PBKDF2.
 * @param {string} password 
 * @param {Buffer} salt 
 * @returns {Buffer}
 */
export function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

/**
 * Encrypts plaintext using AES-256-GCM and returns a JSON payload containing crypto metadata.
 * @param {string} plaintext 
 * @param {string} password 
 * @returns {string} JSON formatted metadata
 */
export function encrypt(plaintext, password) {
  if (!password) {
    throw new Error('Encryption password is required.');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    version: '1.0.0',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: ciphertext
  }, null, 2);
}

/**
 * Decrypts AES-256-GCM encrypted metadata using a password.
 * @param {string} encryptedJson 
 * @param {string} password 
 * @returns {string} Plaintext string
 */
export function decrypt(encryptedJson, password) {
  if (!password) {
    throw new Error('Decryption password is required.');
  }

  try {
    const data = JSON.parse(encryptedJson);

    if (!data.salt || !data.iv || !data.authTag || !data.ciphertext) {
      throw new Error('Invalid encrypted file format. Missing cryptographic parameters.');
    }

    const salt = Buffer.from(data.salt, 'base64');
    const iv = Buffer.from(data.iv, 'base64');
    const authTag = Buffer.from(data.authTag, 'base64');
    const ciphertext = data.ciphertext;

    const key = deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  } catch (err) {
    // Catch standard crypto block decryption failures (which happen when tag doesn't match or key is incorrect)
    if (
      err.message.includes('Unsupported state') || 
      err.message.includes('bad decrypt') || 
      err.message.includes('decryption failed') ||
      err.code === 'ERR_CRYPTO_OPERATION_FAILED'
    ) {
      throw new Error('Decryption failed. Incorrect master password or corrupted secret file.');
    }
    throw err;
  }
}
