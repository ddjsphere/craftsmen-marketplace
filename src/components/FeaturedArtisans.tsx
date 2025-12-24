import { MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getArtisans } from '../utils/api';

export function FeaturedArtisans() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtisans();
  }, []);

  const loadArtisans = async () => {
    try {
      const response = await getArtisans();
      if (response.success) {
        setArtisans(response.artisans);
      }
    } catch (error) {
      console.error('Error loading artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="artisans" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">Featured Artisans</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the talented craftspeople behind our unique pieces
          </p>
        </div>

        {/* Artisans Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Loading artisans...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {artisans.map((artisan) => (
                <div 
                  key={artisan.id}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
                    <img 
                      src={artisan.image}
                      alt={artisan.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <button className="w-full bg-white text-gray-900 py-2 rounded-lg hover:bg-orange-600 hover:text-white transition">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl text-gray-900 mb-1">{artisan.name}</h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin size={14} />
                    <span className="text-sm">{artisan.location}</span>
                  </div>
                  <div className="text-orange-600 mb-2">{artisan.specialty}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-orange-400 text-orange-400" />
                      <span className="text-sm">{artisan.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({artisan.reviews} reviews)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition">
                View All Artisans
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}