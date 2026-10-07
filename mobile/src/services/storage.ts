import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'uytop_mobile_token';
const REFRESH_TOKEN_KEY = 'uytop_mobile_refresh_token';
const USER_KEY = 'uytop_mobile_user';
const API_URL_KEY = 'uytop_mobile_api_url';

export const storage = {
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  getRefreshToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  getUser: async (): Promise<any | null> => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: async (user: any): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },
  getCustomApiUrl: async (): Promise<string | null> => {
    return AsyncStorage.getItem(API_URL_KEY);
  },
  setCustomApiUrl: async (url: string): Promise<void> => {
    await AsyncStorage.setItem(API_URL_KEY, url);
  },
};
