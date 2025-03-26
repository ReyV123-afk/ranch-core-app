import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { premiumService, Newsletter } from '../lib/premiumService';

type NewsletterSchedule = 'daily' | 'weekly' | 'monthly';

interface NewNewsletter {
  title: string;
  description: string;
  schedule: NewsletterSchedule;
  categories: string[];
  keywords: string[];
}

const NewsletterManager: React.FC = () => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState<NewNewsletter>({
    title: '',
    description: '',
    schedule: 'daily',
    categories: [],
    keywords: []
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [isPremiumUser, userNewsletters] = await Promise.all([
          premiumService.isPremiumUser(user.id),
          premiumService.getNewsletters(user.id)
        ]);
        setIsPremium(isPremiumUser);
        setNewsletters(userNewsletters);
      } catch (error) {
        console.error('Error loading newsletter data:', error);
        setError('Failed to load newsletter data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCreateNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await premiumService.createNewsletter(
        user.id,
        newNewsletter.title,
        newNewsletter.description,
        newNewsletter.schedule,
        newNewsletter.categories,
        newNewsletter.keywords
      );

      const updatedNewsletters = await premiumService.getNewsletters(user.id);
      setNewsletters(updatedNewsletters);
      setShowCreateForm(false);
      setNewNewsletter({
        title: '',
        description: '',
        schedule: 'daily',
        categories: [],
        keywords: []
      });
    } catch (error) {
      console.error('Error creating newsletter:', error);
      setError('Failed to create newsletter');
    }
  };

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

  if (!isPremium) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Premium Feature</h2>
        <p className="text-gray-600 mb-4">
          Newsletter creation and management is available for premium users only.
        </p>
        <button
          onClick={() => {/* Add upgrade to premium logic */}}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Newsletter Manager</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {showCreateForm ? 'Cancel' : 'Create Newsletter'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateNewsletter} className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newNewsletter.title}
                onChange={e => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newNewsletter.description}
                onChange={e => setNewNewsletter({ ...newNewsletter, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <select
                value={newNewsletter.schedule}
                onChange={e => setNewNewsletter({ ...newNewsletter, schedule: e.target.value as NewsletterSchedule })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <input
                type="text"
                value={newNewsletter.categories.join(', ')}
                onChange={e => setNewNewsletter({ ...newNewsletter, categories: e.target.value.split(',').map(c => c.trim()) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Enter categories separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords</label>
              <input
                type="text"
                value={newNewsletter.keywords.join(', ')}
                onChange={e => setNewNewsletter({ ...newNewsletter, keywords: e.target.value.split(',').map(k => k.trim()) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Enter keywords separated by commas"
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Create Newsletter
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {newsletters.map(newsletter => (
          <div key={newsletter.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800">{newsletter.title}</h3>
            <p className="text-gray-600 mt-1">{newsletter.description}</p>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Schedule: {newsletter.schedule}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsletterManager; 