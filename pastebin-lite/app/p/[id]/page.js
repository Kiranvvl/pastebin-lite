// app/p/[id]/page.js
import { escapeHtml } from '@/lib/utils';

async function getPaste(id) {
  const { pool } = await import('@/lib/db');
  
  try {
    // Get paste
    const result = await pool.query(
      'SELECT * FROM pastes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return { available: false, reason: 'Paste not found' };
    }

    const paste = result.rows[0];
    
    // Check constraints
    if (paste.burned) {
      return { available: false, reason: 'Paste has been burned' };
    }
    
    // Check expiry (use current time)
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      return { available: false, reason: 'Paste has expired' };
    }
    
    if (paste.max_views && paste.views_used >= paste.max_views) {
      return { available: false, reason: 'Maximum views reached' };
    }

    // Update view count - SIMPLE UPDATE, NO TRANSACTION
    await pool.query(
      'UPDATE pastes SET views_used = views_used + 1 WHERE id = $1',
      [id]
    );

    return { 
      available: true, 
      paste: {
        ...paste,
        views_used: paste.views_used + 1 // Increment for display
      }
    };

  } catch (error) {
    console.error('Database error in getPaste:', error);
    return { available: false, reason: 'Database error' };
  }
}

export default async function PastePage({ params }) {
  const { id } = await params;
  
  try {
    const result = await getPaste(id);
    
    if (!result.available) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Paste Not Available
            </h1>
            <p className="text-gray-700">{result.reason}</p>
            <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Home
            </a>
          </div>
        </div>
      );
    }
    
    const { paste } = result;
    const escapedContent = escapeHtml(paste.content);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📝 Paste: {id}
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {new Date(paste.created_at).toLocaleString()}
              </p>
              {paste.expires_at && (
                <p>
                  <span className="font-medium">Expires:</span>{' '}
                  {new Date(paste.expires_at).toLocaleString()}
                </p>
              )}
              {paste.max_views && (
                <p>
                  <span className="font-medium">Views:</span>{' '}
                  {paste.views_used} of {paste.max_views}
                </p>
              )}
            </div>
          </header>

          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
              <pre className="whitespace-pre-wrap font-mono text-gray-800">
                {escapedContent}
              </pre>
            </div>
          </div>

          <div className="border-t pt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              ← Create New Paste
            </a>
            <div className="mt-4 text-sm text-gray-500">
              <p>Share this URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/{id}</p>
            </div>
          </div>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('Error loading paste:', error);
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Paste
          </h1>
          <p className="text-gray-700">
            Something went wrong while loading this paste. Please try again.
          </p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Paste: ${id}`,
  };
}