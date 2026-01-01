// scripts/migrate.js
require("dotenv").config();
const { Pool } = require("pg");

async function migrate() {
  console.log("🚀 Starting database migration...");
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL is not set");
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log("🔗 Connected to database");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(8) PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        max_views INTEGER,
        views_used INTEGER DEFAULT 0
      );
    `);
    
    console.log("✅ Migration completed!");
    client.release();
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}
