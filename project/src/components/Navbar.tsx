import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Search, Mail, User } from 'lucide-react';
import { useUserStore } from '../store/userStore';

interface UserState {
  user: any;
}

export const Navbar = () => {
  const user = useUserStore((state: UserState) => state.user);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">NewsHub</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/search" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </Link>
            
            {user?.isPremium && (
              <Link to="/newsletter" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Mail className="h-5 w-5" />
                <span>Newsletter</span>
              </Link>
            )}
            
            <Link to="/auth" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <User className="h-5 w-5" />
              <span>{user ? 'Profile' : 'Sign In'}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;