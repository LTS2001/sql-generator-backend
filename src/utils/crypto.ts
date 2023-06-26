import CryptoJS from 'crypto-js';

// 加密盐值
const CRYPTO_Key = 'SQL_GENERATOR_PASSWORD_KEY';

/**
 * 加密
 * @param encrypt_str 需要加密的字符串
 * @returns 加密后的字符串
 */
export function encryptStr(encrypt_str: string) {
  return CryptoJS.AES.encrypt(encrypt_str, CRYPTO_Key).toString();
}

/**
 * 解密
 * @param decrypt_str 需要解密的字符串
 * @returns 解密后的字符串
 */
export function decryptStr(decrypt_str: string) {
  return CryptoJS.AES.decrypt(decrypt_str, CRYPTO_Key).toString(
    CryptoJS.enc.Utf8
  );
}
