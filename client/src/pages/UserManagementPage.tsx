import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface UserSession {
  id: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  location: string;
  lastActiveAt: Date;
  isCurrentSession: boolean;
}

export default function UserManagementPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'roles'>('users');

  // Mock data for development (replace with API calls)
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@company.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN',
        isActive: true,
        isSuspended: false,
        twoFactorEnabled: true,
        lastLoginAt: new Date(),
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        username: 'john.doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER_ADMIN',
        isActive: true,
        isSuspended: false,
        twoFactorEnabled: false,
        lastLoginAt: new Date(Date.now() - 3600000),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 3,
        username: 'jane.smith',
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'READER',
        isActive: false,
        isSuspended: true,
        twoFactorEnabled: false,
        lastLoginAt: new Date(Date.now() - 86400000),
        createdAt: new Date('2024-02-01'),
      },
    ];

    const mockSessions: UserSession[] = [
      {
        id: 'sess_1',
        userId: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome 120.0.0.0 Windows',
        location: 'New York, US',
        lastActiveAt: new Date(),
        isCurrentSession: true,
      },
      {
        id: 'sess_2',
        userId: 2,
        ipAddress: '10.0.0.50',
        userAgent: 'Firefox 121.0 macOS',
        location: 'San Francisco, US',
        lastActiveAt: new Date(Date.now() - 1800000),
        isCurrentSession: false,
      },
    ];

    setUsers(mockUsers);
    setSessions(mockSessions);
    setIsLoading(false);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSuspendUser = async (userId: number) => {
    try {
      // API call would go here
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isSuspended: !user.isSuspended } : user
      ));
      toast({
        title: 'User status updated',
        description: 'User suspension status has been changed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // API call would go here
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast({
        title: 'Session revoked',
        description: 'User session has been terminated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'USER_ADMIN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'READER': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EXTERNAL_USER': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!hasPermission('admin:users')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management. Contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and active sessions across your organization
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('users')}
        >
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
        <Button
          variant={activeTab === 'sessions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('sessions')}
        >
          <Shield className="mr-2 h-4 w-4" />
          Active Sessions
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('roles')}
        >
          <Shield className="mr-2 h-4 w-4" />
          Roles & Permissions
        </Button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="USER_ADMIN">User Admin</SelectItem>
                <SelectItem value="READER">Reader</SelectItem>
                <SelectItem value="EXTERNAL_USER">External User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {user.isSuspended && (
                        <Ban className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">2FA:</span>
                      <span className={user.twoFactorEnabled ? 'text-green-600' : 'text-orange-600'}>
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className="font-medium">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant={user.isSuspended ? "default" : "destructive"}
                      onClick={() => handleSuspendUser(user.id)}
                      className="flex-1"
                    >
                      {user.isSuspended ? (
                        <>
                          <CheckCircle className="mr-2 h-3 w-3" />
                          Unsuspend
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-3 w-3" />
                          Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>
                Monitor and manage active user sessions across your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => {
                  const user = users.find(u => u.id === session.userId);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {user?.firstName} {user?.lastName} (@{user?.username})
                          </span>
                          {session.isCurrentSession && (
                            <Badge variant="secondary">Current Session</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.location} • {session.ipAddress}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.userAgent}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last active: {new Date(session.lastActiveAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={session.isCurrentSession}
                      >
                        <Ban className="mr-2 h-3 w-3" />
                        Revoke
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Role Hierarchy</CardTitle>
                <CardDescription>System roles and their permission levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Super Admin</div>
                      <div className="text-sm text-muted-foreground">Full system access</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      All Permissions
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">User Admin</div>
                      <div className="text-sm text-muted-foreground">User management & analytics</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Limited Admin
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Reader</div>
                      <div className="text-sm text-muted-foreground">Read-only access</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      View Only
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">External User</div>
                      <div className="text-sm text-muted-foreground">Limited external access</div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      Restricted
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>Detailed permission breakdown by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="font-medium mb-2">System Permissions:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>• admin:users (Super Admin, User Admin)</span>
                    <span>• admin:system (Super Admin)</span>
                    <span>• dashboard:view (All)</span>
                    <span>• analytics:view (All except External)</span>
                    <span>• reports:create (Admin roles)</span>
                    <span>• settings:modify (Super Admin)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}