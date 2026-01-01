import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}