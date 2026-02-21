import { useState, useEffect } from 'react';
import { getArtworks, getArtisan, getArtisanOrders, getCurrentUser } from '../../utils/api';
import { ArtworkManager } from '../../components/ArtworkManager';
import { ArtisanProfileManager } from './ArtisanProfileManager';
import { Package, Palette, User, BarChart } from 'lucide-react';

interface ArtisanDashboardProps {
  onBack: () => void;
}

export function ArtisanDashboard({ onBack }: ArtisanDashboardProps) {
  const [activeTab, setActiveTab] = useState<'artworks' | 'profile' | 'orders' | 'stats'>('artworks');
  const [artworks, setArtworks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await getCurrentUser();
      const artisanResponse = await getArtisan(user.id);
      
      if (artisanResponse.success) {
        setArtisan(artisanResponse.artisan);
        
        const artworksResponse = await getArtworks(undefined, artisanResponse.artisan.id);
        if (artworksResponse.success) {
          setArtworks(artworksResponse.artworks);
        }
      }

      const ordersResponse = await getArtisanOrders();
      if (ordersResponse.success) {
        setOrders(ordersResponse.orders);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalArtworks = artworks.length;

    return { totalSales, totalOrders, totalArtworks };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Artisan Dashboard</h1>
              <p className="text-gray-600">Welcome back, {artisan?.name || 'Artisan'}!</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Marketplace
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <BarChart className="text-orange-600" size={24} />
                <span className="text-orange-900">Total Sales</span>
              </div>
              <div className="text-3xl text-orange-900">${stats.totalSales.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-blue-600" size={24} />
                <span className="text-blue-900">Orders</span>
              </div>
              <div className="text-3xl text-blue-900">{stats.totalOrders}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Palette className="text-green-600" size={24} />
                <span className="text-green-900">Artworks</span>
              </div>
              <div className="text-3xl text-green-900">{stats.totalArtworks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('artworks')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'artworks'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette size={20} className="inline mr-2" />
              My Artworks
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'profile'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={20} className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'orders'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={20} className="inline mr-2" />
              Orders
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'artworks' && (
          <ArtworkManager artworks={artworks} onUpdate={loadDashboardData} />
        )}
        {activeTab === 'profile' && (
          <ArtisanProfileManager artisan={artisan} onUpdate={loadDashboardData} />
        )}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-2xl text-gray-900 mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</div>
                          <div className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-600">${order.total?.toFixed(2)}</div>
                          <div className={`text-sm ${
                            order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
