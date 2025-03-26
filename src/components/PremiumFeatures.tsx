import React, { useState } from 'react';
import { NewsArticle } from '../lib/newsService';

interface NewsletterTemplate {
  title: string;
  description: string;
  articles: NewsArticle[];
  schedule: 'daily' | 'weekly';
}

const PremiumFeatures: React.FC = () => {
  const [template, setTemplate] = useState<NewsletterTemplate>({
    title: '',
    description: '',
    articles: [],
    schedule: 'daily',
  });

  const handleCreateNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would integrate with the emailService to create and schedule the newsletter
    console.log('Creating newsletter:', template);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Premium Features</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Newsletter Creation</h3>
          <form onSubmit={handleCreateNewsletter} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Newsletter Title
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter newsletter title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter newsletter description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Distribution Schedule
              </label>
              <select
                value={template.schedule}
                onChange={(e) => setTemplate({ ...template, schedule: e.target.value as 'daily' | 'weekly' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Newsletter
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Subscribers</h4>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Open Rate</h4>
              <p className="text-2xl font-bold text-blue-600">0%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Click Rate</h4>
              <p className="text-2xl font-bold text-blue-600">0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures; 