import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { newsService } from '../lib/newsService';

interface AnalyticsData {
  totalRecommendations: number;
  viewRate: number;
  bookmarkRate: number;
  notInterestedRate: number;
  byCategory: Record<string, {
    total: number;
    viewRate: number;
    bookmarkRate: number;
    notInterestedRate: number;
  }>;
  bySource: Record<string, {
    total: number;
    viewRate: number;
    bookmarkRate: number;
    notInterestedRate: number;
  }>;
}

const RecommendationAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await newsService.getRecommendationAnalytics(user.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Recommendation Analytics</h2>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Recommendations</h3>
          <p className="text-2xl font-semibold text-gray-800">{analytics.totalRecommendations}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">View Rate</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {(analytics.viewRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Bookmark Rate</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {(analytics.bookmarkRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Not Interested Rate</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {(analytics.notInterestedRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Category Analytics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Performance by Category</h3>
        <div className="space-y-4">
          {Object.entries(analytics.byCategory).map(([category, data]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800 capitalize">{category}</h4>
                <span className="text-sm text-gray-500">{data.total} articles</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">View Rate</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.viewRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bookmark Rate</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.bookmarkRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Not Interested</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.notInterestedRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Analytics */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Performance by Source</h3>
        <div className="space-y-4">
          {Object.entries(analytics.bySource).map(([source, data]) => (
            <div key={source} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">{source}</h4>
                <span className="text-sm text-gray-500">{data.total} articles</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">View Rate</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.viewRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bookmark Rate</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.bookmarkRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Not Interested</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(data.notInterestedRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationAnalytics; 