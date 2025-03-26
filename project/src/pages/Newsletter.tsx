import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit2, Users } from 'lucide-react';

interface NewsletterData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  subscribers_count?: number;
}

function Newsletter() {
  const user = useUserStore((state) => state.user);
  const [newsletters, setNewsletters] = useState<NewsletterData[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select(`
          *,
          newsletter_subscribers (count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNewsletters(data.map(newsletter => ({
        ...newsletter,
        subscribers_count: newsletter.newsletter_subscribers[0]?.count || 0
      })));
    } catch (err) {
      console.error('Error loading newsletters:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('newsletters')
        .insert([
          {
            title,
            content,
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      setTitle('');
      setContent('');
      loadNewsletters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create newsletter');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadNewsletters();
    } catch (err) {
      console.error('Error deleting newsletter:', err);
    }
  };

  if (!user?.isPremium) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-gray-600 mb-4">Newsletter creation is available for premium users only.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Newsletter Management</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Newsletter</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Newsletter Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter newsletter title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your newsletter content..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Creating...' : 'Create Newsletter'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Newsletters</h2>
        <div className="space-y-4">
          {newsletters.length === 0 ? (
            <p className="text-gray-600">No newsletters created yet.</p>
          ) : (
            newsletters.map((newsletter) => (
              <div key={newsletter.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{newsletter.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(newsletter.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">{newsletter.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {newsletter.subscribers_count} subscribers
                  </span>
                  <span>
                    Created {formatDistanceToNow(new Date(newsletter.created_at))} ago
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Newsletter;