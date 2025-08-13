import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, create a default user
  useEffect(() => {
    const demoUser: AuthUser = {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin'
    };
    setUser(demoUser);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simple demo login
    const demoUser: AuthUser = {
      id: 1,
      username: 'demo',
      email: email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin'
    };
    setUser(demoUser);
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
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