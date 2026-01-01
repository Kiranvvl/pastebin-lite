import { NextRequest } from 'next/server';

/**
 * Get current time with test mode support
 * @param req - Next.js request object
 * @returns Current time (real or test)
 */
export function getNow(req: NextRequest): Date {
  if (process.env.TEST_MODE === '1') {
    const testTime = req.headers.get('x-test-now-ms');
    if (testTime && !isNaN(Number(testTime))) {
      return new Date(Number(testTime));
    }
  }
  return new Date();
}

/**
 * Get current time for client-side operations
 * @returns Current Date object
 */
export function getClientNow(): Date {
  return new Date();
}

/**
 * Calculate expiry date based on TTL
 * @param ttlSeconds - Time to live in seconds
 * @param fromDate - Optional starting date (defaults to now)
 * @returns Expiry date
 */
export function calculateExpiry(ttlSeconds: number, fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  return new Date(baseDate.getTime() + ttlSeconds * 1000);
}

/**
 * Format date for display
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatDate(date: Date, includeTime: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Check if a date has expired
 * @param expiryDate - Expiry date to check
 * @param now - Optional current time (defaults to now)
 * @returns Whether the date has expired
 */
export function isExpired(expiryDate: Date | null, now?: Date): boolean {
  if (!expiryDate) return false;
  const currentTime = now || new Date();
  return currentTime > expiryDate;
}

/**
 * Get remaining time until expiry
 * @param expiryDate - Expiry date
 * @param now - Optional current time (defaults to now)
 * @returns Remaining time in milliseconds, or null if no expiry
 */
export function getRemainingTime(expiryDate: Date | null, now?: Date): number | null {
  if (!expiryDate) return null;
  const currentTime = now || new Date();
  return Math.max(0, expiryDate.getTime() - currentTime.getTime());
}

/**
 * Parse test time header safely
 * @param headerValue - Header value string
 * @returns Parsed Date or null if invalid
 */
export function parseTestTime(headerValue: string | null): Date | null {
  if (!headerValue) return null;
  
  const timestamp = Number(headerValue);
  if (isNaN(timestamp) || timestamp <= 0) {
    return null;
  }
  
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Interface for time-related configurations
 */
export interface TimeConfig {
  testMode: boolean;
  testTime?: Date;
}

/**
 * Create time configuration from request
 * @param req - Next.js request object
 * @returns Time configuration
 */
export function getTimeConfig(req: NextRequest): TimeConfig {
  const testMode = process.env.TEST_MODE === '1';
  let testTime: Date | undefined;
  
  if (testMode) {
    const parsed = parseTestTime(req.headers.get('x-test-now-ms'));
    if (parsed) {
      testTime = parsed;
    }
  }
  
  return { testMode, testTime };
}

/**
 * Get appropriate current time based on configuration
 * @param config - Time configuration
 * @returns Current time
 */
export function getNowFromConfig(config: TimeConfig): Date {
  return config.testTime || new Date();
}

// Default export with all utilities
export default {
  getNow,
  getClientNow,
  calculateExpiry,
  formatDate,
  isExpired,
  getRemainingTime,
  parseTestTime,
  getTimeConfig,
  getNowFromConfig
};