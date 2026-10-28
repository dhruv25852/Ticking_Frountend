const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '');
const BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token =
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ticking_token') : null) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('ticking_token') : null);

  const headers = {
    ...options.headers
  };

  // Only set Content-Type to application/json if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (
        response.status === 401 &&
        endpoint !== '/auth/login' &&
        endpoint !== '/auth/admin/login' &&
        endpoint !== '/auth/register'
      ) {
        // Token expired or invalid
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('ticking_token');
          sessionStorage.removeItem('ticking_user');
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('ticking_token');
          localStorage.removeItem('ticking_user');
          localStorage.removeItem('ticking_remember_me');
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:unauthorized', {
              detail: { message: data.message || 'Session expired', expired: !!data.expired }
            })
          );
        }
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  put: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  patch: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
};

export default api;
