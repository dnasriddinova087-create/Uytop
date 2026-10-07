import {
  User,
  Property,
  PropertyListResponse,
  Conversation,
  Message,
  AdminStats,
  AuditLog,
  LocationItem
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');
export const BASE_SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

export function getFullImageUrl(url?: string | null): string {
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return BASE_SERVER_URL ? `${BASE_SERVER_URL}${cleanUrl}` : cleanUrl;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('uytop_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if sending FormData (browser automatically sets boundary)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

export const api = {
  // Auth
  register: (data: any) => request<{ access_token: string; refresh_token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: { identifier: string; password: string }) => request<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => request<User>('/users/me'),
  updateMe: (data: Partial<User>) => request<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Locations
  getLocations: () => request<LocationItem[]>('/locations'),

  // Properties
  getProperties: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    return request<PropertyListResponse>(`/properties?${searchParams.toString()}`);
  },
  getNearbyProperties: (lat: number, lon: number, radiusKm: number = 10) =>
    request<Property[]>(`/properties/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`),
  getProperty: (id: number) => request<Property>(`/properties/${id}`),
  createProperty: (data: any) => request<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProperty: (id: number, data: any) => request<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  markRented: (id: number) => request<Property>(`/properties/${id}/rent`, { method: 'POST' }),
  closeProperty: (id: number) => request<Property>(`/properties/${id}/close`, { method: 'POST' }),
  reopenProperty: (id: number) => request<Property>(`/properties/${id}/reopen`, { method: 'POST' }),
  archiveProperty: (id: number) => request<{ message: string }>(`/properties/${id}`, { method: 'DELETE' }),
  uploadImages: (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return request<any[]>(`/properties/${id}/images`, {
      method: 'POST',
      body: formData,
    });
  },

  // Favorites
  getFavorites: () => request<Property[]>('/favorites'),
  addFavorite: (propertyId: number) => request<{ is_favorited: boolean }>(`/favorites/${propertyId}`, { method: 'POST' }),
  removeFavorite: (propertyId: number) => request<{ is_favorited: boolean }>(`/favorites/${propertyId}`, { method: 'DELETE' }),

  // Chat
  getConversations: () => request<Conversation[]>('/conversations'),
  startConversation: (brokerId: number, propertyId?: number, initialMessage?: string) =>
    request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ broker_id: brokerId, property_id: propertyId, initial_message: initialMessage }),
    }),
  getMessages: (conversationId: number) => request<Message[]>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, text: string) => request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),

  // Reports
  createReport: (propertyId: number, reason: string, details?: string) => request<any>('/reports', {
    method: 'POST',
    body: JSON.stringify({ property_id: propertyId, reason, details }),
  }),

  // Admin
  getAdminDashboard: () => request<AdminStats>('/admin/dashboard'),
  getAdminUsers: (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && sp.append(k, String(v)));
    return request<User[]>(`/admin/users?${sp.toString()}`);
  },
  updateUserStatus: (userId: number, data: { is_active?: boolean; is_verified?: boolean; role?: string }) =>
    request<User>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getAdminProperties: (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && sp.append(k, String(v)));
    return request<Property[]>(`/admin/properties?${sp.toString()}`);
  },
  moderateProperty: (propertyId: number, data: { status: string; rejection_reason?: string }) =>
    request<Property>(`/admin/properties/${propertyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getAuditLogs: () => request<{ items: AuditLog[]; total: number }>('/admin/audit-logs'),
};
