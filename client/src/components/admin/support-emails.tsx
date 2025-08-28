import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, User, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface SupportEmail {
  id: number;
  userId: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: "general" | "technical" | "billing" | "account" | "booking" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  adminNotes: string | null;
  assignedTo: number | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export function SupportEmails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<SupportEmail | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch support emails
  const { data: emails = [], isLoading } = useQuery<SupportEmail[]>({
    queryKey: ["/api/support"],
  });

  // Update support email mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<SupportEmail> & { id: number }) =>
      apiRequest(`/api/support/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
      toast({
        title: "Success",
        description: "Support request updated successfully",
      });
      setSelectedEmail(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update support request",
        variant: "destructive",
      });
    },
  });

  // Delete support email mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/support/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
      toast({
        title: "Success",
        description: "Support request deleted successfully",
      });
      setSelectedEmail(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete support request",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const handlePriorityChange = (id: number, priority: string) => {
    updateMutation.mutate({ id, priority });
  };

  const handleSaveNotes = () => {
    if (selectedEmail) {
      updateMutation.mutate({
        id: selectedEmail.id,
        adminNotes,
        status: selectedEmail.status === "open" ? "in_progress" : selectedEmail.status,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: "default" | "secondary" | "success" | "destructive", icon: JSX.Element }> = {
      open: { color: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
      in_progress: { color: "secondary", icon: <Clock className="h-3 w-3" /> },
      resolved: { color: "success", icon: <CheckCircle className="h-3 w-3" /> },
      closed: { color: "default", icon: <XCircle className="h-3 w-3" /> },
    };
    
    const variant = variants[status] || variants.open;
    
    return (
      <Badge variant={variant.color as any} className="flex items-center gap-1">
        {variant.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      low: "default",
      medium: "secondary",
      high: "destructive",
      urgent: "destructive",
    };
    
    return (
      <Badge variant={colors[priority] || "default"}>
        {priority}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return <Badge variant="outline">{category}</Badge>;
  };

  // Calculate stats
  const stats = {
    total: emails.length,
    open: emails.filter(e => e.status === "open").length,
    inProgress: emails.filter(e => e.status === "in_progress").length,
    resolved: emails.filter(e => e.status === "resolved").length,
    urgent: emails.filter(e => e.priority === "urgent").length,
  };

  // Pagination
  const totalPages = Math.ceil(emails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmails = emails.slice(startIndex, endIndex);

  if (isLoading) {
    return <div>Loading support emails...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Urgent</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Emails Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {email.referenceId || `SUP-${email.id}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(email.createdAt), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {email.userId ? <User className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                      <div>
                        <div className="font-medium text-sm">{email.name}</div>
                        <div className="text-xs text-muted-foreground">{email.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {email.subject}
                  </TableCell>
                  <TableCell>{getCategoryBadge(email.category)}</TableCell>
                  <TableCell>
                    <Select
                      value={email.priority}
                      onValueChange={(value) => handlePriorityChange(email.id, value)}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={email.status}
                      onValueChange={(value) => handleStatusChange(email.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEmail(email);
                        setAdminNotes(email.adminNotes || "");
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, emails.length)} of {emails.length} requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Request Details</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900">Reference ID</div>
                <div className="font-mono text-lg font-semibold text-blue-700 mt-1">
                  {selectedEmail.referenceId || `SUP-${selectedEmail.id}`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From</label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedEmail.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedEmail.email}</div>
                    {selectedEmail.phone && (
                      <div className="text-sm text-muted-foreground">{selectedEmail.phone}</div>
                    )}
                    {selectedEmail.userId && (
                      <div className="text-xs text-muted-foreground">User ID: {selectedEmail.userId}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <div className="mt-1 text-sm">
                    {format(new Date(selectedEmail.createdAt), "PPP p")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <div className="mt-1">{getCategoryBadge(selectedEmail.category)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="mt-1">{getPriorityBadge(selectedEmail.priority)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <div className="mt-1 font-medium">{selectedEmail.subject}</div>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedEmail.message}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                />
              </div>

              {selectedEmail.resolvedAt && (
                <div className="text-sm text-muted-foreground">
                  Resolved on {format(new Date(selectedEmail.resolvedAt), "PPP p")}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedEmail.id)}
                >
                  Delete Request
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}