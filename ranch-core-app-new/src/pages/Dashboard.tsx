import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      {/* Add dashboard content here */}
    </div>
  );
} 