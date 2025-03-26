import React, { useState, useEffect } from 'react';
import { newsService } from '../lib/newsService';

interface TrendingTopic {
  topic: string;
  count: number;
  category: string;
}

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'business',
    'technology',
    'entertainment',
    'sports',
    'science',
    'health'
  ];

  useEffect(() => {
    const loadTrendingTopics = async () => {
      try {
        setLoading(true);
        const trendingTopics = await newsService.getTrendingTopics();
        const filteredTopics = selectedCategory === 'all'
          ? trendingTopics
          : trendingTopics.filter(topic => topic.category === selectedCategory);
        setTopics(filteredTopics);
      } catch (error) {
        console.error('Error loading trending topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingTopics();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Trending Topics</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <div
            key={topic.topic}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-800">{topic.topic}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {topic.category}
              </span>
            </div>
            <span className="text-sm text-gray-500">{topic.count} articles</span>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="text-center text-gray-500 py-4">No trending topics found.</p>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics; 