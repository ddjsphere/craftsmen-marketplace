import "https://deno.land/x/dotenv/load.ts";
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');





if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


const DEV_MODE = !SUPABASE_SERVICE_ROLE_KEY;

// Helper: Verify user from Authorization header
async function getUserFromReq(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  if (DEV_MODE) {
    return { id: 'dev-user', email: 'dev@local', user_metadata: { name: 'Dev User', userType: 'buyer' } };
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ================= AUTH =================

// Sign up
app.post('/make-server-4d7cb5f9/auth/signup', async (c: any) => {
  try {
    const { email, password, name, userType } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: userType || 'buyer' },
      email_confirm: true
    });

    if (error) return c.json({ success: false, error: error.message }, 400);
    return c.json({ success: true, user: data.user });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get profile
app.get('/make-server-4d7cb5f9/auth/profile', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
  return c.json({ success: true, user });
});

// Update profile
app.put('/make-server-4d7cb5f9/auth/profile', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  try {
    const updates = await c.req.json();
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, ...updates }
    });
    if (error) return c.json({ success: false, error: error.message }, 400);
    return c.json({ success: true, user: data.user });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ================= ARTISANS =================

// Get all artisans
app.get('/make-server-4d7cb5f9/artisans', async () => {
  const { data, error } = await supabase.from('artisans').select('*');
  if (error) return { success: false, error: error.message };
  return { success: true, artisans: data };
});

// Get single artisan
app.get('/make-server-4d7cb5f9/artisans/:id', async (c: any) => {
  const id = c.req.param('id');
  const { data, error } = await supabase.from('artisans').select('*').eq('id', id).single();
  if (error) return c.json({ success: false, error: error.message }, 404);
  return c.json({ success: true, artisan: data });
});

// Create or update artisan
app.post('/make-server-4d7cb5f9/artisans', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const artisan = await c.req.json();
  const id = artisan.id || user.id;
  const { data, error } = await supabase.from('artisans').upsert([{ ...artisan, id, userId: user.id, updatedAt: new Date().toISOString() }]);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, artisan: data[0] });
});

// Update artisan
app.put('/make-server-4d7cb5f9/artisans/:id', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const updates = await c.req.json();

  const { data: existing, error: fetchError } = await supabase.from('artisans').select('*').eq('id', id).single();
  if (fetchError || !existing || existing.userId !== user.id) {
    return c.json({ success: false, error: 'Unauthorized or not found' }, 403);
  }

  const { data, error } = await supabase.from('artisans').update({ ...updates, updatedAt: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, artisan: data });
});

// ================= ARTWORKS =================

// Get artworks
app.get('/make-server-4d7cb5f9/artworks', async (c: any) => {
  const category = c.req.query('category');
  const artisanId = c.req.query('artisanId');

  let query = supabase.from('artworks').select('*');
  if (category && category !== 'all') query = query.eq('category', category);
  if (artisanId) query = query.eq('artisanId', artisanId);

  const { data, error } = await query;
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, artworks: data });
});

// Get single artwork
app.get('/make-server-4d7cb5f9/artworks/:id', async (c: any) => {
  const id = c.req.param('id');
  const { data, error } = await supabase.from('artworks').select('*').eq('id', id).single();
  if (error) return c.json({ success: false, error: error.message }, 404);
  return c.json({ success: true, artwork: data });
});

// Create artwork
app.post('/make-server-4d7cb5f9/artworks', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const artwork = await c.req.json();
  const id = crypto.randomUUID();
  const { data, error } = await supabase.from('artworks').insert([{ ...artwork, id, artisanUserId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]).select();
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, artwork: data[0] });
});

// Update artwork
app.put('/make-server-4d7cb5f9/artworks/:id', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const updates = await c.req.json();

  const { data: existing, error: fetchError } = await supabase.from('artworks').select('*').eq('id', id).single();
  if (fetchError || !existing || existing.artisanUserId !== user.id) {
    return c.json({ success: false, error: 'Unauthorized or not found' }, 403);
  }

  const { data, error } = await supabase.from('artworks').update({ ...updates, updatedAt: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, artwork: data });
});

// Delete artwork
app.delete('/make-server-4d7cb5f9/artworks/:id', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const { data: existing, error: fetchError } = await supabase.from('artworks').select('*').eq('id', id).single();
  if (fetchError || !existing || existing.artisanUserId !== user.id) {
    return c.json({ success: false, error: 'Unauthorized or not found' }, 403);
  }

  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, message: 'Artwork deleted' });
});

// ================= FAVORITES =================

// Get favorites
app.get('/make-server-4d7cb5f9/favorites', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const { data, error } = await supabase.from('favorites').select('*').eq('userId', user.id);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, favorites: data });
});

