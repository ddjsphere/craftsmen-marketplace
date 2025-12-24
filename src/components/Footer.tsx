import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl text-orange-500 mb-4">AfriCraft</h3>
            <p className="text-gray-400">
              Connecting African artisans with the world, one masterpiece at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">About Us</a></li>
              <li><a href="#artisans" className="hover:text-orange-500 transition">Artisans</a></li>
              <li><a href="#gallery" className="hover:text-orange-500 transition">Gallery</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Contact</a></li>
            </ul>
          </div>

          {/* For Artisans */}
          <div>
            <h4 className="text-lg mb-4">For Artisans</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Join Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Seller Guidelines</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Support</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Success Stories</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg mb-4">Stay Connected</h4>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter</p>
            <div className="flex gap-2 mb-4">
              <input 
                type="email" 
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-orange-500"
              />
              <button className="p-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition">
                <Mail size={20} />
              </button>
            </div>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 transition">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 AfriCraft. All rights reserved. Empowering African artisans worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
