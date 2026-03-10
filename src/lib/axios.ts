import axios from 'axios'; 

const api = axios.create({
  baseURL: '/api/v2',
  withCredentials: true
});

let accessTokenGetter: (() => string | null) | null = null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

api.interceptors.request.use((config) => {
  const accessToken = accessTokenGetter?.();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Refresh failed');
        }

        const { accessToken: newAccessToken, redirectTo } = await res.json();

        if (redirectTo) {
          const currentPath = window.location.pathname;
          const url = new URL(redirectTo, window.location.origin);
          url.searchParams.set('redirectedFrom', currentPath);
          window.location.href = url.toString();
          return Promise.reject(new Error('Redirecting to refresh provider token'));
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/api/v1/oauth/bnet/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

