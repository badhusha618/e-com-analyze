import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { User, LoginRequest, RegisterRequest } from '@shared/schema';

export interface AuthUser extends User {
  permissions: string[];
  token?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginLoading: boolean;
  registerLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
  loginLoading: false,
  registerLoading: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest) => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    
    return data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest) => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    
    return data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    return null;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async () => {
    const response = await apiRequest('POST', '/api/auth/refresh');
    const data = await response.json();
    
    // Update token in localStorage
    localStorage.setItem('token', data.token);
    
    return data;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User>) => {
    const response = await apiRequest('PATCH', '/api/auth/profile', updates);
    return response.json();
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    const response = await apiRequest('POST', '/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.json();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUserPermissions: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.permissions = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('token');
      })
      
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Failed to fetch user data';
        localStorage.removeItem('token');
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      
      // Change Password
      .addCase(changePassword.fulfilled, (state) => {
        // Password changed successfully, no state update needed
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to change password';
      });
  },
});

export const { clearError, setLoading, updateUserPermissions } = authSlice.actions;
export default authSlice.reducer;