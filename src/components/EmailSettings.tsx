import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface EmailSettings {
  email_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  categories: string[];
  keywords: string[];
  is_active: boolean;
}

const EmailSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<EmailSettings>({
    email_frequency: 'weekly',
    categories: [],
    keywords: [],
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('email_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setSettings({
            email_frequency: data.email_frequency,
            categories: data.categories,
            keywords: data.keywords,
            is_active: data.is_active
          });
        }
      } catch (error) {
        console.error('Error loading email settings:', error);
        setError('Failed to load email settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase.rpc('update_email_settings', {
        p_user_id: user.id,
        p_email_frequency: settings.email_frequency,
        p_categories: settings.categories,
        p_keywords: settings.keywords,
        p_is_active: settings.is_active
      });

      if (error) throw error;
      setSuccess('Email settings updated successfully');
    } catch (error) {
      console.error('Error updating email settings:', error);
      setError('Failed to update email settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Settings</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Frequency
          </label>
          <select
            value={settings.email_frequency}
            onChange={e => setSettings({ ...settings, email_frequency: e.target.value as EmailSettings['email_frequency'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <input
            type="text"
            value={settings.categories.join(', ')}
            onChange={e => setSettings({ ...settings, categories: e.target.value.split(',').map(c => c.trim()) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Enter categories separated by commas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Keywords
          </label>
          <input
            type="text"
            value={settings.keywords.join(', ')}
            onChange={e => setSettings({ ...settings, keywords: e.target.value.split(',').map(k => k.trim()) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Enter keywords separated by commas"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={settings.is_active}
            onChange={e => setSettings({ ...settings, is_active: e.target.checked })}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Receive email notifications
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default EmailSettings; 