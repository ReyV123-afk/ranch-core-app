import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserPreferences from '../components/UserPreferences';
import RecommendationAnalytics from '../components/RecommendationAnalytics';
import NewsletterManager from '../components/NewsletterManager';
import EmailSettings from '../components/EmailSettings';
import SubscriptionPlans from '../components/SubscriptionPlans';
import PaymentHistory from '../components/PaymentHistory';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User ID:</span> {user.id}</p>
          </div>
        </div>

        <div className="mb-8">
          <UserPreferences />
        </div>

        <div className="mb-8">
          <EmailSettings />
        </div>

        <div className="mb-8">
          <SubscriptionPlans />
        </div>

        <div className="mb-8">
          <PaymentHistory />
        </div>

        <div className="mb-8">
          <RecommendationAnalytics />
        </div>

        <div>
          <NewsletterManager />
        </div>
      </div>
    </div>
  );
};

export default Profile; 