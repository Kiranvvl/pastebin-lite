// lib/db.js
import { Pool } from 'pg';

let _pool; // Internal variable
let poolPromise;

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add connection settings to prevent timeouts
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection fails
  });
}

// Initialize pool only once
if (!_pool) {
  if (process.env.NODE_ENV === 'production') {
    _pool = createPool();
  } else {
    // In development, use a promise to prevent multiple connections during hot reload
    if (!poolPromise) {
      poolPromise = (async () => {
        _pool = createPool();
        return _pool;
      })();
    }
  }
}

// Export a function that returns the pool
export async function getPool() {
  if (process.env.NODE_ENV === 'production') {
    return _pool;
  } else {
    return await poolPromise;
  }
}

// Export the pool object for backward compatibility
export const pool = {
  async query(text, params) {
    const p = await getPool();
    return p.query(text, params);
  },
  
  async connect() {
    const p = await getPool();
    return p.connect();
  },
  
  // Add other methods if needed
  async end() {
    const p = await getPool();
    return p.end();
  }
};