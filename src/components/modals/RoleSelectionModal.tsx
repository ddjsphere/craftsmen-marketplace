import { useState } from 'react';
import { X, ShoppingBag, Store } from 'lucide-react';

interface RoleSelectionModalProps {
  onClose: () => void;
  onSelectRole: (role: 'buyer' | 'seller') => void;
  userName?: string;
}

export function RoleSelectionModal({ onClose, onSelectRole, userName }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome{userName ? `, ${userName}` : ''}!</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-8">How do you want to use our platform?</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Buyer Option */}
          <button
            onClick={() => setSelectedRole('buyer')}
            className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedRole === 'buyer'
                ? 'border-orange-600 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === 'buyer' ? 'bg-orange-600' : 'bg-gray-100'
                }`}
              >
                <ShoppingBag
                  size={32}
                  className={selectedRole === 'buyer' ? 'text-white' : 'text-gray-600'}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Buy</h3>
              <p className="text-sm text-gray-600">
                Browse and purchase unique artisan products from talented sellers
              </p>
            </div>
          </button>

          {/* Seller Option */}
          <button
            onClick={() => setSelectedRole('seller')}
            className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedRole === 'seller'
                ? 'border-orange-600 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === 'seller' ? 'bg-orange-600' : 'bg-gray-100'
                }`}
              >
                <Store
                  size={32}
                  className={selectedRole === 'seller' ? 'text-white' : 'text-gray-600'}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Sell</h3>
              <p className="text-sm text-gray-600">
                Showcase your crafts and connect with buyers who appreciate quality
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't worry, you can always switch or add another role later in your settings
        </p>
      </div>
    </div>
  );
}
