import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../lib/paymentService';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: [
        'Access to all news articles',
        'Basic search functionality',
        'Email notifications'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: [
        'Everything in Basic',
        'Advanced search filters',
        'Custom news feeds',
        'Priority support'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { url, error } = await paymentService.createCheckoutSession(user.id, planId);
      if (error) throw error;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view subscription plans.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {plans.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-3xl font-bold mb-4">${plan.price}/month</p>
          <ul className="space-y-2 mb-6">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
} 