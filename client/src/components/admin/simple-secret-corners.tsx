import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SimpleSecretCornersApplications() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/secret-corners/applications/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/secret-corners/applications/${id}/status`,
        method: 'POST',
        body: { status: "approved" }
      });
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/rejected"] });
      toast({ title: "Application approved", description: "The application has been approved successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/secret-corners/applications/${id}/status`,
        method: 'POST',
        body: { status: "rejected", reason: "Not suitable for Secret Corners" }
      });
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications/rejected"] });
      toast({ title: "Application rejected", description: "The application has been rejected." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading applications</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Secret Corners Applications (Debugging)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-100 p-4 rounded">
              <p className="font-bold">Found {applications.length} pending applications</p>
            </div>
            
            {applications.map((app: any) => (
              <div key={app.id} className="border p-4 rounded space-y-2">
                <div className="font-bold">Application ID: {app.id}</div>
                <div>Username: {app.username}</div>
                <div>Email: {app.email || 'No email'}</div>
                <div>Location: {app.location}</div>
                <div>Status: <span className="font-bold text-orange-600">{app.status}</span></div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      setSelectedId(app.id);
                      approveMutation.mutate(app.id);
                    }}
                    disabled={approveMutation.isPending && selectedId === app.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approveMutation.isPending && selectedId === app.id ? 'Approving...' : 'APPROVE'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setSelectedId(app.id);
                      rejectMutation.mutate(app.id);
                    }}
                    disabled={rejectMutation.isPending && selectedId === app.id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {rejectMutation.isPending && selectedId === app.id ? 'Rejecting...' : 'REJECT'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}