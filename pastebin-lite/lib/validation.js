export function validatePasteInput(data) {
  const { content, ttl_seconds, max_views } = data;
  const errors = [];

  if (!content || typeof content !== 'string' || !content.trim()) {
    errors.push('content is required and must be a non-empty string');
  }
  
  if (ttl_seconds !== undefined) {
    if (typeof ttl_seconds !== 'number' || ttl_seconds < 1 || !Number.isInteger(ttl_seconds)) {
      errors.push('ttl_seconds must be an integer ≥ 1');
    }
  }
  
  if (max_views !== undefined) {
    if (typeof max_views !== 'number' || max_views < 1 || !Number.isInteger(max_views)) {
      errors.push('max_views must be an integer ≥ 1');
    }
  }

  return errors;
}