export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hospital-management-system-p2g2.onrender.com';
export default API_BASE_URL;

// ─── Axios instance with automatic token refresh ─────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies (refreshToken cookie) on every request
});

// Attach the latest access token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = []; // queued requests waiting for a new token

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
};

// On 401, try to get a fresh access token using the stored refreshToken
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh finishes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try cookie-based refresh first, then fall back to stored refreshToken
        const storedRefresh = localStorage.getItem('refreshToken');
        let newAccessToken = null;

        try {
          // Attempt cookie-based refresh (works on same device)
          const res = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          newAccessToken = res.data?.accessToken;
        } catch (_) {
          // Cookie refresh failed — try sending refreshToken in request body
          if (storedRefresh) {
            const res = await axios.post(
              `${API_BASE_URL}/api/auth/refresh-token`,
              { refreshToken: storedRefresh },
              { withCredentials: true }
            );
            newAccessToken = res.data?.accessToken;
          }
        }

        if (!newAccessToken) throw new Error('No new access token received');

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('acessToken', newAccessToken); // keep legacy key in sync
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('acessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };
