import { X, Heart, ShoppingCart, MapPin, User } from 'lucide-react';

interface ArtworkModalProps {
  artwork: {
    id: number | string;
    title: string;
    artisan: string;
    price: number;
    image: string;
    description: string;
    location: string;
  };
  onClose: () => void;
  onAddToCart?: (artworkId: string) => void;
}

export function ArtworkModal({ artwork, onClose, onAddToCart }: ArtworkModalProps) {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(String(artwork.id));
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square">
            <img 
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col">
            <h2 className="text-3xl text-gray-900 mb-4">{artwork.title}</h2>
            
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <User size={18} />
              <span>Created by {artwork.artisan}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin size={18} />
              <span>{artwork.location}</span>
            </div>

            <p className="text-gray-700 mb-8 flex-grow">{artwork.description}</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl text-orange-600">${artwork.price}</span>
                <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition">
                  <Heart size={24} className="text-gray-600" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button className="w-full py-4 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition">
                Contact Artisan
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm text-gray-500 mb-2">DETAILS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials</span>
                  <span className="text-gray-900">Natural, Handcrafted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Worldwide Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Returns</span>
                  <span className="text-gray-900">30 Day Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}