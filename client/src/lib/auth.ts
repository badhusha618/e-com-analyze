// Auth utility functions
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('sessionId');
  localStorage.removeItem('permissions');
};

export const getSessionId = (): string | null => {
  return localStorage.getItem('sessionId');
};

export const setSessionId = (sessionId: string): void => {
  localStorage.setItem('sessionId', sessionId);
};

export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserPermissions = (): string[] => {
  const permissions = localStorage.getItem('permissions');
  return permissions ? JSON.parse(permissions) : [];
};

export const setUserPermissions = (permissions: string[]): void => {
  localStorage.setItem('permissions', JSON.stringify(permissions));
};

export const hasPermission = (permission: string): boolean => {
  const permissions = getUserPermissions();
  return permissions.includes(permission) || permissions.includes('admin:*');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const sessionId = getSessionId();
  
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  
  return headers;
};

// API functions for authentication
export const loginUser = async (email: string, password: string, rememberMe?: boolean) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

export const logoutUser = async () => {
  const headers = getAuthHeaders();
  
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }
  
  removeAuthToken();
};

export const getCurrentUser = async () => {
  const headers = getAuthHeaders();
  
  const response = await fetch('/api/auth/me', {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to get user profile');
  }

  return response.json();
};

export const getUserSessions = async () => {
  const headers = getAuthHeaders();
  
  const response = await fetch('/api/auth/sessions', {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to get user sessions');
  }

  return response.json();
};

export const revokeSession = async (sessionId: string) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(`/api/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to revoke session');
  }

  return response.json();
};