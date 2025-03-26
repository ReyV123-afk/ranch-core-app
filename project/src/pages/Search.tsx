import React, { useState } from 'react';
import { Search as SearchIcon, Newspaper, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  topics: string[];
}

function Search() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual news API integration
      const mockArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'Breaking News: Major Tech Innovation',
          content: 'A revolutionary new technology has been unveiled...',
          summary: 'Tech company announces groundbreaking innovation in AI development.',
          url: 'https://example.com/news/1',
          publishedAt: new Date().toISOString(),
          source: 'Tech Daily',
          topics: ['Technology', 'AI']
        },
        {
          id: '2',
          title: 'Global Markets Update',
          content: 'Markets show strong recovery amid positive economic data...',
          summary: 'Global markets surge as economic indicators show positive trends.',
          url: 'https://example.com/news/2',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'Financial Times',
          topics: ['Business', 'Economy']
        }
      ];

      setArticles(mockArticles);
    } catch (err) {
      setError('Failed to fetch news articles');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Search News</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for news..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Newspaper className="h-5 w-5 mr-2 text-blue-600" />
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-4">{article.summary}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{article.source}</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt))} ago</span>
            </div>
          </div>
        ))}
        {articles.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-600">
            No articles found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;