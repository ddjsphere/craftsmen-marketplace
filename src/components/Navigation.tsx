import { Search, ShoppingBag, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from '../utils/api';

interface NavigationProps {
  cartCount?: number;
  currentUser?: any;
  onLoginClick: () => void;
  onCartClick: () => void;
  onDashboardClick: () => void;
  onLogout: () => void;
}

export function Navigation({ 
  cartCount = 0, 
  currentUser, 
  onLoginClick, 
  onCartClick,
  onDashboardClick,
  onLogout
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentHash, setCurrentHash] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || (window.location.pathname === '/' ? '/' : '');
    }
    return '/';
  });

  useEffect(() => {
    const onHashChange = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash || (window.location.pathname === '/' ? '/' : ''));
      }
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return currentHash === '/';
    }
    return currentHash === href;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionIds = ['artisans', 'gallery', 'about', 'contact'];
    const observedEls: Element[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setCurrentHash(`#${entry.target.id}`);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observedEls.push(el);
        observer.observe(el);
      }
    });

    const onScrollTop = () => {
      if (window.scrollY < 120) {
        setCurrentHash('/');
      }
    };

    window.addEventListener('scroll', onScrollTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScrollTop);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl text-orange-600">AfriCraft</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className={`text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('/') ? 'border-orange-600' : 'border-transparent'}`}>
              Home
            </a>
            <a
              href="#artisans"
              className={`text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#artisans') ? 'border-orange-600' : 'border-transparent'}`}>
              Artisans
            </a>
            <a
              href="#gallery"
              className={`text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#gallery') ? 'border-orange-600' : 'border-transparent'}`}>
              Gallery
            </a>
            <a
              href="#about"
              className={`text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#about') ? 'border-orange-600' : 'border-transparent'}`}>
              About
            </a>
            <a
              href="#contact"
              className={`text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#contact') ? 'border-orange-600' : 'border-transparent'}`}>
              Contact
            </a>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-orange-600 transition">
              <Search size={20} />
            </button>
            <button 
              onClick={onCartClick}
              className="p-2 text-gray-700 hover:text-orange-600 transition relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-orange-600 transition"
                >
                  <User size={20} />
                  <span className="hidden md:inline">{currentUser.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    {currentUser.userType === 'artisan' && (
                      <button
                        onClick={() => {
                          onDashboardClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition hidden md:block"
              >
                Sign In
              </button>
            )}

            <button 
              className="md:hidden p-2 text-gray-700 hover:text-orange-600 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <a
              href="/"
              className={`block py-2 text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('/') ? 'border-orange-600' : 'border-transparent'}`}>
              Home
            </a>
            <a
              href="#artisans"
              className={`block py-2 text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#artisans') ? 'border-orange-600' : 'border-transparent'}`}>
              Artisans
            </a>
            <a
              href="#gallery"
              className={`block py-2 text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#gallery') ? 'border-orange-600' : 'border-transparent'}`}>
              Gallery
            </a>
            <a
              href="#about"
              className={`block py-2 text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#about') ? 'border-orange-600' : 'border-transparent'}`}>
              About
            </a>
            <a
              href="#contact"
              className={`block py-2 text-gray-700 hover:text-orange-600 transition pb-1 border-b-2 ${isActive('#contact') ? 'border-orange-600' : 'border-transparent'}`}>
              Contact
            </a>
            {!currentUser && (
              <button
                onClick={onLoginClick}
                className="w-full text-left py-2 text-orange-600"
              >
                Sign In
              </button>
            )}
            {currentUser && currentUser.userType === 'artisan' && (
              <button
                onClick={() => {
                  onDashboardClick();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left py-2 text-gray-700"
              >
                Dashboard
              </button>
            )}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-600"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
