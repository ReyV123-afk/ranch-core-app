import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NewsSearch from './NewsSearch';
import BookmarkList from './BookmarkList';
import NewsletterManager from './NewsletterManager';
import { NewsArticle } from '../types';
import { newsService } from '../lib/newsService';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        const articles = await newsService.getLatestNews(1, 5);
        setRecentArticles(articles);
      } catch (err) {
        setError('Failed to fetch recent articles');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecentArticles();
    }
  }, [user]);

  if (!user) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.email}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Articles</h2>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {recentArticles.map((article) => (
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
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Bookmarks</h2>
          <BookmarkList />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Newsletter Preferences</h2>
        <NewsletterManager />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Search News</h2>
        <NewsSearch />
      </div>
    </div>
  );
} 