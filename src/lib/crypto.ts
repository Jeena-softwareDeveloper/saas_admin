import CryptoJS from 'crypto-js';

const getDecryptionKey = (): string => {
  const envKey = import.meta.env.VITE_DECRYPTION_KEY as string;
  if (!envKey) {
    throw new Error('VITE_DECRYPTION_KEY environment variable is not defined');
  }
  return envKey;
};

export const encrypt = (text: string): string => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, getDecryptionKey()).toString();
};

export const decrypt = (encryptedText: string): string => {
  if (!encryptedText || !encryptedText.startsWith('U2FsdGVk')) {
    return encryptedText;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, getDecryptionKey());
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      throw new Error('Decrypted string is empty (likely invalid key)');
    }
    return decryptedText;
  } catch (err) {
    console.error('Decryption failed:', err);
    return encryptedText;
  }
};
