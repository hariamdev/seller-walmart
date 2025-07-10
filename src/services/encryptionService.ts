// AES Encryption Service to match C# implementation
export class EncryptionService {
  private static readonly AES_KEY = "9T6KjI/mL0BJmPlG03PKpyMyiSZ4fMlRBO8m+w6y7ug=";

  /**
   * Encrypt token using AES encryption (matches C# implementation)
   */
  static async encryptToken(token: string): Promise<string> {
    try {
      const key = this.base64ToArrayBuffer(this.AES_KEY);
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        data
      );

      // Combine IV and encrypted data (matches C# format)
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt token');
    }
  }

  /**
   * Decrypt token using AES decryption (matches C# implementation)
   */
  static async decryptToken(encryptedToken: string): Promise<string> {
    try {
      const key = this.base64ToArrayBuffer(this.AES_KEY);
      const fullCipher = this.base64ToArrayBuffer(encryptedToken);
      
      // Extract IV (first 16 bytes) and cipher data
      const iv = fullCipher.slice(0, 16);
      const cipher = fullCipher.slice(16);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        cipher
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt token');
    }
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}