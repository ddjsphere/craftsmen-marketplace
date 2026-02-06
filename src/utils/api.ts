import { projectId, publicAnonKey } from './supabase/info';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const hostIsLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const BASE_URL = hostIsLocal
  ? 'http://localhost:8000/make-server-4d7cb5f9'
  : `https://${projectId}.supabase.co/functions/v1/make-server-4d7cb5f9`;

// Supabase client for auth + database
export const supabase: SupabaseClient = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// ========== AUTH ==========

// Basic signup (kept for legacy/simple use)
export async function signUp(
  email: string,
  password: string,
  name: string,
  userType: 'buyer' | 'artisan' = 'buyer'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, userType }
    }
  });
  if (error) throw error;
  return data;
}

// Full signup: creates auth user + profile + artisan + optional activity log
export async function completeSignUp(
  email: string,
  password: string,
  name: string,
  userType: 'buyer' | 'artisan' = 'buyer'
) {
  // 1️⃣ Create user in auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, userType }
    }
  });

  if (authError) throw authError;
  const userId = authData.user?.id;
  if (!userId) throw new Error('User ID not returned from Supabase Auth');

  // 2️⃣ Insert profile row
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: userId, full_name: name, role: userType }]);
  if (profileError) throw profileError;

  // 3️⃣ Insert artisan row if user is an artisan
  if (userType === 'artisan') {
    const { error: artisanError } = await supabase
      .from('artisans')
      .insert([{ id: userId, bio: '', availability_status: 'available' }]);
    if (artisanError) throw artisanError;
  }

  // 4️⃣ Optional: log signup in user_activity
  const { error: activityError } = await supabase
    .from('user_activity')
    .insert([{ profile_id: userId, action: 'signup' }]);
  if (activityError) console.warn('Activity log failed:', activityError.message);

  return authData.user;
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign in with OAuth provider
export async function signInWithProvider(provider: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
  });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current logged-in user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Update profile (auth metadata)
export async function updateProfile(profileData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.auth.updateUser({ data: profileData });
  if (error) throw error;
  return profileData;
}


// ========== ARTISANS ==========

export async function getArtisans() {
  const { data, error } = await supabase.from('artisans').select('*');
  if (error) throw error;
  return data;
}

export async function getArtisan(id: string) {
  const { data, error } = await supabase.from('artisans').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createArtisan(artisanData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('artisans').insert([{ ...artisanData, userId: user.id }]).select();
  if (error) throw error;
  return data[0];
}

export async function updateArtisan(id: string, artisanData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('artisans')
    .update(artisanData)
    .eq('id', id)
    .eq('userId', user.id)
    .select();
  if (error) throw error;
  return data[0];
}

// ========== ARTWORKS ==========

export async function getArtworks(category?: string, artisanId?: string) {
  let query = supabase.from('artworks').select('*');

  if (category && category !== 'all') query = query.eq('category', category);
  if (artisanId) query = query.eq('artisanId', artisanId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getArtwork(id: string) {
  const { data, error } = await supabase.from('artworks').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createArtwork(artworkData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('artworks').insert([{ ...artworkData, artisanUserId: user.id }]).select();
  if (error) throw error;
  return data[0];
}

export async function updateArtwork(id: string, artworkData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('artworks')
    .update(artworkData)
    .eq('id', id)
    .eq('artisanUserId', user.id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteArtwork(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('artworks').delete().eq('id', id).eq('artisanUserId', user.id);
  if (error) throw error;
  return { success: true };
}

// ========== FAVORITES ==========

export async function getFavorites() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('favorites').select('*').eq('userId', user.id);
  if (error) throw error;
  return data;
}

export async function addToFavorites(artworkId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('favorites').upsert({ userId: user.id, artworkId }).select();
  if (error) throw error;
  return data;
}

export async function removeFromFavorites(artworkId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('favorites').delete()
    .eq('userId', user.id)
    .eq('artworkId', artworkId);
  if (error) throw error;
  return { success: true };
}

// ========== CART ==========

export async function getCart(sessionId: string) {
  const { data, error } = await supabase.from('cart').select('*').eq('sessionId', sessionId);
  if (error) throw error;
  return data;
}

export async function addToCart(sessionId: string, artworkId: string, quantity: number = 1) {
  const { data, error } = await supabase.from('cart').upsert({ sessionId, artworkId, quantity }).select();
  if (error) throw error;
  return data;
}

export async function removeFromCart(sessionId: string, artworkId: string) {
  const { error } = await supabase.from('cart').delete().eq('sessionId', sessionId).eq('artworkId', artworkId);
  if (error) throw error;
  return { success: true };
}

export async function clearCart(sessionId: string) {
  const { error } = await supabase.from('cart').delete().eq('sessionId', sessionId);
  if (error) throw error;
  return { success: true };
}

// ========== ORDERS & PAYMENT ==========

export async function createOrder(orderData: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('orders').insert([{ ...orderData, userId: user.id, status: 'pending' }]).select();
  if (error) throw error;
  return data[0];
}

export async function getOrders() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('orders').select('*').eq('userId', user.id);
  if (error) throw error;
  return data;
}

export async function getArtisanOrders() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('orders').select('*');
  if (error) throw error;
  return data.filter((order: any) => order.items?.some((item: any) => item.artwork?.artisanUserId === user.id));
}

export async function processPayment(orderId: string, paymentMethod: string, amount: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('payments').insert([{
    orderId,
    userId: user.id,
    amount,
    paymentMethod,
    status: 'completed'
  }]).select();

  if (error) throw error;

  // Update order status
  await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
  return data[0];
}

// ========== SUBSCRIBE / NEWSLETTER ==========

export async function subscribe(email: string) {
  const { data, error } = await supabase.from('subscribers').upsert({ email }).select();
  if (error) throw error;
  return data;
}

// Initialize sample data by calling the serverless function (no-op if not available)
export async function initializeData() {
  try {
    await fetch(`${BASE_URL}/initialize`, { method: 'POST' });
  } catch (err) {
    // ignore — initialization is optional locally
  }
}

// ========== SESSION ID ==========

export function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// Add these to your existing utils/api.ts file

export async function saveBuyerPreferences(data: any): Promise<void> {
  const response = await fetch('/api/user/buyer-preferences', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Add your auth token if needed
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save buyer preferences');
  }
}

export async function completeSellerOnboarding(data: any): Promise<void> {
  const response = await fetch('/api/user/seller-onboarding', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Add your auth token if needed
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to complete seller setup');
  }
}
