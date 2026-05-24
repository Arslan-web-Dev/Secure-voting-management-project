export async function hashString(input: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback: simple SHA-like fallback (not ideal) — keep deterministic but avoid btoa
    // Use built-in TextEncoder + a quick JS hash when SubtleCrypto not available
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
