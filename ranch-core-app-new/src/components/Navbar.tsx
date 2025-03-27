import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Ranch Core App
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/search" className="text-gray-700 hover:text-primary-600">
                  Search
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="btn btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 