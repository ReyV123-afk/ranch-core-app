import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NewsArticle } from '../types';
import { newsService } from '../lib/newsService';
import UserPreferences from './UserPreferences';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (!user) return;
        
        const interests = await newsService.getUserInterests(user.id);
        const fetchedArticles = await newsService.fetchNews(interests);
        setArticles(fetchedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.email || 'User'}
        </h2>
        {user && <UserPreferences onUpdate={() => {}} />}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Personalized News</h3>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <h4 className="text-lg font-medium text-gray-900">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  {article.title}
                </a>
              </h4>
              <p className="mt-1 text-sm text-gray-500">{article.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>{article.source}</span>
                <span className="mx-2">•</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 