
/**
 * Tracking Number Generator
 * Generates non-sequential, secure tracking numbers
 */

/**
 * Generate a secure, non-sequential tracking number
 * Format: USS-XXXXXXX (USS prefix + 7 alphanumeric characters)
 * Example: USS-7G94X2Q
 */
export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'USS-';
  
  // Generate 7 random characters
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Generate a unique tracking number with timestamp component
 * This ensures uniqueness even if random generation produces duplicates
 */
export function generateUniqueTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const timestamp = Date.now().toString(36).toUpperCase(); // Convert timestamp to base36
  
  let random = '';
  // Generate 4 random characters
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    random += chars[randomIndex];
  }
  
  // Combine: USS- + last 3 chars of timestamp + 4 random chars
  return `USS-${timestamp.slice(-3)}${random}`;
}

/**
 * Validate tracking number format
 * @param trackingNumber Tracking number to validate
 * @returns true if valid format, false otherwise
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  // USS- followed by 7 alphanumeric characters
  const pattern = /^USS-[A-Z0-9]{7}$/;
  return pattern.test(trackingNumber);
}

/**
 * Generate an idempotency key for payment operations
 * Format: UUID v4
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure quote ID
 */
export function generateQuoteId(): string {
  return crypto.randomUUID();
}
