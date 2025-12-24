import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full">
                Connecting Artisans with the World
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl text-gray-900">
              Discover Authentic African Craftsmanship
            </h1>
            <p className="text-xl text-gray-600">
              Connect directly with talented African artisans and bring home unique, handcrafted pieces that tell a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2">
                Explore Artwork
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition">
                Meet Artisans
              </button>
            </div>
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-3xl text-gray-900">500+</div>
                <div className="text-gray-600">Artisans</div>
              </div>
              <div>
                <div className="text-3xl text-gray-900">2,000+</div>
                <div className="text-gray-600">Unique Pieces</div>
              </div>
              <div>
                <div className="text-3xl text-gray-900">50+</div>
                <div className="text-gray-600">Countries</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzJTIwaGFuZG1hZGV8ZW58MXx8fHwxNzY1ODAzNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="African crafts"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1630509866824-6dbb0ef4f379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29vZCUyMGNhcnZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Wood carving"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img 
                src="https://images.unsplash.com/photo-1761062404254-8e19c9e77d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc2NTcxNzQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Pottery"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1743404025748-31f5d74a8702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGV4dGlsZSUyMHdlYXZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Textile weaving"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
