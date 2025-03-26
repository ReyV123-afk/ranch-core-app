import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewsInterest {
  category: string;
  keywords: string[];
  frequency: 'daily' | 'weekly';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<NewsInterest[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newKeywords) return;

    const keywordsArray = newKeywords.split(',').map(k => k.trim());
    setInterests([...interests, {
      category: newCategory,
      keywords: keywordsArray,
      frequency: 'daily'
    }]);
    setNewCategory('');
    setNewKeywords('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add News Interests</h2>
        <form onSubmit={handleAddInterest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Technology, Business, Sports"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
            <input
              type="text"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., AI, startups, innovation"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Interest
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your News Interests</h2>
        {interests.length === 0 ? (
          <p className="text-gray-500">No interests added yet. Add some above!</p>
        ) : (
          <div className="space-y-4">
            {interests.map((interest, index) => (
              <div key={index} className="border rounded-md p-4">
                <h3 className="font-medium">{interest.category}</h3>
                <p className="text-sm text-gray-600">Keywords: {interest.keywords.join(', ')}</p>
                <p className="text-sm text-gray-600">Frequency: {interest.frequency}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;