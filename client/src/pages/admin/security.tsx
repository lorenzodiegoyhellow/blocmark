import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/lib/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SecurityStatus } from '@/components/security/SecurityStatus';
import { MaintenanceToggle } from '@/components/admin/maintenance-toggle';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertCircle, FileText, BarChart, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function SecurityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch security logs
  const { data: securityLogs, isLoading: logsLoading, error: logsError, refetch: refetchLogs } = useQuery({
    queryKey: ['/api/security/logs'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/security/logs?lines=50');
        if (!response.ok) {
          throw new Error('Failed to fetch security logs');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching security logs:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Function to format log timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  // Run health check
  const runHealthCheck = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/security/healthcheck');
      const data = await response.json();
      
      toast({
        title: 'Health Check',
        description: `Status: ${data.status} at ${data.timestamp}`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Health Check Failed',
        description: 'Could not perform security health check',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminLayout 
        title="Security Dashboard" 
        description="Monitor system security, review logs, and ensure platform integrity"
      >
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Audit Logs
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Security Logs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <SecurityStatus />
              
              <MaintenanceToggle />
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      Security Metrics
                    </CardTitle>
                    <CardDescription>
                      Overview of system security performance and threats detected
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => refetchLogs()}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 py-0"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-none border">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-3xl font-bold text-primary mb-1">{securityLogs?.securityLogs?.length || 0}</div>
                        <div className="text-sm text-muted-foreground">Security Alerts</div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-3xl font-bold text-primary mb-1">{securityLogs?.auditLogs?.length || 0}</div>
                        <div className="text-sm text-muted-foreground">Audit Events</div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <Button 
                          onClick={runHealthCheck} 
                          disabled={isRefreshing}
                          className="gap-2"
                        >
                          {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
                          Run Health Check
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audit">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>
                      Detailed log of user actions and system events
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => refetchLogs()}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 py-0"
                    disabled={logsLoading}
                  >
                    {logsLoading ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      <RefreshCw className="h-4 w-4" />
                    }
                    <span className="ml-1">Refresh</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="flex justify-center my-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : logsError ? (
                    <div className="flex flex-col items-center gap-4 my-6">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                      <p className="text-red-500">Failed to load audit logs</p>
                      <Button onClick={() => refetchLogs()}>Retry</Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left font-medium text-sm">Time</th>
                            <th className="p-2 text-left font-medium text-sm">User</th>
                            <th className="p-2 text-left font-medium text-sm">Action</th>
                            <th className="p-2 text-left font-medium text-sm">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {securityLogs?.auditLogs && securityLogs.auditLogs.length > 0 ? (
                            securityLogs.auditLogs.map((log: any, index: number) => (
                              <tr key={index} className="border-b hover:bg-muted/50">
                                <td className="p-2 text-sm">{formatTimestamp(log.timestamp)}</td>
                                <td className="p-2 text-sm">{log.userId || 'System'}</td>
                                <td className="p-2 text-sm">{log.message || log.level || 'Unknown'}</td>
                                <td className="p-2 text-sm">
                                  {log.path ? `${log.method} ${log.path}` : ''}
                                  {log.operationType ? ` (${log.operationType})` : ''}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                No audit logs found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Security Logs
                    </CardTitle>
                    <CardDescription>
                      Security incidents, threats, and suspicious activity
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => refetchLogs()}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 py-0"
                    disabled={logsLoading}
                  >
                    {logsLoading ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      <RefreshCw className="h-4 w-4" />
                    }
                    <span className="ml-1">Refresh</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="flex justify-center my-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : logsError ? (
                    <div className="flex flex-col items-center gap-4 my-6">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                      <p className="text-red-500">Failed to load security logs</p>
                      <Button onClick={() => refetchLogs()}>Retry</Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left font-medium text-sm">Time</th>
                            <th className="p-2 text-left font-medium text-sm">Level</th>
                            <th className="p-2 text-left font-medium text-sm">IP</th>
                            <th className="p-2 text-left font-medium text-sm">Path</th>
                            <th className="p-2 text-left font-medium text-sm">Threats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {securityLogs?.securityLogs && securityLogs.securityLogs.length > 0 ? (
                            securityLogs.securityLogs.map((log: any, index: number) => (
                              <tr key={index} className="border-b hover:bg-muted/50">
                                <td className="p-2 text-sm">{formatTimestamp(log.timestamp)}</td>
                                <td className="p-2 text-sm">
                                  <span className={
                                    log.level === 'warn' ? 'text-yellow-500 font-medium' : 
                                    log.level === 'error' ? 'text-red-500 font-medium' : 
                                    'text-green-500 font-medium'
                                  }>
                                    {log.level || 'info'}
                                  </span>
                                </td>
                                <td className="p-2 text-sm">{log.ip || 'Unknown'}</td>
                                <td className="p-2 text-sm">{log.path || 'N/A'}</td>
                                <td className="p-2 text-sm">
                                  {log.threats ? (
                                    <div className="space-y-1">
                                      {Object.keys(log.threats).map((threatType) => (
                                        <div key={threatType} className="text-xs">
                                          <span className="font-medium">{threatType}:</span> {
                                            Array.isArray(log.threats[threatType]) ? 
                                            log.threats[threatType].length : 
                                            'detected'
                                          }
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    'None'
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                No security logs found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}