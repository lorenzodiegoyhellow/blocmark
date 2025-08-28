import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  Search, 
  Ban, 
  User,
  Shield,
  Check,
  UserCog,
  UserCheck,
  Trash2,
  MoreHorizontal,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatUsername } from "@/lib/utils";
import { UserDetailsDialog } from "./user-details-dialog";

export function UsersList() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "banned" | "suspended">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newStatus, setNewStatus] = useState<"active" | "banned" | "suspended">("active");
  const [reason, setReason] = useState("");
  const [userRoles, setUserRoles] = useState<Record<'admin' | 'owner' | 'client' | 'editor', boolean>>({
    admin: false,
    owner: false,
    client: true, // Default role
    editor: false,
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editorPermissionsDialogOpen, setEditorPermissionsDialogOpen] = useState(false);
  const [editorPermissions, setEditorPermissions] = useState({
    users: false,
    locations: false,
    bookings: false,
    spotlight: false,
    secretCorners: false,
    blog: false,
    conversations: false,
    concierge: false,
    logs: false,
    analytics: false,
    reports: false
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users or users with specific status
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users", selectedFilter],
    queryFn: async () => {
      const url = selectedFilter === "all" 
        ? "/api/admin/users" 
        : `/api/admin/users/status/${selectedFilter}`;
      const response = await apiRequest({ url });
      return response;
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: number, status: string, reason: string }) => {
      const response = await apiRequest({
        url: `/api/admin/users/${userId}/status`,
        method: "PATCH",
        body: { status, reason }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "User status updated",
        description: `User has been ${newStatus === "active" ? "activated" : newStatus}`,
        variant: "default",
      });
      setStatusDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update editor permissions mutation
  const updateEditorPermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number, permissions: any }) => {
      const response = await apiRequest({
        url: `/api/admin/users/${userId}/editor-permissions`,
        method: "PATCH",
        body: { permissions }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Editor permissions updated",
        description: `Permissions have been updated for ${formatUsername(selectedUser?.username || "")}`,
        variant: "default",
      });
      setEditorPermissionsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update editor permissions",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update user roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: number, roles: string[] }) => {
      const response = await apiRequest({
        url: `/api/admin/users/${userId}/roles`,
        method: "PATCH",
        body: { roles }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "User roles updated",
        description: `Roles have been updated for ${formatUsername(selectedUser?.username || "")}`,
        variant: "default",
      });
      setRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user roles",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest({
        url: `/api/admin/users/${userId}`,
        method: "DELETE"
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: `User ${formatUsername(selectedUser?.username || "")} has been deleted`,
        variant: "default",
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter users based on search query
  const filteredUsers = users ? users.filter((user: any) => 
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phone && user.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.id && user.id.toString().includes(searchQuery))
  ) : [];

  // Handle opening the status update dialog
  const handleOpenUpdateDialog = (user: any) => {
    setSelectedUser(user);
    setNewStatus(user.status || "active");
    setReason("");
    setStatusDialogOpen(true);
  };

  // Handle opening the role update dialog
  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    
    // Reset roles then set based on user's current roles
    const initialRoles: Record<'admin' | 'owner' | 'client' | 'editor', boolean> = {
      admin: false,
      owner: false,
      client: false,
      editor: false
    };
    
    // Set user's roles
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: string) => {
        if (role === 'admin' || role === 'owner' || role === 'client' || role === 'editor') {
          initialRoles[role] = true;
        }
      });
    }
    
    setUserRoles(initialRoles);
    setRoleDialogOpen(true);
  };

  // Handle opening the editor permissions dialog
  const handleOpenEditorPermissionsDialog = (user: any) => {
    setSelectedUser(user);
    
    // Set current permissions
    const currentPermissions = user.editorPermissions || {
      users: false,
      locations: false,
      bookings: false,
      spotlight: false,
      secretCorners: false,
      blog: false,
      conversations: false,
      concierge: false,
      logs: false,
      analytics: false,
      reports: false
    };
    
    setEditorPermissions(currentPermissions);
    setEditorPermissionsDialogOpen(true);
  };

  // Handle updating editor permissions
  const handleUpdateEditorPermissions = () => {
    if (!selectedUser) return;
    
    updateEditorPermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions: editorPermissions
    });
  };

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle opening user details
  const handleOpenUserDetails = (userId: number) => {
    setSelectedUserId(userId);
    setDetailsDialogOpen(true);
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (!selectedUser) return;
    
    // Validate reason field is not empty
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the status change",
        variant: "destructive",
      });
      return;
    }
    
    updateStatusMutation.mutate({
      userId: selectedUser.id,
      status: newStatus,
      reason: reason.trim()
    });
  };

  // Handle role update
  const handleUpdateRoles = () => {
    if (!selectedUser) return;
    
    // Convert roles object to array of role strings
    const rolesArray = Object.entries(userRoles)
      .filter(([_, isActive]) => isActive)
      .map(([roleName]) => roleName);
    
    // Ensure at least one role
    if (rolesArray.length === 0) {
      toast({
        title: "Role update failed",
        description: "User must have at least one role",
        variant: "destructive",
      });
      return;
    }
    
    updateRolesMutation.mutate({
      userId: selectedUser.id,
      roles: rolesArray
    });
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  // Get badge color based on role
  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return <Badge variant="destructive" className="bg-red-100 hover:bg-red-100 text-red-800 border-red-200">
        <Shield className="mr-1 h-3 w-3" /> Admin
      </Badge>;
    } else if (roles.includes("owner")) {
      return <Badge variant="secondary" className="bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-200">
        <UserCog className="mr-1 h-3 w-3" /> Owner
      </Badge>;
    } else {
      return <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
        <UserCheck className="mr-1 h-3 w-3" /> Client
      </Badge>;
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="mr-1 h-3 w-3" /> Active
        </Badge>;
      case "banned":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Ban className="mr-1 h-3 w-3" /> Banned
        </Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Ban className="mr-1 h-3 w-3" /> Suspended
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="mr-1 h-3 w-3" /> Active
        </Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading users: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Label>Filter:</Label>
          <Select 
            value={selectedFilter} 
            onValueChange={(value) => setSelectedFilter(value as any)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full sm:w-[280px]"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
          <User className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableCaption>List of platform users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">ID</TableHead>
                <TableHead className="min-w-[120px]">Username</TableHead>
                <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Phone</TableHead>
                <TableHead className="min-w-[80px]">Role</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((user: any) => (
                <TableRow 
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleOpenUserDetails(user.id)}
                >
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <div className="truncate">
                        {user.username ? formatUsername(user.username) : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground sm:hidden truncate">
                        {user.email || "No email"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="truncate max-w-[180px]">
                      {user.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.phoneNumber || user.phone || "N/A"}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.roles || [])}</TableCell>
                  <TableCell>{getStatusBadge(user.status || "active")}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleOpenUpdateDialog(user)}
                          disabled={user.roles && user.roles.includes("admin") && user.id !== 1} // Prevent status changes for admins except for main admin
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleOpenRoleDialog(user)}
                          disabled={user.id === 1} // Prevent role changes for main admin
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Manage Roles
                        </DropdownMenuItem>
                        {user.roles?.includes('editor') && (
                          <DropdownMenuItem 
                            onClick={() => handleOpenEditorPermissionsDialog(user)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Editor Permissions
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteDialog(user)}
                          disabled={user.id === 1} // Prevent deleting main admin
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Status</DialogTitle>
            <DialogDescription>
              Change the status of user {formatUsername(selectedUser?.username || "")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={(value) => setNewStatus(value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended (Temporary)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea 
                id="reason" 
                placeholder="Provide a reason for this status change (required)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={!reason.trim() && newStatus !== "active" ? "border-yellow-300" : ""}
              />
              <p className="text-xs text-muted-foreground">
                * Required field - provide a clear reason for the status change
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={updateStatusMutation.isPending || !reason.trim()}
              variant={newStatus === "banned" ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Update roles for user {formatUsername(selectedUser?.username || "")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-admin" 
                  checked={userRoles.admin} 
                  onCheckedChange={(checked) => 
                    setUserRoles({...userRoles, admin: Boolean(checked)})
                  }
                />
                <Label htmlFor="role-admin" className="cursor-pointer">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-owner" 
                  checked={userRoles.owner}
                  onCheckedChange={(checked) => 
                    setUserRoles({...userRoles, owner: Boolean(checked)})
                  }
                />
                <Label htmlFor="role-owner" className="cursor-pointer">Property Owner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-client" 
                  checked={userRoles.client}
                  onCheckedChange={(checked) => 
                    setUserRoles({...userRoles, client: Boolean(checked)})
                  }
                />
                <Label htmlFor="role-client" className="cursor-pointer">Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-editor" 
                  checked={userRoles.editor}
                  onCheckedChange={(checked) => 
                    setUserRoles({...userRoles, editor: Boolean(checked)})
                  }
                />
                <Label htmlFor="role-editor" className="cursor-pointer">Editor (Limited Admin)</Label>
              </div>
            </div>
            
            <div className="pt-2 text-xs text-muted-foreground">
              <p>* Users can have multiple roles</p>
              <p>* At least one role must be selected</p>
              <p>* Admin role grants full access to this dashboard</p>
              <p>* Editor role grants limited access (configure permissions separately)</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateRoles} 
              disabled={updateRolesMutation.isPending || Object.values(userRoles).every(v => !v)}
            >
              {updateRolesMutation.isPending ? "Updating..." : "Update Roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {formatUsername(selectedUser?.username || "")}? This action cannot be undone.
              <div className="mt-2 p-2 bg-amber-50 text-amber-800 rounded-md text-sm">
                <strong>Warning:</strong> This will permanently delete the user account and all associated data, including:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Profile information</li>
                  <li>Booking history</li>
                  <li>Messages</li>
                  <li>Saved locations</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <UserDetailsDialog
        userId={selectedUserId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      {/* Editor Permissions Dialog */}
      <Dialog open={editorPermissionsDialogOpen} onOpenChange={setEditorPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editor Permissions</DialogTitle>
            <DialogDescription>
              Configure which admin sections {formatUsername(selectedUser?.username || "")} can access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Admin Panel Sections</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-users" 
                    checked={editorPermissions.users} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, users: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-users" className="cursor-pointer">Users Management</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-locations" 
                    checked={editorPermissions.locations} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, locations: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-locations" className="cursor-pointer">Locations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-bookings" 
                    checked={editorPermissions.bookings} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, bookings: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-bookings" className="cursor-pointer">Bookings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-spotlight" 
                    checked={editorPermissions.spotlight} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, spotlight: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-spotlight" className="cursor-pointer">Spotlight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-secretCorners" 
                    checked={editorPermissions.secretCorners} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, secretCorners: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-secretCorners" className="cursor-pointer">Secret Corners</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-blog" 
                    checked={editorPermissions.blog} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, blog: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-blog" className="cursor-pointer">Blog Management</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-conversations" 
                    checked={editorPermissions.conversations} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, conversations: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-conversations" className="cursor-pointer">Messages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-concierge" 
                    checked={editorPermissions.concierge} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, concierge: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-concierge" className="cursor-pointer">Concierge</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-analytics" 
                    checked={editorPermissions.analytics} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, analytics: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-analytics" className="cursor-pointer">Analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-reports" 
                    checked={editorPermissions.reports} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, reports: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-reports" className="cursor-pointer">Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-logs" 
                    checked={editorPermissions.logs} 
                    onCheckedChange={(checked) => 
                      setEditorPermissions({...editorPermissions, logs: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="perm-logs" className="cursor-pointer">Admin Logs</Label>
                </div>
              </div>
            </div>
            
            <div className="pt-2 text-xs text-muted-foreground">
              <p>* Select the admin sections this editor can access</p>
              <p>* Changes apply immediately after saving</p>
              <p>* Editors cannot access Security settings regardless of permissions</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorPermissionsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateEditorPermissions} 
              disabled={updateEditorPermissionsMutation.isPending}
            >
              {updateEditorPermissionsMutation.isPending ? "Updating..." : "Update Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}