import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";

export default function DebugApplications() {
  const [activeTab, setActiveTab] = useState("pending");
  const [directQueryResult, setDirectQueryResult] = useState<any>(null);
  
  // Manual direct query
  const fetchDirectData = async () => {
    try {
      console.log('Manually fetching applications data...');
      const timestamp = new Date().getTime();
      const result = await fetch(`/api/admin/secret-corners/applications/${activeTab}?_=${timestamp}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (!result.ok) {
        throw new Error(`Status: ${result.status}`);
      }
      
      const data = await result.json();
      console.log('Direct fetch result:', data);
      setDirectQueryResult(data);
      return data;
    } catch (error) {
      console.error('Error in direct fetch:', error);
      return null;
    }
  };

  // React Query
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/secret-corners/applications", activeTab],
    queryFn: () => {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `/api/admin/secret-corners/applications/${activeTab}?_=${timestamp}`;
      console.log(`Fetching via React Query: ${url}`);
      
      return apiRequest({ url })
        .then(data => {
          console.log(`React Query received:`, data);
          return data;
        })
        .catch(err => {
          console.error(`React Query error:`, err);
          throw err;
        });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminLayout 
        title="Debug Applications"
        description="Troubleshoot Secret Corners applications data"
      >
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Secret Corners Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Button onClick={() => refetch()}>
                Refresh React Query
              </Button>
              <Button onClick={fetchDirectData} variant="secondary">
                Direct API Fetch
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>React Query Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="text-red-500 p-4">
                      Error: {JSON.stringify(error)}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-muted-foreground p-4">
                      No applications found
                    </div>
                  ) : (
                    <pre className="bg-muted p-4 rounded-md overflow-auto h-80">
                      {JSON.stringify(applications, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Direct API Request</CardTitle>
                </CardHeader>
                <CardContent>
                  {directQueryResult === null ? (
                    <div className="text-muted-foreground p-4">
                      Click "Direct API Fetch" to load data
                    </div>
                  ) : directQueryResult.length === 0 ? (
                    <div className="text-muted-foreground p-4">
                      No applications found
                    </div>
                  ) : (
                    <pre className="bg-muted p-4 rounded-md overflow-auto h-80">
                      {JSON.stringify(directQueryResult, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}