import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { authenticated: false, userId: null };
  }
  
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { authenticated: false, userId: null };
  }
  
  return { authenticated: true, userId: user.id, user };
}

// ============= AUTH ROUTES =============

// Sign up
app.post('/make-server-4d7cb5f9/auth/signup', async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: userType || 'buyer' },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get current user profile
app.get('/make-server-4d7cb5f9/auth/profile', async (c) => {
  try {
    const { authenticated, userId, user } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Get additional user data from KV store
    const userData = await kv.get(`user:${userId}`);
    
    return c.json({ 
      success: true, 
      user: {
        id: userId,
        email: user.email,
        name: user.user_metadata?.name,
        userType: user.user_metadata?.userType || 'buyer',
        ...userData
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update user profile
app.put('/make-server-4d7cb5f9/auth/profile', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    await kv.set(`user:${userId}`, { ...profileData, updatedAt: new Date().toISOString() });
    
    return c.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= ARTISAN ROUTES =============

// Get all artisans
app.get('/make-server-4d7cb5f9/artisans', async (c) => {
  try {
    const artisans = await kv.getByPrefix('artisan:');
    return c.json({ success: true, artisans });
  } catch (error) {
    console.error('Error fetching artisans:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific artisan
app.get('/make-server-4d7cb5f9/artisans/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const artisan = await kv.get(`artisan:${id}`);
    if (!artisan) {
      return c.json({ success: false, error: 'Artisan not found' }, 404);
    }
    return c.json({ success: true, artisan });
  } catch (error) {
    console.error('Error fetching artisan:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create/Update artisan profile (requires auth)
app.post('/make-server-4d7cb5f9/artisans', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const artisan = await c.req.json();
    const id = artisan.id || userId;
    const artisanData = { 
      ...artisan, 
      id, 
      userId,
      createdAt: artisan.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await kv.set(`artisan:${id}`, artisanData);
    return c.json({ success: true, artisan: artisanData }, 201);
  } catch (error) {
    console.error('Error creating artisan:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update artisan profile
app.put('/make-server-4d7cb5f9/artisans/:id', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const existingArtisan = await kv.get(`artisan:${id}`);
    
    if (!existingArtisan || existingArtisan.userId !== userId) {
      return c.json({ success: false, error: 'Unauthorized to update this artisan' }, 403);
    }

    const updates = await c.req.json();
    const artisanData = { 
      ...existingArtisan, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await kv.set(`artisan:${id}`, artisanData);
    
    return c.json({ success: true, artisan: artisanData });
  } catch (error) {
    console.error('Error updating artisan:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= ARTWORK ROUTES =============

// Get all artwork
app.get('/make-server-4d7cb5f9/artworks', async (c) => {
  try {
    const category = c.req.query('category');
    const artisanId = c.req.query('artisanId');
    let artworks = await kv.getByPrefix('artwork:');
    
    if (category && category !== 'all') {
      artworks = artworks.filter((artwork: any) => artwork.category === category);
    }
    
    if (artisanId) {
      artworks = artworks.filter((artwork: any) => artwork.artisanId === artisanId);
    }
    
    return c.json({ success: true, artworks });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific artwork
app.get('/make-server-4d7cb5f9/artworks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const artwork = await kv.get(`artwork:${id}`);
    if (!artwork) {
      return c.json({ success: false, error: 'Artwork not found' }, 404);
    }
    return c.json({ success: true, artwork });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new artwork (requires auth - artisan only)
app.post('/make-server-4d7cb5f9/artworks', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const artwork = await c.req.json();
    const id = crypto.randomUUID();
    const artworkData = { 
      ...artwork, 
      id, 
      artisanUserId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await kv.set(`artwork:${id}`, artworkData);
    return c.json({ success: true, artwork: artworkData }, 201);
  } catch (error) {
    console.error('Error creating artwork:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update artwork (requires auth - artisan only)
app.put('/make-server-4d7cb5f9/artworks/:id', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const existingArtwork = await kv.get(`artwork:${id}`);
    
    if (!existingArtwork || existingArtwork.artisanUserId !== userId) {
      return c.json({ success: false, error: 'Unauthorized to update this artwork' }, 403);
    }

    const updates = await c.req.json();
    const artworkData = { 
      ...existingArtwork, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await kv.set(`artwork:${id}`, artworkData);
    
    return c.json({ success: true, artwork: artworkData });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete artwork (requires auth - artisan only)
app.delete('/make-server-4d7cb5f9/artworks/:id', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const existingArtwork = await kv.get(`artwork:${id}`);
    
    if (!existingArtwork || existingArtwork.artisanUserId !== userId) {
      return c.json({ success: false, error: 'Unauthorized to delete this artwork' }, 403);
    }

    await kv.del(`artwork:${id}`);
    return c.json({ success: true, message: 'Artwork deleted' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= FAVORITES ROUTES =============

// Get user favorites
app.get('/make-server-4d7cb5f9/favorites', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const favorites = await kv.get(`favorites:${userId}`);
    return c.json({ success: true, favorites: favorites || { items: [] } });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add to favorites
app.post('/make-server-4d7cb5f9/favorites/:artworkId', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const artworkId = c.req.param('artworkId');
    const artwork = await kv.get(`artwork:${artworkId}`);
    
    if (!artwork) {
      return c.json({ success: false, error: 'Artwork not found' }, 404);
    }

    let favorites = await kv.get(`favorites:${userId}`);
    if (!favorites) {
      favorites = { items: [] };
    }

    if (!favorites.items.find((item: any) => item.artworkId === artworkId)) {
      favorites.items.push({
        artworkId,
        artwork,
        addedAt: new Date().toISOString()
      });
    }

    await kv.set(`favorites:${userId}`, favorites);
    return c.json({ success: true, favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Remove from favorites
app.delete('/make-server-4d7cb5f9/favorites/:artworkId', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const artworkId = c.req.param('artworkId');
    let favorites = await kv.get(`favorites:${userId}`);
    
    if (!favorites) {
      return c.json({ success: false, error: 'Favorites not found' }, 404);
    }

    favorites.items = favorites.items.filter((item: any) => item.artworkId !== artworkId);
    await kv.set(`favorites:${userId}`, favorites);
    
    return c.json({ success: true, favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= CART ROUTES =============

// Get cart items for a session or user
app.get('/make-server-4d7cb5f9/cart/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const cart = await kv.get(`cart:${sessionId}`);
    return c.json({ success: true, cart: cart || { items: [] } });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add item to cart
app.post('/make-server-4d7cb5f9/cart/:sessionId/add', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { artworkId, quantity = 1 } = await c.req.json();
    
    const artwork = await kv.get(`artwork:${artworkId}`);
    if (!artwork) {
      return c.json({ success: false, error: 'Artwork not found' }, 404);
    }

    let cart = await kv.get(`cart:${sessionId}`);
    if (!cart) {
      cart = { items: [] };
    }

    const existingItemIndex = cart.items.findIndex((item: any) => item.artworkId === artworkId);
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        artworkId,
        artwork,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    await kv.set(`cart:${sessionId}`, cart);
    return c.json({ success: true, cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Remove item from cart
app.delete('/make-server-4d7cb5f9/cart/:sessionId/remove/:artworkId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const artworkId = c.req.param('artworkId');

    let cart = await kv.get(`cart:${sessionId}`);
    if (!cart) {
      return c.json({ success: false, error: 'Cart not found' }, 404);
    }

    cart.items = cart.items.filter((item: any) => item.artworkId !== artworkId);
    await kv.set(`cart:${sessionId}`, cart);
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear cart
app.delete('/make-server-4d7cb5f9/cart/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    await kv.del(`cart:${sessionId}`);
    return c.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= ORDER ROUTES =============

// Create order (checkout)
app.post('/make-server-4d7cb5f9/orders', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const orderData = await c.req.json();
    const orderId = crypto.randomUUID();
    
    const order = {
      id: orderId,
      userId,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);
    
    // Also store in user's order list
    let userOrders = await kv.get(`user_orders:${userId}`);
    if (!userOrders) {
      userOrders = { orders: [] };
    }
    userOrders.orders.push(orderId);
    await kv.set(`user_orders:${userId}`, userOrders);

    return c.json({ success: true, order }, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user orders
app.get('/make-server-4d7cb5f9/orders', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const userOrders = await kv.get(`user_orders:${userId}`);
    if (!userOrders || !userOrders.orders) {
      return c.json({ success: true, orders: [] });
    }

    const orders = await Promise.all(
      userOrders.orders.map((orderId: string) => kv.get(`order:${orderId}`))
    );

    return c.json({ success: true, orders: orders.filter(Boolean) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get artisan orders (sales)
app.get('/make-server-4d7cb5f9/artisan/orders', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Get all orders and filter by artisan's artworks
    const allOrders = await kv.getByPrefix('order:');
    const artisanOrders = allOrders.filter((order: any) => {
      return order.items?.some((item: any) => item.artwork?.artisanUserId === userId);
    });

    return c.json({ success: true, orders: artisanOrders });
  } catch (error) {
    console.error('Error fetching artisan orders:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Process payment (mock)
app.post('/make-server-4d7cb5f9/payment/process', async (c) => {
  try {
    const { authenticated, userId } = await verifyAuth(c.req.header('Authorization'));
    
    if (!authenticated) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { orderId, paymentMethod, amount } = await c.req.json();
    
    // Mock payment processing - in production, integrate with Stripe, PayPal, etc.
    const paymentId = crypto.randomUUID();
    const payment = {
      id: paymentId,
      orderId,
      userId,
      amount,
      paymentMethod,
      status: 'completed',
      processedAt: new Date().toISOString()
    };

    await kv.set(`payment:${paymentId}`, payment);

    // Update order status
    const order = await kv.get(`order:${orderId}`);
    if (order) {
      order.status = 'paid';
      order.paymentId = paymentId;
      order.updatedAt = new Date().toISOString();
      await kv.set(`order:${orderId}`, order);
    }

    return c.json({ success: true, payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= INITIALIZE SAMPLE DATA =============

app.post('/make-server-4d7cb5f9/initialize', async (c) => {
  try {
    const existingArtisans = await kv.getByPrefix('artisan:');
    if (existingArtisans.length > 0) {
      return c.json({ success: true, message: 'Data already initialized' });
    }

    // Sample artisans
    const artisans = [
      {
        id: '1',
        name: 'Kwame Mensah',
        location: 'Accra, Ghana',
        specialty: 'Wood Carving',
        rating: 4.9,
        reviews: 127,
        image: 'https://images.unsplash.com/photo-1688240817677-d28b8e232dd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJ0aXNhbiUyMHdvcmtpbmd8ZW58MXx8fHwxNzY1ODAzNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Master wood carver with 20+ years of experience in traditional Ghanaian art.'
      },
      {
        id: '2',
        name: 'Amara Okonkwo',
        location: 'Lagos, Nigeria',
        specialty: 'Textile Weaving',
        rating: 5.0,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1743404025748-31f5d74a8702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGV4dGlsZSUyMHdlYXZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Specializes in vibrant traditional Nigerian textiles and contemporary designs.'
      },
      {
        id: '3',
        name: 'Desta Tadesse',
        location: 'Addis Ababa, Ethiopia',
        specialty: 'Pottery & Ceramics',
        rating: 4.8,
        reviews: 156,
        image: 'https://images.unsplash.com/photo-1761062404254-8e19c9e77d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc2NTcxNzQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Creates beautiful handcrafted pottery using ancient Ethiopian techniques.'
      },
      {
        id: '4',
        name: 'Jabari Mwangi',
        location: 'Nairobi, Kenya',
        specialty: 'Basket Weaving',
        rating: 4.9,
        reviews: 203,
        image: 'https://images.unsplash.com/photo-1741940365831-1a1fdc2e33ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYmFza2V0JTIwd2VhdmluZ3xlbnwxfHx8fDE3NjU4MDM2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Expert in traditional Kenyan basket weaving and sustainable crafts.'
      }
    ];

    // Sample artworks
    const artworks = [
      {
        id: '1',
        title: 'Traditional Ceramic Vase',
        artisan: 'Desta Tadesse',
        artisanId: '3',
        category: 'pottery',
        price: 89,
        image: 'https://images.unsplash.com/photo-1761062404254-8e19c9e77d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc2NTcxNzQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Handcrafted ceramic vase using traditional Ethiopian pottery techniques.',
        location: 'Addis Ababa, Ethiopia'
      },
      {
        id: '2',
        title: 'Woven Kente Cloth',
        artisan: 'Amara Okonkwo',
        artisanId: '2',
        category: 'textiles',
        price: 145,
        image: 'https://images.unsplash.com/photo-1743404025748-31f5d74a8702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGV4dGlsZSUyMHdlYXZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Vibrant handwoven textile with traditional Nigerian patterns.',
        location: 'Lagos, Nigeria'
      },
      {
        id: '3',
        title: 'Carved Elephant Sculpture',
        artisan: 'Kwame Mensah',
        artisanId: '1',
        category: 'wood',
        price: 210,
        image: 'https://images.unsplash.com/photo-1630509866824-6dbb0ef4f379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29vZCUyMGNhcnZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Intricately carved wooden elephant sculpture from sustainable teak.',
        location: 'Accra, Ghana'
      },
      {
        id: '4',
        title: 'Sisal Basket Collection',
        artisan: 'Jabari Mwangi',
        artisanId: '4',
        category: 'baskets',
        price: 65,
        image: 'https://images.unsplash.com/photo-1741940365831-1a1fdc2e33ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYmFza2V0JTIwd2VhdmluZ3xlbnwxfHx8fDE3NjU4MDM2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Beautiful handwoven sisal basket, perfect for storage or decor.',
        location: 'Nairobi, Kenya'
      },
      {
        id: '5',
        title: 'Decorative Bowl Set',
        artisan: 'Desta Tadesse',
        artisanId: '3',
        category: 'pottery',
        price: 125,
        image: 'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzJTIwaGFuZG1hZGV8ZW58MXx8fHwxNzY1ODAzNjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Set of three decorative bowls with traditional patterns.',
        location: 'Addis Ababa, Ethiopia'
      },
      {
        id: '6',
        title: 'Handwoven Wall Hanging',
        artisan: 'Amara Okonkwo',
        artisanId: '2',
        category: 'textiles',
        price: 95,
        image: 'https://images.unsplash.com/photo-1743404025748-31f5d74a8702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGV4dGlsZSUyMHdlYXZpbmd8ZW58MXx8fHwxNzY1ODAzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        description: 'Colorful wall hanging with geometric patterns.',
        location: 'Lagos, Nigeria'
      }
    ];

    // Store artisans
    for (const artisan of artisans) {
      await kv.set(`artisan:${artisan.id}`, artisan);
    }

    // Store artworks
    for (const artwork of artworks) {
      await kv.set(`artwork:${artwork.id}`, artwork);
    }

    return c.json({ 
      success: true, 
      message: 'Sample data initialized',
      artisansCount: artisans.length,
      artworksCount: artworks.length
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
