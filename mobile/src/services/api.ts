import { storage } from './storage';
import { User, Property, PropertyListResponse, Conversation, Message } from '../types';

// Default LAN IP detected from host machine
export const DEFAULT_LAN_API_URL = 'http://172.50.4.33:8000/api/v1';
export const DEFAULT_SERVER_URL = 'http://172.50.4.33:8000';

let cachedApiUrl: string | null = null;

export const getApiBaseUrl = async (): Promise<string> => {
  if (cachedApiUrl) return cachedApiUrl;
  const custom = await storage.getCustomApiUrl();
  const url: string = custom || process.env.EXPO_PUBLIC_API_URL || DEFAULT_LAN_API_URL;
  cachedApiUrl = url;
  return url;
};

export const setApiBaseUrl = async (newUrl: string): Promise<void> => {
  cachedApiUrl = newUrl;
  await storage.setCustomApiUrl(newUrl);
};

export const getFullImageUrl = (url?: string | null, serverBaseUrl = DEFAULT_SERVER_URL): string => {
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${serverBaseUrl}${url}`;
  return `${serverBaseUrl}/${url}`;
};

async function mobileRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const token = await storage.getToken();

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Xatolik yuz berdi';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
      if (Array.isArray(errorDetail)) {
        errorDetail = errorDetail.map((e: any) => e.msg || e).join(', ');
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const mobileApi = {
  // Auth
  register: (data: any) =>
    mobileRequest<{ access_token: string; refresh_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { identifier: string; password: string }) =>
    mobileRequest<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => mobileRequest<User>('/users/me'),

  // Properties
  getProperties: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    return mobileRequest<PropertyListResponse>(`/properties?${searchParams.toString()}`);
  },
  getProperty: (id: number) => mobileRequest<Property>(`/properties/${id}`),
  createProperty: (data: any) =>
    mobileRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  markRented: (id: number) => mobileRequest<Property>(`/properties/${id}/rent`, { method: 'POST' }),
  closeProperty: (id: number) => mobileRequest<Property>(`/properties/${id}/close`, { method: 'POST' }),
  reopenProperty: (id: number) => mobileRequest<Property>(`/properties/${id}/reopen`, { method: 'POST' }),

  uploadPropertyImage: async (id: number, fileUri: string): Promise<any> => {
    const baseUrl = await getApiBaseUrl();
    const token = await storage.getToken();

    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('files', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/properties/${id}/images`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Rasm yuklashda xatolik');
    }

    return res.json();
  },

  // Favorites
  getFavorites: () => mobileRequest<Property[]>('/favorites'),
  addFavorite: (id: number) => mobileRequest<{ is_favorited: boolean }>(`/favorites/${id}`, { method: 'POST' }),
  removeFavorite: (id: number) => mobileRequest<{ is_favorited: boolean }>(`/favorites/${id}`, { method: 'DELETE' }),

  // Chat
  getConversations: () => mobileRequest<Conversation[]>('/conversations'),
  startConversation: (brokerId: number, propertyId?: number, initialMessage?: string) =>
    mobileRequest<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ broker_id: brokerId, property_id: propertyId, initial_message: initialMessage }),
    }),
  getMessages: (convId: number) => mobileRequest<Message[]>(`/conversations/${convId}/messages`),
  sendMessage: (convId: number, text: string) =>
    mobileRequest<Message>(`/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Locations
  getLocations: () => mobileRequest<any[]>('/locations'),
};
