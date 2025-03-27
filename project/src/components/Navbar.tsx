import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            News App
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-gray-600 hover:text-gray-800">
                  Sign In
                </Link>
                <Link to="/signup" className="text-gray-600 hover:text-gray-800">
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