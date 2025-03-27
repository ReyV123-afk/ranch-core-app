import { useState } from 'react';
import { NewsArticle } from '../types';
import { newsService } from '../lib/newsService';

export default function NewsSearch() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const searchResults = await newsService.searchNews(query, {
        category: 'all',
        date: 'all',
        source: 'all',
        sortBy: 'relevance'
      });
      setArticles(searchResults);
    } catch (err) {
      setError('Failed to search news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search news..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div key={article.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-gray-600">{article.description}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 hover:text-blue-600"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 