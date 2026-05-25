/**
 * SecureVote — Secret ID utilities
 * Uses Web Crypto API (SHA-256) instead of weak btoa encoding
 */

/** Hash a secret ID using SHA-256 → base64 string */
export const hashSecretId = async (secretId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(secretId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
};

/** Generate a unique secret ID for an election voter */
export const generateSecretId = (electionTitle: string, index: number): string => {
  const prefix = electionTitle
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X');
  const seqNumber = String(index + 1).padStart(4, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `POLL-${prefix}-${seqNumber}-${randomSuffix}`;
};

/** Mask a secret ID for display (e.g. POLL-NUS-0001-AB2 → ****AB2) */
export const maskSecretId = (secretId: string): string => {
  return `****${secretId.slice(-4)}`;
};
