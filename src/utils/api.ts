import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@supabase/supabase-js@2';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d7cb5f9`;

// Create Supabase client for auth
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Get access token from Supabase session
async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error(`API error on ${endpoint}:`, data);
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============= AUTH =============

export async function signUp(email: string, password: string, name: string, userType: 'buyer' | 'artisan' = 'buyer') {
  return fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, userType }),
  });
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign in with OAuth provider (google, facebook, etc.)
export async function signInWithProvider(provider: string) {
  try {
    // redirectTo ensures users come back to the app after provider auth
    const result = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });

    // Supabase usually redirects for OAuth flows; return the result for completeness
    return result;
  } catch (error) {
    console.error('OAuth sign-in error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const response = await fetchApi('/auth/profile');
  return response.user;
}

export async function updateProfile(profileData: any) {
  return fetchApi('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// ============= ARTISANS =============

export async function getArtisans() {
  return fetchApi('/artisans');
}

export async function getArtisan(id: string) {
  return fetchApi(`/artisans/${id}`);
}

export async function createArtisan(artisanData: any) {
  return fetchApi('/artisans', {
    method: 'POST',
    body: JSON.stringify(artisanData),
  });
}

export async function updateArtisan(id: string, artisanData: any) {
  return fetchApi(`/artisans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(artisanData),
  });
}

// ============= ARTWORKS =============

export async function getArtworks(category?: string, artisanId?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (artisanId) params.append('artisanId', artisanId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi(`/artworks${query}`);
}

export async function getArtwork(id: string) {
  return fetchApi(`/artworks/${id}`);
}

export async function createArtwork(artworkData: any) {
  return fetchApi('/artworks', {
    method: 'POST',
    body: JSON.stringify(artworkData),
  });
}

export async function updateArtwork(id: string, artworkData: any) {
  return fetchApi(`/artworks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(artworkData),
  });
}

export async function deleteArtwork(id: string) {
  return fetchApi(`/artworks/${id}`, {
    method: 'DELETE',
  });
}

// ============= FAVORITES =============

export async function getFavorites() {
  return fetchApi('/favorites');
}

export async function addToFavorites(artworkId: string) {
  return fetchApi(`/favorites/${artworkId}`, {
    method: 'POST',
  });
}

export async function removeFromFavorites(artworkId: string) {
  return fetchApi(`/favorites/${artworkId}`, {
    method: 'DELETE',
  });
}

// ============= CART =============

export async function getCart(sessionId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/cart/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function addToCart(sessionId: string, artworkId: string, quantity: number = 1) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/cart/${sessionId}/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artworkId, quantity }),
  });
  return response.json();
}

export async function removeFromCart(sessionId: string, artworkId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/cart/${sessionId}/remove/${artworkId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function clearCart(sessionId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/cart/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

// ============= ORDERS =============

export async function createOrder(orderData: any) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function getOrders() {
  return fetchApi('/orders');
}

export async function getArtisanOrders() {
  return fetchApi('/artisan/orders');
}

// ============= PAYMENT =============

export async function processPayment(orderId: string, paymentMethod: string, amount: number) {
  return fetchApi('/payment/process', {
    method: 'POST',
    body: JSON.stringify({ orderId, paymentMethod, amount }),
  });
}

// ============= INITIALIZATION =============

export async function initializeData() {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

// ============= SESSION MANAGEMENT =============

export function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}