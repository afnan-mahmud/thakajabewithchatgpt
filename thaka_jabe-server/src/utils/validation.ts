import { Types } from 'mongoose';
import validator from 'validator';

/**
 * Validation utility functions for input sanitization and validation
 */

/**
 * Validate if string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

/**
 * Sanitize string to prevent NoSQL injection
 * Removes/escapes special MongoDB operators
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential MongoDB operators from strings
    return input.replace(/[${}]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      // Skip MongoDB operator keys
      if (key.startsWith('$')) {
        continue;
      }
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate and sanitize search query
 * Prevents regex injection and NoSQL injection
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Remove special regex characters that could cause issues
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate phone number (Bangladesh format)
 */
export function isValidPhone(phone: string): boolean {
  // Bangladesh phone number: starts with 01 or +8801, followed by 3-9 and 8 digits
  const phoneRegex = /^(\+?88)?01[3-9]\d{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML to prevent XSS
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  clean = clean.replace(/data:text\/html/gi, '');
  
  return clean;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: any, limit: any): { page: number; limit: number } {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  
  return {
    page: isNaN(parsedPage) || parsedPage < 1 ? 1 : Math.min(parsedPage, 1000),
    limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100)
  };
}

/**
 * Validate and sanitize MongoDB sort parameter
 */
export function sanitizeSortParam(sort: string, allowedFields: string[]): string {
  if (!sort || typeof sort !== 'string') {
    return 'createdAt';
  }
  
  // Check if it's in the allowed fields
  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
  
  if (!allowedFields.includes(sortField)) {
    return 'createdAt';
  }
  
  return sort;
}

/**
 * Escape special characters for MongoDB regex
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

