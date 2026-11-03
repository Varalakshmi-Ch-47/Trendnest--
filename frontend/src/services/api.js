import axios from 'axios';
import { getCartId } from '../utils/cartId';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Send this browser's cart id with every request.
api.interceptors.request.use((config) => {
  config.headers['X-Cart-Id'] = getCartId();
  return config;
});

export default api;