/**
 * M-Pesa Signature Verification
 * Implements RSA-SHA256 signature verification for Safaricom M-Pesa callbacks
 */

import crypto from 'crypto';

// M-Pesa public key (production - replace with actual key)
const MPESA_PUBLIC_KEY = process.env.MPESA_PUBLIC_KEY || `
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCzwY2pY0Y1jQc7Q3sX8wmXQ2V5
... (full key here) ...
-----END PUBLIC KEY-----
`;

/**
 * Verify M-Pesa callback signature
 * @param payload - Raw request body string
 * @param signature - Base64 encoded signature from X-Mpesa-Signature header
 * @returns boolean - True if signature is valid
 */
export function verifyMpesaSignature(
    payload: string,
    signature: string
): boolean {
    try {
        if (!signature || !payload) {
            console.error('[M-Pesa] Missing signature or payload');
            return false;
        }

        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(payload);
        verifier.end();

        const isValid = verifier.verify(
            MPESA_PUBLIC_KEY,
            signature,
            'base64'
        );

        if (!isValid) {
            console.error('[M-Pesa] Signature verification failed');
        }

        return isValid;
    } catch (error) {
        console.error('[M-Pesa] Signature verification error:', error);
        return false;
    }
}

/**
 * Generate HMAC signature for outgoing M-Pesa requests
 */
export function generateMpesaPassword(
    shortcode: string,
    passkey: string,
    timestamp: string
): string {
    const data = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
}

/**
 * Generate timestamp in M-Pesa format (YYYYMMDDHHmmss)
 */
export function getMpesaTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
}
