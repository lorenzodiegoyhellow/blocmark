import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Ban, 
  Eye,
  DollarSign,
  Calendar,
  MoreHorizontal,
  PencilIcon,
  XCircle,
  Building,
  User,
  Mail,
  Hash,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

export function BookingsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all bookings
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/bookings" });
    }
  });

  // Fetch user details when needed
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => apiRequest({ url: "/api/admin/users" }),
    enabled: userDialogOpen
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: number, data: any }) => {
      return apiRequest({
        url: `/api/admin/bookings/${bookingId}`,
        method: "PATCH",
        body: data
      });
    },
    onSuccess: (_, variables) => {
      const isCancel = variables.data.status === "cancelled";
      
      toast({
        title: isCancel ? "Booking cancelled" : "Booking updated",
        description: isCancel 
          ? "The booking has been cancelled successfully" 
          : `The booking status has been updated to ${variables.data.status}`,
        variant: "default",
      });
      
      setUpdateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async ({ bookingId, amount, reason }: { bookingId: number, amount: number, reason: string }) => {
      return apiRequest({
        url: `/api/admin/bookings/${bookingId}/refund`,
        method: "POST",
        body: { amount, reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Refund processed",
        description: `Refund of $${refundAmount} has been processed successfully`,
        variant: "default",
      });
      setRefundDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to process refund",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter bookings based on search query
  const filteredBookings = bookings ? bookings.filter((booking: any) => 
    (booking.id && booking.id.toString().includes(searchQuery)) ||
    (booking.locationTitle && booking.locationTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (booking.clientName && booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (booking: any) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setUpdateDialogOpen(true);
  };

  // Handle opening the refund dialog
  const handleOpenRefundDialog = (booking: any) => {
    setSelectedBooking(booking);
    setRefundAmount(booking.totalPrice || 0);
    setRefundReason("");
    setRefundDialogOpen(true);
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (!selectedBooking) return;
    
    updateBookingMutation.mutate({
      bookingId: selectedBooking.id,
      data: { status: newStatus }
    });
  };

  // Handle refund processing
  const handleProcessRefund = () => {
    if (!selectedBooking) return;
    
    processRefundMutation.mutate({
      bookingId: selectedBooking.id,
      amount: refundAmount,
      reason: refundReason
    });
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmed
        </Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Ban className="mr-1 h-3 w-3" /> Cancelled
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Ban className="mr-1 h-3 w-3" /> Rejected
        </Badge>;
      case "payment_pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <DollarSign className="mr-1 h-3 w-3" /> Payment Pending
        </Badge>;
      case "refund_pending":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <DollarSign className="mr-1 h-3 w-3" /> Refund Pending
        </Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <DollarSign className="mr-1 h-3 w-3" /> Refunded
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    if (!price && price !== 0) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate) return "N/A";
    
    try {
      const start = new Date(startDate);
      const formattedStart = new Intl.DateTimeFormat('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(start);
      
      if (!endDate) return formattedStart;
      
      const end = new Date(endDate);
      const sameDay = start.toDateString() === end.toDateString();
      
      if (sameDay) {
        return formattedStart;
      } else {
        const formattedEnd = new Intl.DateTimeFormat('en-US', { 
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(end);
        return `${formattedStart} - ${formattedEnd}`;
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return `${startDate} - ${endDate || ''}`;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading bookings...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading bookings: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">All Bookings</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
          <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <Table>
          <TableCaption>List of all bookings</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((booking: any) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell className="font-medium">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal" 
                    onClick={() => window.open(`/locations/${booking.locationId}`, '_blank')}
                  >
                    <Building className="h-3 w-3 mr-1 inline-block" />
                    {booking.locationTitle || `Location #${booking.locationId}`}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal" 
                    onClick={() => {
                      // Open user dialog with details
                      const userId = booking.clientId;
                      // Fetch user data and open dialog
                      apiRequest({ url: `/api/admin/users/${userId}` })
                        .then(userData => {
                          setSelectedUser(userData);
                          setUserDialogOpen(true);
                        })
                        .catch(error => {
                          console.error("Error fetching user:", error);
                          toast({
                            title: "User Information",
                            description: `Client ID: ${booking.clientId}, Name: ${booking.clientName || "Unknown"}`,
                            variant: "default",
                          });
                        });
                    }}
                  >
                    <User className="h-3 w-3 mr-1 inline-block" />
                    {booking.clientName || `Client #${booking.clientId}`}
                  </Button>
                </TableCell>
                <TableCell>{formatDateRange(booking.startDate, booking.endDate)}</TableCell>
                <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleOpenUpdateDialog(booking)}
                      >
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBooking(booking);
                          setNewStatus("cancelled");
                          updateBookingMutation.mutate({
                            bookingId: booking.id,
                            data: { status: "cancelled" }
                          });
                        }}
                        disabled={booking.status === 'cancelled' || booking.status === 'refunded'}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenRefundDialog(booking)}
                        disabled={booking.status === 'refunded' || booking.status === 'refund_pending'}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Process Refund
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredBookings && filteredBookings.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBookings.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{" "}
            {filteredBookings.length} bookings
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
              Page {currentPage} of {Math.ceil(filteredBookings.length / itemsPerPage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredBookings.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredBookings.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of booking #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="payment_pending">Payment Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for booking #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Refund Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                min={0}
                max={selectedBooking?.totalPrice || 0}
              />
              <p className="text-xs text-muted-foreground">
                Original booking amount: {formatPrice(selectedBooking?.totalPrice || 0)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea 
                id="reason" 
                placeholder="Provide a reason for this refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessRefund} 
              disabled={processRefundMutation.isPending || !refundAmount || !refundReason}
            >
              {processRefundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              User Profile
            </DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser ? (
            <div className="space-y-6">
              {/* User basic info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="rounded-full bg-gray-100 w-24 h-24 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-medium">{selectedUser.username || "User"}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedUser.email || "No email available"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>ID: {selectedUser.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles?.map((role: string) => (
                      <Badge 
                        key={role} 
                        variant="outline"
                        className={
                          role === "admin" 
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : role === "owner"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Account Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p>{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p>{selectedUser.updatedAt ? formatDate(selectedUser.updatedAt) : "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p>{selectedUser.active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
                    )}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Verified Email</p>
                    <p>{selectedUser.emailVerified ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Unverified</Badge>
                    )}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground">Loading user information...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}