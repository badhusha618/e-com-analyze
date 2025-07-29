import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { User, Role, UserSession } from '@shared/schema';

export interface UserWithDetails extends User {
  roles?: Role[];
  lastLoginFormatted?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UserFilters {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UserManagementAnalytics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  roleDistribution: Record<string, number>;
  recentLogins: UserWithDetails[];
  activeSessions: number;
}

export interface SessionWithUser extends UserSession {
  user?: UserWithDetails;
  isCurrentSession: boolean;
}

interface UserManagementState {
  users: UserWithDetails[];
  roles: Role[];
  sessions: SessionWithUser[];
  analytics: UserManagementAnalytics | null;
  filters: UserFilters;
  loading: boolean;
  error: string | null;
  activeTab: 'users' | 'sessions' | 'roles';
}

const initialState: UserManagementState = {
  users: [],
  roles: [],
  sessions: [],
  analytics: null,
  filters: {
    searchTerm: '',
    roleFilter: 'all',
    statusFilter: 'all',
    sortBy: 'lastLoginAt',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
  activeTab: 'users',
};

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async () => {
    const response = await apiRequest('GET', '/api/admin/users');
    const users = await response.json();
    
    // Enrich users with additional data
    const usersWithDetails: UserWithDetails[] = users.map((user: User) => ({
      ...user,
      lastLoginFormatted: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
      status: user.isSuspended ? 'suspended' : user.isActive ? 'active' : 'inactive',
    }));
    
    return usersWithDetails;
  }
);

export const fetchRoles = createAsyncThunk(
  'userManagement/fetchRoles',
  async () => {
    const response = await apiRequest('GET', '/api/admin/roles');
    return response.json();
  }
);

export const fetchSessions = createAsyncThunk(
  'userManagement/fetchSessions',
  async () => {
    const response = await apiRequest('GET', '/api/admin/sessions');
    return response.json();
  }
);

export const fetchUserAnalytics = createAsyncThunk(
  'userManagement/fetchAnalytics',
  async () => {
    const response = await apiRequest('GET', '/api/admin/users/analytics');
    return response.json();
  }
);

export const updateUserStatus = createAsyncThunk(
  'userManagement/updateUserStatus',
  async ({ userId, updates }: { userId: number; updates: Partial<User> }) => {
    const response = await apiRequest('PATCH', `/api/admin/users/${userId}`, updates);
    const updatedUser = await response.json();
    return {
      ...updatedUser,
      lastLoginFormatted: updatedUser.lastLoginAt ? new Date(updatedUser.lastLoginAt).toLocaleDateString() : 'Never',
      status: updatedUser.isSuspended ? 'suspended' : updatedUser.isActive ? 'active' : 'inactive',
    };
  }
);

export const revokeSession = createAsyncThunk(
  'userManagement/revokeSession',
  async (sessionId: string) => {
    await apiRequest('DELETE', `/api/admin/sessions/${sessionId}`);
    return sessionId;
  }
);

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiRequest('POST', '/api/admin/users', userData);
    const newUser = await response.json();
    return {
      ...newUser,
      lastLoginFormatted: 'Never',
      status: 'active',
    };
  }
);

export const updateUserRoles = createAsyncThunk(
  'userManagement/updateUserRoles',
  async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
    const response = await apiRequest('PATCH', `/api/admin/users/${userId}/roles`, { roleIds });
    return response.json();
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setActiveTab: (state, action: PayloadAction<'users' | 'sessions' | 'roles'>) => {
      state.activeTab = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch roles';
      })
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user analytics';
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(session => session.id !== action.payload);
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
      });
  },
});

export const { setFilters, clearFilters, setActiveTab, clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer;