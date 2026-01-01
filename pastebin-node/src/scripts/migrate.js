// scripts/migrate.js
require('dotenv').config();
const { Pool } = require('pg');

async function migrate() {
  console.log('🚀 Starting database migration...');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    console.log('📝 Please create a .env file with:');
    console.log('DATABASE_URL=postgresql://neondb_owner:npg_eO12MmcgqjhL@ep-rapid-field-a1zxowsx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
    console.log('PORT=4000');
    console.log('APP_URL=http://localhost:4000');
    console.log('TEST_MODE=1');
    process.exit(1);
  }

  // Hide password in logs
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@');
  console.log(`📊 Using database: ${maskedUrl}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const client = await pool.connect();

  try {
    console.log('🔗 Connected to database');

    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log(`✅ Database time: ${testResult.rows[0].now}`);

    await client.query('BEGIN');

    // 1. Create pastes table
    console.log('📝 Creating pastes table...');
    await client.query(`
     CREATE TABLE IF NOT EXISTS pastes (
  id VARCHAR(10) PRIMARY KEY,
  content TEXT NOT NULL,
  ttl_seconds INTEGER,
  max_views INTEGER,
  views_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  burned BOOLEAN DEFAULT FALSE
);
    `);
    console.log('✅ Pastes table created/verified');

    // 2. Create indexes
    console.log('📊 Creating indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);',
      'CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_pastes_max_views ON pastes(max_views);'
    ];

    for (const query of indexQueries) {
      await client.query(query);
    }
    console.log('✅ Indexes created/verified');

    await client.query('COMMIT');
    console.log('🎉 Migration completed successfully!');

    // Show table info
    const countResult = await client.query('SELECT COUNT(*) as total_pastes FROM pastes;');
    console.log(`📊 Total pastes in database: ${countResult.rows[0].total_pastes}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('🔒 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { migrate };