import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Search, 
  ClipboardList,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

type AdminLog = {
  id: number;
  adminId: number;
  action: string;
  targetType: string;
  targetId: number;
  details: any;
  createdAt: string;
};

type FilterParams = {
  adminId?: number;
  targetType?: string;
  targetId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export function AdminLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");

  // Fetch admin logs
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["/api/admin/logs", filters],
    queryFn: async () => {
      let url = "/api/admin/logs";
      
      // Add query parameters if filters are set
      const queryParams = new URLSearchParams();
      if (filters.adminId) queryParams.append("adminId", filters.adminId.toString());
      if (filters.targetType && filters.targetType !== "all") queryParams.append("targetType", filters.targetType);
      if (filters.targetId) queryParams.append("targetId", filters.targetId.toString());
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      return apiRequest({ url });
    }
  });

  // Filter logs based on search query
  const filteredLogs = logs ? logs.filter((log: AdminLog) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.targetType.toLowerCase().includes(searchLower) ||
      (log.adminId && log.adminId.toString().includes(searchQuery)) ||
      (log.targetId && log.targetId.toString().includes(searchQuery))
    );
  }) : [];

  // Handle viewing log details
  const handleViewDetails = (log: AdminLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  // Handle changing target type filter
  const handleTargetTypeChange = (value: string) => {
    setTargetTypeFilter(value);
    if (value === "all") {
      const { targetType, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, targetType: value });
    }
  };

  // Format action description
  const formatAction = (log: AdminLog) => {
    const target = log.targetType.charAt(0).toUpperCase() + log.targetType.slice(1);
    return `${log.action} ${target} #${log.targetId}`;
  };

  // Format the admin log details for display
  const formatDetails = (details: any) => {
    if (!details) return "No details provided";
    
    if (typeof details === 'object') {
      return JSON.stringify(details, null, 2);
    }
    
    return details.toString();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading admin logs...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading logs: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Label>Target Type:</Label>
          <Select 
            value={targetTypeFilter} 
            onValueChange={handleTargetTypeChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="location">Locations</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No admin logs found</p>
        </div>
      ) : (
        <Table>
          <TableCaption>Administrative action logs</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log: AdminLog) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>Admin #{log.adminId}</TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>
                  {log.targetType.charAt(0).toUpperCase() + log.targetType.slice(1)} #{log.targetId}
                </TableCell>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(log)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <span className="text-sm">
                  Admin #{selectedLog.adminId} - {formatAction(selectedLog)} on {formatDate(selectedLog.createdAt)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Action Details:</h3>
              <div className="bg-muted p-4 rounded-md overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {formatDetails(selectedLog.details)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}