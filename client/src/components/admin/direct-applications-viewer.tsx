import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Calendar, RefreshCw, Eye, Search, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Interface for application data from new applications table
interface Application {
  id: number;
  userId: number;
  username: string;
  email: string;
  location: string;
  motivation: string;
  contribution: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  bio?: string;
  profileImage?: string;
}

export default function DirectApplicationsViewer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Application action states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch applications using React Query
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/secret-corners/applications", activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/admin/secret-corners/applications/${activeTab}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    },
  });

  // Filter applications based on search query
  const filteredApplications = applications.filter(app => 
    app.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return apiRequest({
        url: `/api/admin/secret-corners/applications/${applicationId}/status`,
        method: "POST",
        body: { status: "approved" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Approved",
        description: "The user now has access to Secret Corners.",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications", activeTab] });
      setIsApproveDialogOpen(false);
      setSelectedApplication(null);
      setViewApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: number; reason: string }) => {
      return apiRequest({
        url: `/api/admin/secret-corners/applications/${applicationId}/status`,
        method: "POST",
        body: { status: "rejected", reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Rejected",
        description: "The user has been notified about the rejection.",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications", activeTab] });
      setIsRejectDialogOpen(false);
      setSelectedApplication(null);
      setViewApplication(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    }
  });

  // Revoke access mutation
  const revokeMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return apiRequest({
        url: `/api/admin/secret-corners/applications/${applicationId}/status`,
        method: "POST",
        body: { status: "pending" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Access Revoked",
        description: "User access has been revoked and moved back to pending status.",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications", activeTab] });
      setIsRevokeDialogOpen(false);
      setSelectedApplication(null);
      setViewApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { variant: "default" as const, label: "Approved", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case "rejected":
        return { variant: "destructive" as const, label: "Rejected", icon: <XCircle className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "secondary" as const, label: "Pending", icon: <Calendar className="h-3 w-3 mr-1" /> };
    }
  };

  // Handle approve action
  const handleApprove = (application: Application) => {
    setSelectedApplication(application);
    setIsApproveDialogOpen(true);
  };

  // Handle reject action  
  const handleReject = (application: Application) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
    setRejectionReason("");
  };

  // Handle revoke access action
  const handleRevokeAccess = (application: Application) => {
    setSelectedApplication(application);
    setIsRevokeDialogOpen(true);
  };

  // View application details
  const handleViewApplication = (application: Application) => {
    setViewApplication(application);
  };

  return (
    <>
      {/* View Application Dialog */}
      <Dialog open={viewApplication !== null} onOpenChange={(open) => !open && setViewApplication(null)}>
        {viewApplication && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Submitted on {format(new Date(viewApplication.createdAt), "PPP")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  {viewApplication.profileImage ? (
                    <AvatarImage src={viewApplication.profileImage} alt={viewApplication.username} />
                  ) : (
                    <AvatarFallback>{viewApplication.username.charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h4 className="font-medium">{viewApplication.username}</h4>
                  <p className="text-sm text-muted-foreground">{viewApplication.email}</p>
                </div>
                <div className="ml-auto">
                  <Badge 
                    variant={getStatusBadge(viewApplication.status).variant} 
                    className="ml-auto flex items-center"
                  >
                    {getStatusBadge(viewApplication.status).icon}
                    {getStatusBadge(viewApplication.status).label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {viewApplication.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {viewApplication.bio}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {viewApplication.location}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Why are you interested in Secret Corners?</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {viewApplication.motivation}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">How will you contribute to the community?</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {viewApplication.contribution}
                </p>
              </div>

              {viewApplication.status === "rejected" && viewApplication.rejectionReason && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 text-destructive flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejection Reason
                    </h4>
                    <p className="text-sm whitespace-pre-wrap bg-destructive/10 p-3 rounded text-destructive">
                      {viewApplication.rejectionReason}
                    </p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-end gap-2">
              {viewApplication.status === "pending" && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setViewApplication(null);
                      handleReject(viewApplication);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewApplication(null);
                      handleApprove(viewApplication);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {viewApplication.status !== "pending" && (
                <Button variant="outline" onClick={() => setViewApplication(null)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Secret Corners Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will grant the user immediate access to the Secret Corners feature.
              They will receive a notification about their approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedApplication && approveMutation.mutate(selectedApplication.id)} 
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Access
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Secret Corners Application</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this application.
              The user will receive a notification with this explanation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Explain why this application was rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            {rejectionReason.trim().length === 0 && (
              <p className="text-xs text-destructive mt-1">A rejection reason is required</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={rejectMutation.isPending}
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedApplication && rejectMutation.mutate({
                applicationId: selectedApplication.id,
                reason: rejectionReason.trim()
              })} 
              disabled={rejectMutation.isPending || rejectionReason.trim().length === 0}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Access Dialog */}
      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Secret Corners Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the user's access to Secret Corners and move their application back to pending status.
              The user will lose access immediately. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedApplication && revokeMutation.mutate(selectedApplication.id)} 
              disabled={revokeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Revoke Access
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Secret Corners Applications</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-destructive p-4 border border-destructive/20 rounded bg-destructive/10">
              Error loading applications: {error.message}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No {activeTab} applications found
            </div>
          ) : filteredApplications.length === 0 && searchQuery.trim() !== "" ? (
            <div className="text-center p-8 text-muted-foreground">
              No applications found matching "{searchQuery}"
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {app.profileImage ? (
                              <AvatarImage src={app.profileImage} alt={app.username} />
                            ) : (
                              <AvatarFallback>{app.username.charAt(0).toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{app.username}</div>
                            <div className="text-sm text-muted-foreground">{app.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadge(app.status).variant} 
                          className="flex w-fit items-center"
                        >
                          {getStatusBadge(app.status).icon}
                          {getStatusBadge(app.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewApplication(app)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleReject(app)}
                              >
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary"
                                onClick={() => handleApprove(app)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                            </>
                          )}
                          
                          {app.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRevokeAccess(app)}
                            >
                              <UserMinus className="h-4 w-4" />
                              <span className="sr-only">Remove Access</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}