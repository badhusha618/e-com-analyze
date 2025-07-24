import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isSuspended: boolean;
  isExternal: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

interface ChangeRequest {
  id: number;
  changeType: string;
  proposedChanges: any;
  currentValues: any;
  justification: string;
  status: string;
  emergencyRequest: boolean;
  expiresAt: string;
  createdAt: string;
  requester: {
    id: number;
    username: string;
    email: string;
  };
}

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  changeSummary?: string;
  riskScore?: number;
  isAnomalous: boolean;
  timestamp: string;
  admin: {
    id: number;
    username: string;
    email: string;
  };
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  const queryClient = useQueryClient();

  // Fetch users with pagination and filtering
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/user/admin/users', page, searchTerm, statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/user/admin/users?page=${page}&search=${searchTerm}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ['/api/user/admin/roles'],
    queryFn: async () => {
      const response = await fetch('/api/user/admin/roles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
  });

  // Fetch change requests
  const { data: changeRequestsData } = useQuery({
    queryKey: ['/api/user/admin/change-requests'],
    queryFn: async () => {
      const response = await fetch('/api/user/admin/change-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
  });

  // Fetch audit logs
  const { data: auditLogsData } = useQuery({
    queryKey: ['/api/user/admin/audit-log'],
    queryFn: async () => {
      const response = await fetch('/api/user/admin/audit-log', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
  });

  // Fetch anomalies
  const { data: anomaliesData } = useQuery({
    queryKey: ['/api/user/admin/anomalies'],
    queryFn: async () => {
      const response = await fetch('/api/user/admin/anomalies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/user/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/users'] });
      setIsCreateDialogOpen(false);
    },
  });

  // Update user roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roleData }: { userId: number; roleData: any }) => {
      const response = await fetch(`/api/user/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(roleData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/change-requests'] });
      setIsRoleDialogOpen(false);
    },
  });

  // Approve change request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason?: string }) => {
      const response = await fetch(`/api/user/admin/change-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/users'] });
    },
  });

  // Reject change request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason: string }) => {
      const response = await fetch(`/api/user/admin/change-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/change-requests'] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/user/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/admin/users'] });
    },
  });

  const getStatusBadge = (user: User) => {
    if (user.isSuspended) return <Badge variant="destructive">Suspended</Badge>;
    if (!user.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (user.isExternal) return <Badge variant="outline">External</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return null;
    if (riskScore >= 0.7) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 0.4) return <Badge variant="outline">Medium Risk</Badge>;
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  const CreateUserDialog = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      roleIds: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createUserMutation.mutate(formData);
    };

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified roles and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Assign Roles</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {(rolesData as any)?.roles?.map((role: Role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={formData.roleIds.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                        } else {
                          setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== role.id) });
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role.id}`} className="text-sm">
                      {role.name} {role.description && `- ${role.description}`}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const UpdateRolesDialog = () => {
    const [roleData, setRoleData] = useState({
      roleIds: selectedUser?.roles.map(r => r.id) || [],
      justification: '',
      emergencyRequest: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUser) {
        updateRolesMutation.mutate({
          userId: selectedUser.id,
          roleData: { ...roleData, userId: selectedUser.id },
        });
      }
    };

    return (
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update User Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedUser?.username} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Roles</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {(rolesData as any)?.roles?.map((role: Role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`update-role-${role.id}`}
                      checked={roleData.roleIds.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoleData({ ...roleData, roleIds: [...roleData.roleIds, role.id] });
                        } else {
                          setRoleData({ ...roleData, roleIds: roleData.roleIds.filter(id => id !== role.id) });
                        }
                      }}
                    />
                    <Label htmlFor={`update-role-${role.id}`} className="text-sm">
                      <span className="font-medium">{role.name}</span>
                      {role.description && <span className="text-muted-foreground ml-2">- {role.description}</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="justification">Justification (Required)</Label>
              <Textarea
                id="justification"
                value={roleData.justification}
                onChange={(e) => setRoleData({ ...roleData, justification: e.target.value })}
                placeholder="Provide a reason for this role change..."
                required
                minLength={10}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency"
                checked={roleData.emergencyRequest}
                onCheckedChange={(checked) => setRoleData({ ...roleData, emergencyRequest: checked })}
              />
              <Label htmlFor="emergency">Emergency Request (Bypass approval workflow)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRolesMutation.isPending}>
                {updateRolesMutation.isPending ? 'Updating...' : 'Update Roles'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Secure user administration with role-based access control and audit trails.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Change Requests
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Activity className="h-4 w-4 mr-2" />
            Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : (
                    (usersData as any)?.users?.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <div className="text-sm">
                              {format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {(usersData as any)?.pagination && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(((usersData as any).pagination.page - 1) * (usersData as any).pagination.limit) + 1} to{' '}
                {Math.min((usersData as any).pagination.page * (usersData as any).pagination.limit, (usersData as any).pagination.total)} of{' '}
                {(usersData as any).pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= (usersData as any).pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Change Requests</CardTitle>
              <CardDescription>
                Review and approve user role change requests that require authorization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(changeRequestsData as any)?.requests?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending change requests
                </div>
              ) : (
                <div className="space-y-4">
                  {(changeRequestsData as any)?.requests?.map((request: ChangeRequest) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={request.emergencyRequest ? "destructive" : "outline"}>
                              {request.changeType}
                            </Badge>
                            {request.emergencyRequest && (
                              <Badge variant="destructive">EMERGENCY</Badge>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              Requested by: {request.requester.username} ({request.requester.email})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Justification:</div>
                            <div className="text-sm text-muted-foreground">{request.justification}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Expires:</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(request.expiresAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveRequestMutation.mutate({ requestId: request.id })}
                            disabled={approveRequestMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Provide a reason for rejection:');
                              if (reason) {
                                rejectRequestMutation.mutate({ requestId: request.id, reason });
                              }
                            }}
                            disabled={rejectRequestMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all user management actions with risk assessment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(auditLogsData as any)?.auditLogs?.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          {log.isAnomalous && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.admin.username}</div>
                          <div className="text-sm text-muted-foreground">{log.admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm">{log.changeSummary}</div>
                      </TableCell>
                      <TableCell>{getRiskBadge(log.riskScore)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                AI-powered detection of suspicious user management activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(anomaliesData as any)?.anomalies?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No anomalies detected in the selected time period
                </div>
              ) : (
                <div className="space-y-4">
                  {(anomaliesData as any)?.anomalies?.map((anomaly: AuditLog) => (
                    <Alert key={anomaly.id} className="border-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {anomaly.action} by {anomaly.admin.username}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {anomaly.changeSummary}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(anomaly.timestamp), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getRiskBadge(anomaly.riskScore)}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Investigate
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Monitor and manage active user sessions across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Session management feature coming soon. This will show active user sessions
                with the ability to revoke sessions and monitor user activity.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UpdateRolesDialog />
    </div>
  );
};

export default UserManagement;