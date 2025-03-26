import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { newsService } from '../lib/newsService';
import { NewsArticle } from '../lib/newsService';

const RecommendedArticles: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendedArticles = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const recommendedArticles = await newsService.getRecommendedArticles(user.id);
        setArticles(recommendedArticles);
      } catch (error) {
        console.error('Error loading recommended articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedArticles();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Articles</h2>
        <p className="text-gray-500">Please sign in to see personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended for You</h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
          >
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-500 transition-colors duration-200"
                >
                  {article.title}
                </a>
              </h3>
              <p className="text-xs text-gray-500 mt-1">{article.source}</p>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <p className="text-center text-gray-500 py-4">No recommendations available yet.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendedArticles; 