import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../utils/api';

type AdminDashboardProps = {
  onBack: () => void;
};

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setUserEmail(user?.email ?? null);
    };


    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <p className="text-gray-600">Logged in as:</p>
        <p className="font-semibold">{userEmail}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onBack}
        >
          Back to Marketplace
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold mb-2">Manage Users</h2>
          <p className="text-sm text-gray-500">View, promote, or remove users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold mb-2">Manage Artworks</h2>
          <p className="text-sm text-gray-500">Approve or delete artworks</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold mb-2">View Orders</h2>
          <p className="text-sm text-gray-500">Monitor marketplace transactions</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;