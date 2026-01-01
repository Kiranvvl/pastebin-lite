'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function PasteForm({ onPasteCreated }) {
  const [formData, setFormData] = useState({
    content: '',
    ttl_seconds: '',
    max_views: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        content: formData.content.trim(),
        ...(formData.ttl_seconds && { ttl_seconds: parseInt(formData.ttl_seconds) }),
        ...(formData.max_views && { max_views: parseInt(formData.max_views) })
      };

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create paste');
      }

      const data = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.url);
      
      // Callback
      onPasteCreated(data.url);
      
      // Reset form
      setFormData({
        content: '',
        ttl_seconds: '',
        max_views: ''
      });

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Paste Content *
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none"
          placeholder="Enter your text here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ttl_seconds" className="block text-sm font-medium text-gray-700 mb-2">
            Time to Live (seconds)
          </label>
          <input
            type="number"
            id="ttl_seconds"
            name="ttl_seconds"
            value={formData.ttl_seconds}
            onChange={handleChange}
            min="1"
            placeholder="Optional"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Paste will expire after this many seconds</p>
        </div>

        <div>
          <label htmlFor="max_views" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Views
          </label>
          <input
            type="number"
            id="max_views"
            name="max_views"
            value={formData.max_views}
            onChange={handleChange}
            min="1"
            placeholder="Optional"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Maximum number of times paste can be viewed</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          * Required field. Both constraints optional.
        </div>
        <button
          type="submit"
          disabled={loading || !formData.content.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Creating...
            </>
          ) : (
            'Create Paste'
          )}
        </button>
      </div>
    </form>
  );
}