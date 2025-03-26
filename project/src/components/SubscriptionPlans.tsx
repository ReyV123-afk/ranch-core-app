import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PaymentService, SubscriptionPlan, Subscription } from '../lib/paymentService';

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [plansData, subscriptionData] = await Promise.all([
          PaymentService.getSubscriptionPlans(),
          PaymentService.getCurrentSubscription(user.id)
        ]);
        setPlans(plansData);
        setCurrentSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setError('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    try {
      setProcessing(true);
      setError(null);
      const checkoutUrl = await PaymentService.createCheckoutSession(user.id, planId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to start subscription process');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    try {
      setProcessing(true);
      setError(null);
      await PaymentService.cancelSubscription(user.id);
      setCurrentSubscription(null);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setProcessing(false);
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
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Subscription Plans</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {currentSubscription && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium">Current Subscription</p>
          <p>Status: {currentSubscription.status}</p>
          <p>Period End: {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
          {!currentSubscription.cancel_at_period_end && (
            <button
              onClick={handleCancelSubscription}
              disabled={processing}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${(plan.price_amount / 100).toFixed(2)}
              </span>
              <span className="text-gray-600">/{plan.interval}</span>
            </div>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={processing || currentSubscription?.status === 'active'}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans; 