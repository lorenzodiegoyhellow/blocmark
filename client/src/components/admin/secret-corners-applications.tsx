import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Eye, Calendar, Camera, MapPin, ExternalLink, FileText, Search, Heart, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

// Type for application data
interface SecretCornersApplication {
  id: number;
  userId: number;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  bio: string | null;
  profileImage: string | null;
  location: string;
  motivation: string;
  contribution: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export default function SecretCornersApplications() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<SecretCornersApplication | null>(null);
  const [viewApplication, setViewApplication] = useState<SecretCornersApplication | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  // Fetch applications based on active tab
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/secret-corners/applications", activeTab],
    queryFn: () => apiRequest({ url: `/api/admin/secret-corners/applications/${activeTab}` }),
  });

  // Approve application mutation
  const approveMutation = useMutation({
    mutationFn: (applicationId: number) => {
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
        description: `Failed to approve application: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: number, reason: string }) => {
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
        description: `Failed to reject application: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  // Filter applications by search term
  const filteredApplications = applications.filter((app: SecretCornersApplication) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.username.toLowerCase().includes(searchLower) ||
      (app.email && app.email.toLowerCase().includes(searchLower)) ||
      app.location.toLowerCase().includes(searchLower) ||
      app.motivation.toLowerCase().includes(searchLower) ||
      app.contribution.toLowerCase().includes(searchLower)
    );
  });

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
    console.log("Opening application dialog:", application);
    console.log("Application status:", application.status);
    console.log("Is status pending?", application.status === "pending");
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
        applicationId: selectedApplication.id,
        reason: rejectionReason.trim(),
      });
    }
  };

  // Determine status badge properties
  const getStatusBadge = (status: string) => {
    switch (status) {
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
                Submitted on {format(new Date(viewApplication.createdAt), "PPP")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  {viewApplication.profileImage && (
                    <AvatarImage src={viewApplication.profileImage} alt={viewApplication.username} />
                  )}
                  <AvatarFallback>{viewApplication.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{viewApplication.username}</h4>
                  <p className="text-sm text-muted-foreground">{viewApplication.email || 'No email provided'}</p>
                  {viewApplication.phoneNumber && (
                    <p className="text-sm text-muted-foreground">📞 {viewApplication.phoneNumber}</p>
                  )}
                </div>
                <div className="ml-auto">
                  <Badge variant={getStatusBadge(viewApplication.status).variant as any} className="flex items-center">
                    {getStatusBadge(viewApplication.status).icon}
                    {getStatusBadge(viewApplication.status).label}
                  </Badge>
                </div>
              </div>

              {viewApplication.bio && (
                <div className="border rounded-lg p-3 bg-muted/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">User Bio</h5>
                  <p className="text-sm">{viewApplication.bio}</p>
                </div>
              )}

              <Separator />
              
              {/* Debug info - remove after testing */}
              <div className="text-xs text-muted-foreground">
                Debug: Status = "{viewApplication.status}" (type: {typeof viewApplication.status})
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{viewApplication.location}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Why They Want to Join
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{viewApplication.motivation}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  What They Can Contribute
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{viewApplication.contribution}</p>
              </div>



              {viewApplication.status === "rejected" && viewApplication.rejectionReason && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center text-destructive">
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

            {/* Action buttons */}
            <div className="flex justify-end gap-2 p-4 border-t">
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
                    variant="default"
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
              <Button 
                variant="outline" 
                onClick={() => setViewApplication(null)}
              >
                Close
              </Button>
            </div>

            <DialogFooter className="gap-2">
              <span className="text-sm text-muted-foreground">Status: {viewApplication.status}</span>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
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
            {/* EMERGENCY BUTTONS - Test for visibility */}
            {activeTab === "pending" && filteredApplications.length > 0 && (
              <div style={{backgroundColor: '#ffe6e6', padding: '20px', margin: '20px 0', border: '2px solid red', borderRadius: '8px'}}>
                <h3 style={{color: 'red', fontSize: '18px', marginBottom: '10px'}}>EMERGENCY APPROVE/REJECT BUTTONS</h3>
                {filteredApplications.map((app) => (
                  <div key={app.id} style={{marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px'}}>
                    <strong>{app.username}</strong> - {app.email}
                    <br />
                    <button 
                      onClick={() => handleApprove(app)}
                      style={{padding: '8px 16px', margin: '5px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      ✅ APPROVE {app.username}
                    </button>
                    <button 
                      onClick={() => handleReject(app)}
                      style={{padding: '8px 16px', margin: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      ❌ REJECT {app.username}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {filteredApplications.length === 0 ? (
              <EmptyState 
                icon={<FileText className="h-10 w-10 text-muted-foreground" />}
                title={`No ${activeTab} applications`}
                description={activeTab === "pending" 
                  ? "There are no pending applications to review."
                  : `There are no ${activeTab} applications to display.`
                }
              />
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">User</TableHead>
                      <TableHead className="w-[120px]">Applied On</TableHead>
                      {activeTab !== "pending" && (
                        <TableHead className="w-[120px]">Reviewed On</TableHead>
                      )}
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[300px] min-w-[300px]">Actions</TableHead>
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
                              <div className="text-xs text-muted-foreground">{application.email || 'No email'}</div>
                              <div className="text-xs text-muted-foreground">{application.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(application.createdAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        {activeTab !== "pending" && (
                          <TableCell>
                            <div className="text-sm">
                              {application.reviewedAt
                                ? format(new Date(application.reviewedAt), "MMM d, yyyy")
                                : "—"}
                            </div>

                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant={getStatusBadge(application.status).variant as any} className="flex w-fit items-center">
                            {getStatusBadge(application.status).icon}
                            {getStatusBadge(application.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[300px] min-w-[300px]" style={{minWidth: '300px', width: '300px'}}>
                          <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-start', alignItems: 'center', width: '100%', minWidth: '300px'}}>
                            <button 
                              onClick={() => handleViewApplication(application)}
                              style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: '#f8f9fa', fontSize: '14px'}}
                            >
                              👁 View
                            </button>
                            {application.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleReject(application)}
                                  style={{padding: '6px 12px', border: '1px solid #dc3545', borderRadius: '4px', background: '#dc3545', color: 'white', fontSize: '14px'}}
                                >
                                  ❌ Reject
                                </button>
                                <button 
                                  onClick={() => handleApprove(application)}
                                  style={{padding: '6px 12px', border: '1px solid #28a745', borderRadius: '4px', background: '#28a745', color: 'white', fontSize: '14px'}}
                                >
                                  ✅ Approve
                                </button>
                              </>
                            )}
                            {application.status !== 'pending' && (
                              <span style={{fontSize: '14px', color: '#666'}}>Already {application.status}</span>
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