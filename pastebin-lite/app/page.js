// app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttlSeconds ? parseInt(ttlSeconds) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      // Redirect to the paste URL
      router.push(`/p/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📝 Pastebin-Lite
          </h1>
          <p className="text-gray-600">
            Create and share text snippets with optional expiry and view limits
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TTL (seconds, optional)
                </label>
                <input
                  type="number"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  placeholder="e.g., 3600 for 1 hour"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Views (optional)
                </label>
                <input
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>• Content is required and must be non-empty</p>
              <p>• TTL and Max Views are optional</p>
              <p>• If both constraints are set, paste becomes unavailable when either triggers</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Built for the Pastebin-Lite Assignment</p>
          <p className="mt-2">
            API available at: <code className="bg-gray-100 px-2 py-1 rounded">/api/pastes</code> and{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">/api/pastes/:id</code>
          </p>
          <p className="mt-2">
            Health check: <code className="bg-gray-100 px-2 py-1 rounded">/api/healthz</code>
          </p>
        </div>
      </div>
    </div>
  );
}