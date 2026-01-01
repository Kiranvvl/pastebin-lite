// lib/utils.js
import crypto from 'crypto';

// Generate a random ID
export function generateId(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// Escape HTML to prevent XSS (Server-side compatible)
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
    .replace(/ /g, '&nbsp;');
}

// Validate input for paste creation
export function validatePasteInput({ content, ttl_seconds, max_views }) {
  const errors = [];
  
  if (!content || typeof content !== 'string' || content.trim() === '') {
    errors.push('content is required and must be a non-empty string');
  }
  
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      errors.push('ttl_seconds must be an integer ≥ 1');
    }
  }
  
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      errors.push('max_views must be an integer ≥ 1');
    }
  }
  
  return errors;
}

// Format expiration date
export function calculateExpiry(ttlSeconds) {
  if (!ttlSeconds) return null;
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}