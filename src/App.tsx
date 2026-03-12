import { useState, useEffect } from 'react';
import { Hero } from './components/shared/Hero';
import { FeaturedArtisans } from './components/FeaturedArtisans';
import { ArtworkGallery } from './components/ArtworkGallery';
import { Navigation } from './components/shared/Navigation';
import { Footer } from './components/shared/Footer';
import { LoginModal } from './pages/auth/LoginModal';
import { SignupModal } from './components/modals/SignupModal';
import { CartModal } from './components/CartModal';
import { ArtisanDashboard } from './pages/seller/ArtisanDashboard';
import { initializeData, getCurrentUser, supabase } from './utils/api';
import AdminDashboard from './pages/admin/AdminDashboard';


export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartCount, setCartCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'marketplace' | 'dashboard'>('marketplace');
  const [userType, setUserType] = useState<'buyer' | 'artisan' | 'admin'>('buyer');
 
  useEffect(() => {
  // ===== TESTING Supabase Connection =====
  console.log('Testing Supabase connection...');
  getCurrentUser()
    .then(user => console.log('Current user:', user))
    .catch(error => console.error('Error fetching current user:', error));

  initializeData()
    .then(() => console.log('initializeData ran successfully'))
    .catch(error => console.error('Error initializing data:', error));
  // ======================================

  // Check for existing session
  checkUser();

  // Listen for auth changes
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      checkUser();
    } else {
      setCurrentUser(null);
      setView('marketplace');
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };

   // ===== TESTING DENO BACKEND =====
  fetch('https://redesigned-yodel-5gx4gpqp6j76f4xqr-8001.app.github.dev/api/test')
    .then(res => res.json())
    .then(data => console.log('Backend response:', data))
    .catch(err => console.error('Backend fetch error:', err));
  // ======================================
}, []);


const checkUser = async () => {
  try {
    const user = await getCurrentUser();
    setCurrentUser(user);

    // Fetch userType from metadata or your profile table
    const profileData = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setUserType(profileData.data.role); // e.g., 'admin', 'artisan', 'buyer'
  } catch (error) {
    console.error('Error checking user:', error);
    setCurrentUser(null);
    setUserType(null);
  }
};

  const handleLoginSuccess = () => {
    checkUser();
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleOpenDashboard = () => {
    // Preserve existing behavior but allow explicit opening of the dashboard.
    // When used from the new admin button, we force the userType to 'admin'
    // so the AdminDashboard component is rendered even if there's no current
    // authenticated admin session (useful for development/testing).
    setUserType('admin');
    setView('dashboard');
  };

  const handleBackToMarketplace = () => {
    setView('marketplace');
  };

  if (view === 'dashboard') {
    if (userType === 'artisan') {
      return <ArtisanDashboard onBack={handleBackToMarketplace} />;
  }

  if (userType === 'admin') {
    return <AdminDashboard onBack={handleBackToMarketplace} />;
  }
  // Add buyer dashboard if needed
  return null; // fallback
}

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        cartCount={cartCount}
        currentUser={currentUser}
        onLoginClick={() => setShowLogin(true)}
        onCartClick={() => setShowCart(true)}
        onDashboardClick={() => {
        if (currentUser && userType !== 'buyer') {
          setView('dashboard');
        }
      }}
        onAdminClick={() => {
          // Quick access to Admin Dashboard from the header
          setUserType('admin');
          setView('dashboard');
        }}
      onLogout={() => {
        setCurrentUser(null);
        setUserType(null);
        setView('marketplace');
      }}
     /> 

      <Hero />
      <FeaturedArtisans />
      <ArtworkGallery 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onCartUpdate={setCartCount}
      />
      <Footer />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showCart && (
        <CartModal
          onClose={() => setShowCart(false)}
          onCartUpdate={setCartCount}
          isAuthenticated={!!currentUser}
          onLoginRequired={() => {
            setShowCart(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}
