const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('Orderin_super_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Check for 401 Unauthorized globally
    if (response.status === 401) {
      localStorage.removeItem('Orderin_super_token');
      localStorage.removeItem('Orderin_current_user_super');
      window.dispatchEvent(new Event('auth_session_expired'));
      throw new Error('Unauthorized session. Please log in again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed with status ' + response.status);
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}
