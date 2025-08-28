import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Shield,
  Check,
  X,
  Eye,
} from "lucide-react";

interface Reporter {
  id: number;
  username: string;
  email: string;
  profileImage: string | null;
}

interface ReportedUser {
  id: number;
  username: string;
  email: string;
  profileImage: string | null;
}

interface UserReport {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reason: string;
  details: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  adminNotes: string | null;
  resolvedBy: number | null;
  resolvedAt: string | null;
  createdAt: string;
  reporter: Reporter | null;
  reportedUser: ReportedUser | null;
}

export function ReportsList() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: reports = [], isLoading } = useQuery<UserReport[]>({
    queryKey: ["/api/admin/reports", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await apiRequest({ url: `/api/admin/reports${params}` });
      return response;
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, adminNotes }: { reportId: number; status: string; adminNotes?: string }) => {
      const response = await apiRequest({
        url: `/api/admin/reports/${reportId}`,
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      setShowDetailsDialog(false);
      setSelectedReport(null);
      setAdminNotes("");
      toast({
        title: "Report updated",
        description: "The report status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (report: UserReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status,
      adminNotes,
    });
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: "Inappropriate Content",
      spam: "Spam",
      scam: "Scam/Fraud",
      harassment: "Harassment",
      fake_profile: "Fake Profile",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      pending: { variant: "destructive", className: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" },
      reviewing: { variant: "secondary", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      resolved: { variant: "default", className: "bg-green-500/10 text-green-600 hover:bg-green-500/20" },
      dismissed: { variant: "outline", className: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20" },
    };
    
    const config = variants[status] || { variant: "default" as const, className: "" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Total Reports: {reports.length}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Reported User</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(report.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={report.reporter?.profileImage || undefined} />
                    <AvatarFallback>
                      {report.reporter?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {report.reporter?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.reporter?.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={report.reportedUser?.profileImage || undefined} />
                    <AvatarFallback>
                      {report.reportedUser?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {report.reportedUser?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.reportedUser?.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getReasonLabel(report.reason)}
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(report.status)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(report)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reports found</p>
        </div>
      )}

      {/* Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the report details and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Reporter</p>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={selectedReport.reporter?.profileImage || undefined} />
                      <AvatarFallback>
                        {selectedReport.reporter?.username?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedReport.reporter?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.reporter?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Reported User</p>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={selectedReport.reportedUser?.profileImage || undefined} />
                      <AvatarFallback>
                        {selectedReport.reportedUser?.username?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedReport.reportedUser?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.reportedUser?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Report Info</p>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Submitted on {format(new Date(selectedReport.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Reason: {getReasonLabel(selectedReport.reason)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Status: {getStatusBadge(selectedReport.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Report Details</p>
                <div className="rounded-lg border p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.details}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="adminNotes" className="text-sm font-medium text-muted-foreground">
                  Admin Notes
                </label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                />
              </div>

              {selectedReport.resolvedAt && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    Resolved on {format(new Date(selectedReport.resolvedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedReport && selectedReport.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("reviewing")}
                  disabled={updateReportMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark as Reviewing
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={updateReportMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus("dismissed")}
                  disabled={updateReportMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
              </>
            )}
            {selectedReport && selectedReport.status === "reviewing" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={updateReportMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus("dismissed")}
                  disabled={updateReportMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}