import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TestMaintenancePage() {
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ username: "lorenzodiego", password: "diego" });

  // Check if logged in
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    }
  });

  // Check admin status
  const { data: adminStatus, refetch: refetchAdminStatus } = useQuery({
    queryKey: ["/api/admin/check-admin"],
    queryFn: async () => {
      try {
        return await apiRequest({ url: "/api/admin/check-admin" });
      } catch {
        return { isAdmin: false, reason: "Error checking admin status" };
      }
    },
    enabled: !!user
  });

  // Get maintenance status
  const { data: maintenanceStatus, refetch: refetchMaintenance } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    queryFn: async () => {
      try {
        return await apiRequest({ url: "/api/admin/maintenance" });
      } catch {
        return { enabled: false };
      }
    },
    enabled: adminStatus?.isAdmin === true
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) => 
      apiRequest({ url: "/api/login", method: "POST", body: data }),
    onSuccess: async () => {
      toast({ title: "Logged in successfully!" });
      await refetchUser();
      await refetchAdminStatus();
      await refetchMaintenance();
    },
    onError: (error: any) => {
      toast({ 
        title: "Login failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Toggle maintenance mutation
  const toggleMaintenance = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest({ 
        url: "/api/admin/maintenance", 
        method: "PUT", 
        body: { enabled } 
      }),
    onSuccess: () => {
      toast({ title: "Maintenance mode updated!" });
      refetchMaintenance();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update maintenance mode", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest({ url: "/api/logout", method: "POST" }),
    onSuccess: () => {
      toast({ title: "Logged out" });
      window.location.reload();
    }
  });

  // Test regular endpoint
  const testRegularEndpoint = async () => {
    try {
      const res = await fetch("/api/locations", { credentials: "include" });
      if (res.status === 503) {
        toast({ 
          title: "Maintenance mode active!", 
          description: "Regular endpoint returned 503 as expected",
          variant: "default"
        });
      } else {
        toast({ 
          title: `Endpoint returned ${res.status}`, 
          description: await res.text()
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Error testing endpoint", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Maintenance Mode Test Page</h1>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>1. Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
              <Button 
                onClick={() => loginMutation.mutate(loginForm)}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600">✓ Logged in as: {user.username}</p>
              <p>User ID: {user.id}</p>
              <p>Roles: {user.roles?.join(", ")}</p>
              <Button onClick={() => logoutMutation.mutate()} variant="outline">
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Check Card */}
      <Card>
        <CardHeader>
          <CardTitle>2. Admin Status</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p>Is Admin: <strong className={adminStatus?.isAdmin ? "text-green-600" : "text-red-600"}>
                {adminStatus?.isAdmin ? "YES" : "NO"}
              </strong></p>
              <p>Reason: {adminStatus?.reason}</p>
              <p>Debug: {JSON.stringify(adminStatus)}</p>
            </div>
          ) : (
            <p className="text-gray-500">Login first to check admin status</p>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Control Card */}
      <Card>
        <CardHeader>
          <CardTitle>3. Maintenance Mode Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminStatus?.isAdmin ? (
            <>
              <div className="flex items-center gap-4">
                <p>Current Status:</p>
                <span className={`font-bold ${maintenanceStatus?.enabled ? "text-orange-600" : "text-green-600"}`}>
                  {maintenanceStatus?.enabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => toggleMaintenance.mutate(true)}
                  disabled={maintenanceStatus?.enabled || toggleMaintenance.isPending}
                  variant="destructive"
                >
                  Enable Maintenance
                </Button>
                <Button 
                  onClick={() => toggleMaintenance.mutate(false)}
                  disabled={!maintenanceStatus?.enabled || toggleMaintenance.isPending}
                  variant="default"
                >
                  Disable Maintenance
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">You need admin access to control maintenance mode</p>
          )}
        </CardContent>
      </Card>

      {/* Test Endpoints Card */}
      <Card>
        <CardHeader>
          <CardTitle>4. Test Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testRegularEndpoint} variant="outline">
            Test Regular Endpoint (/api/locations)
          </Button>
          <p className="text-sm text-gray-600">
            This should return 503 when maintenance is enabled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}