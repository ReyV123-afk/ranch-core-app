import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Newsletter } from '../types';
import { premiumService } from '../lib/premiumService';

export default function NewsletterManager() {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadNewsletters();
  }, [user]);

  const loadNewsletters = async () => {
    if (!user?.id) return;
    
    try {
      const data = await premiumService.getNewsletters(user.id);
      const transformedData = data.map(newsletter => ({
        ...newsletter,
        schedule: newsletter.schedule || 'daily',
        categories: newsletter.categories || [],
        keywords: newsletter.keywords || [],
        subscriberCount: newsletter.subscriberCount || 0,
        isActive: newsletter.isActive ?? true
      }));
      setNewsletters(transformedData);
    } catch (err) {
      setError('Failed to load newsletters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (newsletterId: string) => {
    try {
      const success = await premiumService.updateNewsletter(newsletterId, { isSubscribed: true });
      if (success) {
        await loadNewsletters();
      } else {
        setError('Failed to subscribe to newsletter');
      }
    } catch (err) {
      setError('Failed to subscribe to newsletter');
    }
  };

  const handleUnsubscribe = async (newsletterId: string) => {
    try {
      const success = await premiumService.updateNewsletter(newsletterId, { isSubscribed: false });
      if (success) {
        await loadNewsletters();
      } else {
        setError('Failed to unsubscribe from newsletter');
      }
    } catch (err) {
      setError('Failed to unsubscribe from newsletter');
    }
  };

  if (!user) {
    return <div>Please sign in to manage your newsletter preferences.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {newsletters.map((newsletter) => (
        <div key={newsletter.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{newsletter.title}</h3>
          <p className="text-gray-600">{newsletter.description}</p>
          <div className="mt-2">
            <button
              onClick={() => newsletter.isSubscribed ? handleUnsubscribe(newsletter.id) : handleSubscribe(newsletter.id)}
              className={`px-4 py-2 rounded ${
                newsletter.isSubscribed
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {newsletter.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 