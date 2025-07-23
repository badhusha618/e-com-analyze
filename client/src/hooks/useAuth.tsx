import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser,
  getAuthToken,
  setAuthToken,
  setSessionId,
  setUserData,
  setUserPermissions,
  getUserData,
  removeAuthToken,
  isTokenExpired 
} from '@/lib/auth';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isSuspended: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = getAuthToken();
    const savedUser = getUserData();
    
    if (token && savedUser && !isTokenExpired(token)) {
      try {
        // Verify token with server
        const userProfile = await getCurrentUser();
        setUser(userProfile.user);
      } catch (error) {
        // Token is invalid, clear auth data
        removeAuthToken();
        setUser(null);
      }
    } else if (savedUser) {
      // Token expired or missing, clear auth data
      removeAuthToken();
      setUser(null);
    }
    
    setIsLoading(false);
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password, rememberMe);
      
      // Store auth data
      setAuthToken(response.token);
      setSessionId(response.sessionId);
      setUserData(response.user);
      setUserPermissions(response.user.permissions);
      
      setUser(response.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(userData);
      
      // Store auth data (auto-login after registration)
      setAuthToken(response.token);
      setSessionId(response.sessionId);
      setUserData(response.user);
      setUserPermissions(response.user.permissions);
      
      setUser(response.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setError(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const userProfile = await getCurrentUser();
      setUser(userProfile.user);
      setUserData(userProfile.user);
      setUserPermissions(userProfile.user.permissions);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission) || user.permissions.includes('admin:*');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}