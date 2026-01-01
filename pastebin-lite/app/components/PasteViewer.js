'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function PasteViewer({ initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);

  const handleView = () => {
    if (!url) {
      toast.error('Please enter a paste URL');
      return;
    }

    // Extract ID from URL
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    
    if (!id || id.length !== 8) {
      toast.error('Invalid paste URL format');
      return;
    }

    window.open(`/p/${id}`, '_blank');
  };

  const handleExample = () => {
    // Use a demo URL or show example
    setUrl('https://your-app.vercel.app/p/abc123de');
    toast.info('Example URL loaded. Replace with your actual paste URL.');
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="paste-url" className="block text-sm font-medium text-gray-700 mb-2">
          Paste URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            id="paste-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.vercel.app/p/abc123de"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button
            type="button"
            onClick={handleView}
            disabled={loading || !url}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 shadow-sm"
          >
            View Paste
          </button>
        </div>
      </div>

      {initialUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Your created paste:</h3>
              <p className="text-sm text-blue-600 truncate mt-1">{initialUrl}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(initialUrl);
                toast.success('URL copied to clipboard!');
              }}
              className="px-3 py-1 text-sm bg-white text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📌 How to use:</h3>
        <ol className="space-y-3 list-decimal list-inside text-gray-600">
          <li>Copy the URL from a created paste</li>
          <li>Paste it in the field above</li>
          <li>Click "View Paste" to see the content</li>
          <li>Share the URL with others</li>
        </ol>
        
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleExample}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
          >
            Load Example URL
          </button>
        </div>
      </div>
    </div>
  );
}