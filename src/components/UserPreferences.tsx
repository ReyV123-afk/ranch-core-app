import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { newsService } from '../lib/newsService';
import { NewsInterest } from '../lib/newsService';

interface UserPreferencesProps {
  onUpdate: () => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [interests, setInterests] = useState<NewsInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'business',
    'technology',
    'entertainment',
    'sports',
    'science',
    'health',
    'politics',
    'world'
  ];

  const defaultKeywords = {
    business: ['stock market', 'economy', 'startup', 'investment'],
    technology: ['artificial intelligence', 'cybersecurity', 'cloud computing', 'mobile apps'],
    entertainment: ['movies', 'music', 'celebrity', 'streaming'],
    sports: ['football', 'basketball', 'tennis', 'soccer'],
    science: ['space', 'climate change', 'research', 'discovery'],
    health: ['medical', 'wellness', 'fitness', 'nutrition'],
    politics: ['election', 'government', 'policy', 'legislation'],
    world: ['international', 'global', 'diplomacy', 'conflict']
  };

  useEffect(() => {
    const loadInterests = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userInterests = await newsService.getUserInterests(user.id);
        setInterests(userInterests.length > 0 ? userInterests : [
          { category: 'technology', keywords: defaultKeywords.technology, frequency: 'daily' }
        ]);
      } catch (error) {
        console.error('Error loading user interests:', error);
        setMessage({ type: 'error', text: 'Failed to load preferences' });
      } finally {
        setLoading(false);
      }
    };

    loadInterests();
  }, [user]);

  const handleAddInterest = () => {
    setInterests([...interests, { category: 'technology', keywords: [], frequency: 'daily' }]);
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_: NewsInterest, i: number) => i !== index));
  };

  const handleCategoryChange = (index: number, category: string) => {
    const newInterests = [...interests];
    newInterests[index] = {
      ...newInterests[index],
      category,
      keywords: defaultKeywords[category as keyof typeof defaultKeywords] || []
    };
    setInterests(newInterests);
  };

  const handleKeywordChange = (index: number, keywordIndex: number, value: string) => {
    const newInterests = [...interests];
    newInterests[index].keywords[keywordIndex] = value;
    setInterests(newInterests);
  };

  const handleAddKeyword = (index: number) => {
    const newInterests = [...interests];
    newInterests[index].keywords.push('');
    setInterests(newInterests);
  };

  const handleRemoveKeyword = (interestIndex: number, keywordIndex: number) => {
    const newInterests = [...interests];
    newInterests[interestIndex].keywords = newInterests[interestIndex].keywords.filter((_, i) => i !== keywordIndex);
    setInterests(newInterests);
  };

  const handleFrequencyChange = (index: number, frequency: 'daily' | 'weekly') => {
    const newInterests = [...interests];
    newInterests[index].frequency = frequency;
    setInterests(newInterests);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await newsService.saveUserInterests(user.id, interests);
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
      onUpdate();
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to customize your preferences.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">News Preferences</h1>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {interests.map((interest, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Interest {index + 1}</h2>
              <button
                onClick={() => handleRemoveInterest(index)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={interest.category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <div className="space-y-2">
                  {interest.keywords.map((keyword: string, keywordIndex: number) => (
                    <div key={keywordIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => handleKeywordChange(index, keywordIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter keyword"
                      />
                      <button
                        onClick={() => handleRemoveKeyword(index, keywordIndex)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddKeyword(index)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    + Add Keyword
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Frequency
                </label>
                <select
                  value={interest.frequency}
                  onChange={(e) => handleFrequencyChange(index, e.target.value as 'daily' | 'weekly')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <button
            onClick={handleAddInterest}
            className="px-4 py-2 text-blue-500 hover:text-blue-600"
          >
            + Add Interest
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences; 