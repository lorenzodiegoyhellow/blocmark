import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ConciergeRequest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  locationType: string;
  eventType: string;
  budget?: number;
  dateNeeded?: string;
  preferredContactMethod: "email" | "phone";
  description: string;
  status: "pending" | "in_progress" | "responded" | "closed";
  adminNotes?: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  responded: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  responded: CheckCircle,
  closed: XCircle,
};

export function ConciergeRequests() {
  const [selectedRequest, setSelectedRequest] = useState<ConciergeRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [requestStatus, setRequestStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["/api/concierge"],
    queryFn: async () => {
      const response = await fetch("/api/concierge", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch concierge requests");
      }
      return response.json() as Promise<ConciergeRequest[]>;
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/concierge/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concierge"] });
      toast({
        title: "Request updated",
        description: "The concierge request has been updated successfully.",
      });
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      setRequestStatus("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (request: ConciergeRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setRequestStatus(request.status);
    setIsDialogOpen(true);
  };

  const handleUpdateRequest = () => {
    if (!selectedRequest) return;

    const updateData: any = {
      status: requestStatus,
      adminNotes: adminNotes,
    };

    if (requestStatus === "responded" && !selectedRequest.respondedAt) {
      updateData.respondedAt = new Date().toISOString();
    }

    updateRequestMutation.mutate({
      id: selectedRequest.id,
      data: updateData,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading concierge requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load concierge requests. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;
  const inProgressCount = requests?.filter(r => r.status === "in_progress").length || 0;
  const respondedCount = requests?.filter(r => r.status === "responded").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{respondedCount}</div>
                <div className="text-sm text-muted-foreground">Responded</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{requests?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Concierge Requests</CardTitle>
          <CardDescription>
            Manage and respond to premium venue requests from clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No concierge requests found.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Request Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((request) => {
                    const StatusIcon = statusIcons[request.status];
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-32">{request.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{request.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              <span className="capitalize">{request.locationType}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span className="capitalize">{request.eventType}</span>
                            </div>
                            {request.budget && (
                              <div className="flex items-center gap-1 text-sm">
                                <DollarSign className="h-3 w-3" />
                                <span>${request.budget.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${statusColors[request.status]} flex items-center gap-1 w-fit`}
                            variant="outline"
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{request.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Dialog open={isDialogOpen && selectedRequest?.id === request.id}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {requests && requests.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, requests.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, requests.length)} of{" "}
                {requests.length} requests
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
                  Page {currentPage} of {Math.ceil(requests.length / itemsPerPage)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(requests.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(requests.length / itemsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Concierge Request Details</DialogTitle>
            <DialogDescription>
              Review and manage this premium venue request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Client Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedRequest.name}</div>
                    <div><strong>Email:</strong> {selectedRequest.email}</div>
                    <div><strong>Phone:</strong> {selectedRequest.phone || 'Not provided'}</div>
                    <div><strong>Preferred Contact:</strong> {selectedRequest.preferredContactMethod === 'email' ? 'Email' : 'Phone'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Request Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Location Type:</strong> {selectedRequest.locationType}</div>
                    <div><strong>Event Type:</strong> {selectedRequest.eventType}</div>
                    <div><strong>Budget:</strong> {selectedRequest.budget ? `$${selectedRequest.budget.toLocaleString()}` : 'Not specified'}</div>
                    <div><strong>Date Needed:</strong> {selectedRequest.dateNeeded ? format(new Date(selectedRequest.dateNeeded), 'MMM d, yyyy') : 'Flexible'}</div>
                    <div><strong>Submitted:</strong> {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a')}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Status Update */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={requestStatus} onValueChange={setRequestStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateRequest}
                  disabled={updateRequestMutation.isPending}
                >
                  {updateRequestMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Update Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}