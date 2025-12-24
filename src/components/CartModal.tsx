import { useState, useEffect } from 'react';
import { getCart, removeFromCart, clearCart, getSessionId, createOrder, processPayment } from '../utils/api';
import { X, Trash2, CreditCard } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';

interface CartModalProps {
  onClose: () => void;
  onCartUpdate: (count: number) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function CartModal({ onClose, onCartUpdate, isAuthenticated, onLoginRequired }: CartModalProps) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await getCart(sessionId);
      if (response.success) {
        setCart(response.cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (artworkId: string) => {
    try {
      const sessionId = getSessionId();
      const response = await removeFromCart(sessionId, artworkId);
      if (response.success) {
        setCart(response.cart);
        onCartUpdate(response.cart.items?.length || 0);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum: number, item: any) => {
      return sum + (item.artwork.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    setShowCheckout(true);
  };

  const handleOrderComplete = async () => {
    const sessionId = getSessionId();
    await clearCart(sessionId);
    onCartUpdate(0);
    onClose();
  };

  if (showCheckout) {
    return (
      <CheckoutForm
        cart={cart}
        total={calculateTotal()}
        onClose={() => setShowCheckout(false)}
        onComplete={handleOrderComplete}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl text-gray-900">Shopping Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading cart...</p>
            </div>
          ) : !cart || cart.items?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.items.map((item: any) => (
                  <div key={item.artworkId} className="flex gap-4 border-b border-gray-200 pb-4">
                    <img
                      src={item.artwork.image}
                      alt={item.artwork.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{item.artwork.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">by {item.artwork.artisan}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-orange-600">${item.artwork.price}</span>
                        <span className="text-gray-500 text-sm">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.artworkId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition h-fit"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl text-gray-900">Total:</span>
                  <span className="text-2xl text-orange-600">${calculateTotal().toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
