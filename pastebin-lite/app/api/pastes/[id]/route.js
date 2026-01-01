import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // TEST_MODE support
    const testMode = process.env.TEST_MODE === '1';
    const testNowHeader = request.headers.get('x-test-now-ms');
    let now = new Date();
    
    if (testMode && testNowHeader) {
      now = new Date(parseInt(testNowHeader, 10));
    }

    // Get paste
    const result = await pool.query(
      'SELECT * FROM pastes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    const paste = result.rows[0];

    // Check constraints
    const isExpired = paste.expires_at && new Date(paste.expires_at) < now;
    const maxViewsReached = paste.max_views && paste.views_used >= paste.max_views;
    
    if (paste.burned || isExpired || maxViewsReached) {
      return NextResponse.json(
        { error: 'Paste not available' },
        { status: 404 }
      );
    }

    // Increment view count
    await pool.query(
      'UPDATE pastes SET views_used = views_used + 1 WHERE id = $1',
      [id]
    );

    // Calculate remaining views
    const remainingViews = paste.max_views 
      ? paste.max_views - (paste.views_used + 1)
      : null;

    return NextResponse.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires_at
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}