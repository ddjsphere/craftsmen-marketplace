import { Heart, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ArtworkModal } from './ArtworkModal';
import { getArtworks, addToCart, getCart, getSessionId } from '../utils/api';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'pottery', name: 'Pottery' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'wood', name: 'Wood Carving' },
  { id: 'baskets', name: 'Baskets' },
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'paintings', name: 'Paintings' }
];

interface ArtworkGalleryProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCartUpdate: (count: number) => void;
}

export function ArtworkGallery({ selectedCategory, onCategoryChange, onCartUpdate }: ArtworkGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtworks();
    loadCart();
  }, [selectedCategory]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const response = await getArtworks(selectedCategory);
      if (response.success) {
        setArtworks(response.artworks);
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await getCart(sessionId);
      if (response.success && response.cart) {
        onCartUpdate(response.cart.items?.length || 0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleAddToCart = async (artworkId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const sessionId = getSessionId();
      const response = await addToCart(sessionId, artworkId);
      if (response.success) {
        onCartUpdate(response.cart.items?.length || 0);
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl text-gray-900 mb-4">Artwork Gallery</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our collection of authentic African crafts
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-6 py-2 rounded-full transition ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Artwork Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Loading artworks...</p>
          </div>
        ) : artworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((artwork) => (
              <div 
                key={artwork.id}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer"
                onClick={() => setSelectedArtwork(artwork)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button 
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-orange-50 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Heart size={20} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 mb-2">{artwork.title}</h3>
                  <p className="text-gray-600 mb-4">by {artwork.artisan}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-orange-600">${artwork.price}</span>
                    <button 
                      className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                      onClick={(e) => handleAddToCart(artwork.id, e)}
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No artwork found in this category.</p>
          </div>
        )}
      </div>

      {selectedArtwork && (
        <ArtworkModal 
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onAddToCart={(artworkId) => {
            handleAddToCart(artworkId, {} as React.MouseEvent);
          }}
        />
      )}
    </section>
  );
}
