import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { newsService } from '../lib/newsService';
import { bookmarkService } from '../lib/bookmarkService';
import { Bookmark } from '../types';
import debounce from 'lodash/debounce';
import { useClickAway } from 'react-use';
import TrendingTopics from './TrendingTopics';

interface NewsFilters {
  category: string;
  date: string;
  source: string;
  sortBy: 'relevance' | 'date' | 'popularity';
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  category: string;
}

const NewsSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    date: 'all',
    source: 'all',
    sortBy: 'relevance'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    'all',
    'business',
    'technology',
    'entertainment',
    'sports',
    'science',
    'health'
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Most Recent' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      try {
        const { bookmarks: userBookmarks } = await bookmarkService.getBookmarks(user.id);
        setBookmarks(userBookmarks);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };
    loadBookmarks();
  }, [user]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: NewsFilters) => {
      try {
        setLoading(true);
        const results = await newsService.searchNews(query, filters);
        setArticles(results);
      } catch (error) {
        console.error('Error searching news:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Trigger search when query or filters change
  useEffect(() => {
    if (searchTerm || filters.category !== 'all') {
      debouncedSearch(searchTerm, filters);
    }
  }, [searchTerm, filters, debouncedSearch]);

  // Close suggestions when clicking outside
  useClickAway(searchRef, () => {
    setShowSuggestions(false);
  });

  // Fetch search suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await newsService.getArticleSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    []
  );

  // Update suggestions when search query changes
  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleBookmark = async (article: NewsArticle) => {
    if (!user) return;
    try {
      const existingBookmark = bookmarks.find((b) => b.article.id === article.id);
      if (existingBookmark) {
        await bookmarkService.removeBookmark(existingBookmark.id);
        setBookmarks(prev => prev.filter((b) => b.id !== existingBookmark.id));
      } else {
        const newBookmark = await bookmarkService.addBookmark({
          article,
          tags: []
        });
        if (newBookmark) {
          setBookmarks(prev => [...prev, newBookmark]);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleNotInterested = async (article: NewsArticle) => {
    if (!user) return;
    try {
      await newsService.markArticleNotInterested(user.id, article.id);
      // Remove the article from the current view
      setArticles(articles.filter(a => a.id !== article.id));
    } catch (error) {
      console.error('Error marking article as not interested:', error);
    }
  };

  const handleArticleClick = async (article: NewsArticle) => {
    try {
      await newsService.incrementArticleViews(article.id, user?.id);
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for news articles..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent" />
              </div>
            )}

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={searchRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'relevance' | 'date' | 'popularity' })}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleArticleClick(article)}
                      className="hover:text-red-500 transition-colors duration-200"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{article.source}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleBookmark(article)}
                        className={`p-2 rounded-full ${
                          bookmarks.some((b) => b.article.id === article.id)
                            ? 'text-red-500'
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleNotInterested(article)}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No articles found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Trending Topics Sidebar */}
        <div className="lg:col-span-1">
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
};

export default NewsSearch; 