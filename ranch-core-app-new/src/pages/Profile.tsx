import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <p>Email: {user?.email}</p>
      {/* Add profile content here */}
    </div>
  );
} 