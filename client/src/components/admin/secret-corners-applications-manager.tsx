import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";

// Icons
import {
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  MapPin,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";

// TypeScript interfaces (would normally be imported from a separate file)
interface SecretCornersApplication {
  id: number;
  username: string;
  email?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  secretCornersAccess: string;
  secretCornersApplication: string;
  secretCornersAppliedAt: string;
  secretCornersApprovedAt?: string;
  secretCornersApprovedBy?: number;
  secretCornersRejectionReason?: string;
}

export default function SecretCornersApplicationsManager() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<SecretCornersApplication | null>(null);
  const [viewApplication, setViewApplication] = useState<SecretCornersApplication | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  // Fetch applications based on active tab with cache busting
  const { data: applications = [], isLoading, error, isFetched, refetch } = useQuery({
    queryKey: ["/api/admin/secret-corners/applications", activeTab],
    queryFn: () => {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `/api/admin/secret-corners/applications/${activeTab}?_=${timestamp}`;
      console.log(`Fetching Secret Corners applications with status: ${activeTab} (${url})`);
      
      return apiRequest({ url })
        .then(data => {
          console.log(`Retrieved ${data.length} Secret Corners applications:`, data);
          return data;
        })
        .catch(err => {
          console.error(`Error fetching Secret Corners applications: ${err.message}`);
          throw err;
        });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately
    gcTime: 0 // Don't cache results
  });
  
  // Force a refetch when tab changes
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  // Log when the query has completed fetching
  useEffect(() => {
    if (isFetched) {
      console.log(`Secret Corners applications query completed. Status: ${activeTab}`);
      console.log(`Applications data:`, applications);
    }
  }, [isFetched, applications, activeTab]);

  // Approve application mutation
  const approveMutation = useMutation({
    mutationFn: (userId: number) => {
      return apiRequest({ 
        url: `/api/admin/secret-corners/applications/${userId}/status`,
        method: "POST",
        body: { status: "approved" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Approved",
        description: "The user now has access to Secret Corners.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      setIsApproveDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to approve application: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number, reason: string }) => {
      return apiRequest({ 
        url: `/api/admin/secret-corners/applications/${userId}/status`,
        method: "POST",
        body: { status: "rejected", reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Rejected",
        description: "The user has been notified about the rejection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secret-corners/applications"] });
      setIsRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to reject application: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  // Log applications data for debugging
  console.log(`Current applications data (${activeTab}):`, applications);
  
  // Filter applications by search term
  const filteredApplications = applications.filter((app: SecretCornersApplication) => {
    if (!app) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      app.username?.toLowerCase().includes(searchLower) ||
      (app.email && app.email.toLowerCase().includes(searchLower)) ||
      (app.location && app.location.toLowerCase().includes(searchLower))
    );
  });
  
  // Log filtered applications for debugging
  console.log(`Filtered applications (${activeTab}):`, filteredApplications);

  // Handle approve action
  const handleApprove = (application: SecretCornersApplication) => {
    setSelectedApplication(application);
    setIsApproveDialogOpen(true);
  };

  // Handle reject action
  const handleReject = (application: SecretCornersApplication) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  // Handle view application details
  const handleViewApplication = (application: SecretCornersApplication) => {
    setViewApplication(application);
  };

  // Confirm approval action
  const confirmApproval = () => {
    if (selectedApplication) {
      approveMutation.mutate(selectedApplication.id);
    }
  };

  // Confirm rejection action
  const confirmRejection = () => {
    if (selectedApplication && rejectionReason.trim().length > 0) {
      rejectMutation.mutate({
        userId: selectedApplication.id,
        reason: rejectionReason.trim(),
      });
    }
  };

  // Determine status badge properties based on secretCornersAccess, not status
  const getStatusBadge = (secretCornersAccess: string) => {
    switch (secretCornersAccess) {
      case "approved":
        return { variant: "success" as const, label: "Approved", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case "rejected":
        return { variant: "destructive" as const, label: "Rejected", icon: <XCircle className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "outline" as const, label: "Pending", icon: <Calendar className="h-3 w-3 mr-1" /> };
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center p-8 text-destructive">
        <p>Error loading applications. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Application Dialog */}
      <Dialog open={viewApplication !== null} onOpenChange={(open) => !open && setViewApplication(null)}>
        {viewApplication && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Submitted on {viewApplication.secretCornersAppliedAt ? 
                  format(new Date(viewApplication.secretCornersAppliedAt), "PPP") : 
                  format(new Date(viewApplication.createdAt), "PPP")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{viewApplication.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{viewApplication.username}</h4>
                  <p className="text-sm text-muted-foreground">{viewApplication.email || "No email provided"}</p>
                </div>
                <div className="ml-auto">
                  <Badge 
                    variant={getStatusBadge(viewApplication.secretCornersAccess).variant as any} 
                    className="ml-auto flex items-center"
                  >
                    {getStatusBadge(viewApplication.secretCornersAccess).icon}
                    {getStatusBadge(viewApplication.secretCornersAccess).label}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Bio
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {viewApplication.bio || "No bio provided"}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Secret Corners Application
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {viewApplication.secretCornersApplication || "No application text provided"}
                </p>
              </div>

              {viewApplication.location && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {viewApplication.location}
                  </p>
                </div>
              )}

              {viewApplication.secretCornersAccess === "rejected" && viewApplication.secretCornersRejectionReason && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejection Reason
                    </h4>
                    <p className="text-sm whitespace-pre-wrap bg-destructive/10 p-3 rounded text-destructive">
                      {viewApplication.secretCornersRejectionReason}
                    </p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-end gap-2">
              {viewApplication.secretCornersAccess === "pending" && (
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
              {viewApplication.secretCornersAccess !== "pending" && (
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
            <AlertDialogCancel onClick={() => setIsApproveDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApproval} disabled={approveMutation.isPending}>
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
            <AlertDialogCancel onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectionReason("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRejection} 
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

      <Card>
        <CardHeader>
          <CardTitle>Secret Corners Applications</CardTitle>
          <CardDescription>
            Review and manage applications for exclusive Secret Corners access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="m-0">
            {filteredApplications.length === 0 ? (
              <EmptyState 
                icon={<User className="h-10 w-10 text-muted-foreground" />}
                title={`No ${activeTab} applications`}
                description={activeTab === "pending" 
                  ? "There are no pending applications to review."
                  : `There are no ${activeTab} applications to display.`
                }
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Applied On</TableHead>
                      {activeTab !== "pending" && (
                        <TableHead>Reviewed On</TableHead>
                      )}
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application: SecretCornersApplication) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {application.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{application.username}</div>
                              <div className="text-xs text-muted-foreground">{application.email || "No email"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {application.secretCornersAppliedAt ? 
                              format(new Date(application.secretCornersAppliedAt), "MMM d, yyyy") :
                              format(new Date(application.createdAt), "MMM d, yyyy")
                            }
                          </div>
                        </TableCell>
                        {activeTab !== "pending" && (
                          <TableCell>
                            <div className="text-sm">
                              {application.secretCornersApprovedAt
                                ? format(new Date(application.secretCornersApprovedAt), "MMM d, yyyy")
                                : "—"}
                            </div>
                            {application.secretCornersApprovedBy && (
                              <div className="text-xs text-muted-foreground">
                                by Admin #{application.secretCornersApprovedBy}
                              </div>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(application.secretCornersAccess).variant as any} 
                            className="flex w-fit items-center"
                          >
                            {getStatusBadge(application.secretCornersAccess).icon}
                            {getStatusBadge(application.secretCornersAccess).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewApplication(application)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
                            {application.secretCornersAccess === "pending" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleReject(application)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-600 hover:bg-green-600/10"
                                  onClick={() => handleApprove(application)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}