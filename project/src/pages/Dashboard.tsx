import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';

interface NewsInterest {
  category: string;
  keywords: string[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interests, setInterests] = useState<NewsInterest[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newKeywords.trim()) return;

    const keywords = newKeywords.split(',').map((k: string) => k.trim());
    setInterests([...interests, { category: newCategory, keywords }]);
    setNewCategory('');
    setNewKeywords('');
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">News Interests</h2>
        <form onSubmit={handleAddInterest} className="flex gap-4 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category"
            className="flex-1 px-4 py-2 border rounded"
          />
          <input
            type="text"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
            placeholder="Keywords (comma-separated)"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Interest
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interests.map((interest: NewsInterest, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold">{interest.category}</h3>
              <p className="text-gray-600">{interest.keywords.join(', ')}</p>
              <button
                onClick={() => handleRemoveInterest(index)}
                className="mt-2 text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dashboard />
    </div>
  );
}