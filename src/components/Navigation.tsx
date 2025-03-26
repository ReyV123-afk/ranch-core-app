import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/logo.svg';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(prevScrollY > currentScrollY || currentScrollY < 50);
      setScrolled(currentScrollY > 10);
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/signin');
    }
  };

  const handleMenuClick = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled 
          ? 'bg-gradient-to-r from-[#a41111]/95 to-[#8f0f0f]/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-r from-[#a41111] to-[#8f0f0f]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="bg-white/95 p-2 rounded-lg shadow-md group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 group-hover:bg-white group-hover:rotate-1">
                  <img
                    src={Logo}
                    alt="The Ranches at Belt Creek"
                    className="h-16 w-auto transform group-hover:-rotate-1 transition-transform duration-300"
                  />
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {[
                { path: '/', label: 'Dashboard' },
                { path: '/search', label: 'News Search' },
                { path: '/premium', label: 'Premium' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActivePath(item.path)
                      ? 'border-white text-white'
                      : 'border-transparent text-white/90 hover:border-white/70'
                  } relative inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-300 hover:text-white group overflow-hidden`}
                >
                  <span className="relative z-10">
                    {item.label}
                    <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-300 ${
                      isActivePath(item.path) ? 'scale-x-100' : 'scale-x-0'
                    } group-hover:scale-x-100`} />
                  </span>
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-white/10 backdrop-blur-sm rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#a41111] to-[#8f0f0f] flex items-center justify-center text-white text-base font-medium border border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden relative">
                    <span className="relative z-10">{user?.email?.[0].toUpperCase() || 'U'}</span>
                    <span className="absolute inset-0 bg-white/10 transform rotate-180 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </div>
                </button>
              </div>

              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white/95 backdrop-blur-md ring-1 ring-black/5 focus:outline-none transform transition-all duration-300 animate-fadeIn">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    {user?.email}
                  </div>
                  {[
                    { path: '/profile', label: 'Your Profile' },
                    { path: '/settings', label: 'Settings' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-all duration-300 relative group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#a41111]/5 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    </Link>
                  ))}
                  <button
                    onClick={() => handleMenuClick(handleSignOut)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">Sign out</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#a41111]/5 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-all duration-300 relative group"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-300 group-hover:scale-110`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-300 group-hover:scale-110`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${
          isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        } sm:hidden fixed inset-0 z-40 transition-all duration-500 ease-in-out`}
      >
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500" 
          onClick={() => setIsMenuOpen(false)} 
        />
        <div className="relative bg-gradient-to-b from-[#8f0f0f] to-[#7a0d0d] h-full w-64 shadow-xl transform transition-transform duration-500 ease-out">
          <div className="pt-5 pb-6 px-4">
            <div className="flex items-center justify-between">
              <div className="bg-white/95 p-2 rounded-lg transform transition-transform duration-300 hover:scale-105">
                <img src={Logo} alt="Logo" className="h-8 w-auto" />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-1">
              {[
                { path: '/', label: 'Dashboard' },
                { path: '/search', label: 'News Search' },
                { path: '/premium', label: 'Premium' },
                { path: '/profile', label: 'Your Profile' },
                { path: '/settings', label: 'Settings' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActivePath(item.path)
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-white/90 hover:bg-white/5'
                  } hover:border-white/70 transition-all duration-300 relative group overflow-hidden`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                </Link>
              ))}
              <button
                onClick={() => handleMenuClick(handleSignOut)}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-white/90 hover:bg-white/5 hover:border-white/70 transition-all duration-300 relative group overflow-hidden"
              >
                <span className="relative z-10">Sign out</span>
                <span className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 