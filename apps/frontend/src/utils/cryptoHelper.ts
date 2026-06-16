// Helper for Client-Side End-to-End Encryption (E2EE) using Web Crypto API

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : '';
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof window === 'undefined') return new ArrayBuffer(0);
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive a 256-bit AES-GCM CryptoKey from a text passphrase.
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const rawKeyData = encoder.encode(passphrase);
  
  // Use SHA-256 to hash the passphrase to exactly 32 bytes (256 bits)
  const hash = await window.crypto.subtle.digest('SHA-256', rawKeyData);
  
  // Import the hash as a raw AES-GCM key
  return await window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string using AES-GCM.
 */
export async function encryptMessage(
  plaintext: string,
  passphrase: string
): Promise<{ ciphertext: string; iv: string }> {
  try {
    const key = await deriveKey(passphrase);
    const encoder = new TextEncoder();
    const encodedPlaintext = encoder.encode(plaintext);
    
    // Generate a secure random 12-byte IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedPlaintext
    );
    
    return {
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      iv: arrayBufferToBase64(iv.buffer),
    };
  } catch (err) {
    console.error('Encryption failed:', err);
    throw err;
  }
}

/**
 * Decrypt a ciphertext string using AES-GCM.
 */
export async function decryptMessage(
  ciphertext: string,
  iv: string,
  passphrase: string
): Promise<string> {
  try {
    const key = await deriveKey(passphrase);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
    const ivBuffer = base64ToArrayBuffer(iv);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      ciphertextBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed:', err);
    return '🔒 [Decryption Error - Key Mismatch]';
  }
}
