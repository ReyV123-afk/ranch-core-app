import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NewsSearch from '../components/NewsSearch';

export default function SearchPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/signin';
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search News</h1>
      <NewsSearch />
    </div>
  );
}