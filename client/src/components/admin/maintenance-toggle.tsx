import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedBy: number | null;
  updatedAt: string;
  createdAt: string;
}

export function MaintenanceToggle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get maintenance mode setting
  const { data: maintenanceSetting, isLoading, error } = useQuery<SiteSetting>({
    queryKey: ['/api/admin/settings', 'maintenance_mode'],
    queryFn: async () => {
      console.log('Fetching maintenance mode setting...');
      try {
        const result = await apiRequest('/api/admin/settings/maintenance_mode');
        console.log('Maintenance setting fetched:', result);
        return result;
      } catch (err) {
        console.error('Failed to fetch maintenance setting:', err);
        throw err;
      }
    },
    retry: false,
  });

  const isMaintenanceMode = maintenanceSetting?.value === 'true';

  // Toggle maintenance mode mutation
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log('Toggling maintenance mode to:', enabled);
      try {
        const result = await apiRequest('/api/admin/maintenance', {
          method: 'POST',
          body: JSON.stringify({ enabled }),
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Toggle response:', result);
        return result;
      } catch (err) {
        console.error('Toggle failed:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: data.maintenanceMode ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: data.message,
        variant: data.maintenanceMode ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      console.error('Failed to toggle maintenance mode:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle maintenance mode. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleToggle = async (enabled: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    toggleMaintenanceMutation.mutate(enabled);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription className="text-red-600">
            Error loading maintenance settings. Please ensure you have admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Unable to access maintenance mode settings. This feature requires admin access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Maintenance Mode
        </CardTitle>
        <CardDescription>
          Control site access for maintenance. When enabled, only admin users can access the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            {isMaintenanceMode ? (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <div>
              <p className="font-medium">
                {isMaintenanceMode ? "Maintenance Mode Active" : "Site Operational"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isMaintenanceMode 
                  ? "Non-admin users cannot access the site" 
                  : "All users can access the site normally"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isMaintenanceMode}
              onCheckedChange={handleToggle}
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium">
              {isMaintenanceMode ? "ON" : "OFF"}
            </span>
          </div>
        </div>
        
        {isMaintenanceMode && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Warning: Maintenance Mode Active</p>
                <p className="text-orange-700 mt-1">
                  Regular users will see a maintenance page. Only admin users can access the site.
                  Remember to disable maintenance mode when maintenance is complete.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {maintenanceSetting?.updatedAt && (
          <div className="mt-4 text-xs text-muted-foreground">
            Last updated: {new Date(maintenanceSetting.updatedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}