
/**
 * Validation Utilities
 * Centralized validation functions for form inputs and data integrity
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Phone number validation (international format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic international phone format: +[country code][number]
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true };
}

/**
 * URL validation
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL is optional in most cases
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Required field validation
 */
export function validateRequired(value: string | null | undefined, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Minimum length validation
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { isValid: true };
}

/**
 * Maximum length validation
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
}

/**
 * Number range validation
 */
export function validateNumberRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true };
}

/**
 * Array validation (at least one item)
 */
export function validateArrayNotEmpty(array: any[], fieldName: string): ValidationResult {
  if (!array || array.length === 0) {
    return { isValid: false, error: `Please select at least one ${fieldName}` };
  }

  return { isValid: true };
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  // Check for at least one uppercase, one lowercase, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }

  return { isValid: true };
}

/**
 * Tracking number validation
 */
export function validateTrackingNumber(trackingNumber: string): ValidationResult {
  if (!trackingNumber || trackingNumber.trim() === '') {
    return { isValid: false, error: 'Tracking number is required' };
  }

  // Tracking numbers should be alphanumeric and at least 6 characters
  const trackingRegex = /^[A-Z0-9]{6,}$/i;
  if (!trackingRegex.test(trackingNumber)) {
    return { isValid: false, error: 'Invalid tracking number format' };
  }

  return { isValid: true };
}

/**
 * Date validation (must be in the future)
 */
export function validateFutureDate(date: Date | string, fieldName: string): ValidationResult {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  if (dateObj <= now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  return { isValid: true };
}

/**
 * Date validation (must be in the past)
 */
export function validatePastDate(date: Date | string, fieldName: string): ValidationResult {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  if (dateObj >= now) {
    return { isValid: false, error: `${fieldName} must be in the past` };
  }

  return { isValid: true };
}

/**
 * Composite validation - runs multiple validators
 */
export function validateComposite(validators: (() => ValidationResult)[]): ValidationResult {
  for (const validator of validators) {
    const result = validator();
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}
