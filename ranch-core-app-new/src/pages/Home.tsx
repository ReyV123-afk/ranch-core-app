import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to Ranch Core App
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Your personalized news and content platform
      </p>
      {!user ? (
        <div className="space-x-4">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      ) : (
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      )}
    </div>
  );
} 