// Add to favorites
app.post('/make-server-4d7cb5f9/favorites/:artworkId', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const artworkId = c.req.param('artworkId');
  const { error } = await supabase.from('favorites').upsert({ userId: user.id, artworkId });
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, message: 'Added to favorites' });
});

// Remove from favorites
app.delete('/make-server-4d7cb5f9/favorites/:artworkId', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const artworkId = c.req.param('artworkId');
  const { error } = await supabase.from('favorites').delete().eq('userId', user.id).eq('artworkId', artworkId);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, message: 'Removed from favorites' });
});

// ================= CART =================

// Get cart
app.get('/make-server-4d7cb5f9/cart/:sessionId', async (c: any) => {
  const sessionId = c.req.param('sessionId');
  const { data, error } = await supabase.from('cart').select('*').eq('sessionId', sessionId);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, cart: data });
});

// Add to cart
app.post('/make-server-4d7cb5f9/cart/:sessionId/add', async (c: any) => {
  const sessionId = c.req.param('sessionId');
  const { artworkId, quantity = 1 } = await c.req.json();

  const { data, error } = await supabase.from('cart').upsert({ sessionId, artworkId, quantity, updatedAt: new Date().toISOString() });
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, cart: data });
});

// Remove from cart
app.delete('/make-server-4d7cb5f9/cart/:sessionId/remove/:artworkId', async (c: any) => {
  const sessionId = c.req.param('sessionId');
  const artworkId = c.req.param('artworkId');

  const { error } = await supabase.from('cart').delete().eq('sessionId', sessionId).eq('artworkId', artworkId);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, message: 'Item removed' });
});

// Clear cart
app.delete('/make-server-4d7cb5f9/cart/:sessionId', async (c: any) => {
  const sessionId = c.req.param('sessionId');
  const { error } = await supabase.from('cart').delete().eq('sessionId', sessionId);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, message: 'Cart cleared' });
});

// ================= ORDERS =================

// Create order
app.post('/make-server-4d7cb5f9/orders', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const orderData = await c.req.json();
  const orderId = crypto.randomUUID();

  const { data, error } = await supabase.from('orders').insert([{ id: orderId, userId: user.id, status: 'pending', createdAt: new Date().toISOString(), ...orderData }]).select();
  if (error) return c.json({ success: false, error: error.message }, 400);

  return c.json({ success: true, order: data[0] });
});

// Get user orders
app.get('/make-server-4d7cb5f9/orders', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const { data, error } = await supabase.from('orders').select('*').eq('userId', user.id);
  if (error) return c.json({ success: false, error: error.message }, 400);
  return c.json({ success: true, orders: data });
});

// Get artisan orders
app.get('/make-server-4d7cb5f9/artisan/orders', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  // Fetch orders where the user is the artisan for any artwork in the order
  const { data, error } = await supabase.from('orders').select('*, items:artworks(*)');
  if (error) return c.json({ success: false, error: error.message }, 400);

  const artisanOrders = data.filter((order: any) => order.items?.some((item: any) => item.artisanUserId === user.id));
  return c.json({ success: true, orders: artisanOrders });
});

// ================= PAYMENTS =================

app.post('/make-server-4d7cb5f9/payment/process', async (c: any) => {
  const user = await getUserFromReq(c.req);
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const { orderId, paymentMethod, amount } = await c.req.json();
  const paymentId = crypto.randomUUID();

  const { data: paymentData, error } = await supabase.from('payments').insert([{ id: paymentId, orderId, userId: user.id, amount, paymentMethod, status: 'completed', processedAt: new Date().toISOString() }]).select();
  if (error) return c.json({ success: false, error: error.message }, 400);

  // Update order status
  const { error: orderError } = await supabase.from('orders').update({ status: 'paid', paymentId, updatedAt: new Date().toISOString() }).eq('id', orderId);
  if (orderError) return c.json({ success: false, error: orderError.message }, 400);

  return c.json({ success: true, payment: paymentData[0] });
});

// ================= NEWSLETTER =================

app.post('/make-server-4d7cb5f9/subscribe', async (c: any) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);

    const { data, error } = await supabase.from('subscribers').upsert({ email }).select();
    if (error) return c.json({ success: false, error: error.message }, 400);

    return c.json({ success: true, message: 'Subscribed' });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ================= INITIALIZE SAMPLE DATA =================

app.post('/make-server-4d7cb5f9/initialize', async (c: any) => {
  // You can include sample artisans/artworks initialization here if needed
  return c.json({ success: true, message: 'Initialization endpoint ready' });
});

// ================= START SERVER =================

const PORT = 8001;
Deno.serve({ port: PORT, handler: app.fetch });
console.log(`Server running on http://localhost:${PORT}`);


