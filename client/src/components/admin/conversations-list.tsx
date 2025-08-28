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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Search, 
  MessageSquare,
  Eye,
  Calendar,
  Users,
  Shield,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

type Conversation = {
  userId1: number;
  userId2: number;
  locationId: number;
  lastMessageDate: string;
  userName1?: string;  // Added userName1 property
  userName2?: string;  // Added userName2 property
  locationTitle?: string;  // Added locationTitle property
};

type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  locationId: number;
  content: string;
  createdAt: string;
  read: boolean;
  bookingId?: number;
  metadata?: any;
  senderName?: string;
  receiverName?: string;
  locationTitle?: string;  // Added locationTitle property
};

type ModerationAlert = {
  id: number;
  messageId: number;
  senderId: number;
  receiverId: number;
  locationId: number;
  violationType: 'phone' | 'email' | 'both';
  detectedPatterns: string[];
  confidence: number;
  originalContentHash?: string;
  resolved: boolean;
  resolvedBy?: number;
  resolvedAt?: string;
  createdAt: string;
};

type FilterParams = {
  userId?: number;
  locationId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export function ConversationsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [moderationAlerts, setModerationAlerts] = useState<ModerationAlert[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all conversations
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ["/api/admin/conversations"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/conversations" });
    }
  });

  // Fetch all moderation alerts
  const { data: allModerationAlerts } = useQuery({
    queryKey: ["/api/admin/moderation-alerts"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/moderation-alerts?resolved=false" });
    }
  });

  // Filter conversations based on search query
  const filteredConversations = conversations ? conversations.filter((conv: Conversation) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (conv.userName1 && conv.userName1.toLowerCase().includes(searchLower)) ||
      (conv.userName2 && conv.userName2.toLowerCase().includes(searchLower)) ||
      (conv.locationTitle && conv.locationTitle.toLowerCase().includes(searchLower)) ||
      (conv.userId1 && conv.userId1.toString().includes(searchQuery)) ||
      (conv.userId2 && conv.userId2.toString().includes(searchQuery)) ||
      (conv.locationId && conv.locationId.toString().includes(searchQuery))
    );
  }) : [];

  // Handle viewing conversation messages
  const handleViewConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    
    try {
      // Fetch all messages for this location
      const queryParams = new URLSearchParams();
      queryParams.append("locationId", conversation.locationId.toString());
      
      // Fetch messages
      const allMessages = await apiRequest({ 
        url: `/api/admin/messages?${queryParams.toString()}`
      });
      
      // Filter messages to only include those between the two users in this conversation
      const conversationMessages = allMessages.filter((msg: Message) => {
        return (
          (msg.senderId === conversation.userId1 && msg.receiverId === conversation.userId2) ||
          (msg.senderId === conversation.userId2 && msg.receiverId === conversation.userId1)
        );
      });
      
      // Fetch moderation alerts for this conversation
      const alertsResponse = await apiRequest({ 
        url: `/api/admin/moderation-alerts?resolved=false&locationId=${conversation.locationId}`
      });
      
      // Filter alerts for messages in this conversation
      const conversationAlerts = (alertsResponse || []).filter((alert: ModerationAlert) => {
        return conversationMessages.some((msg: Message) => msg.id === alert.messageId);
      });
      
      setModerationAlerts(conversationAlerts);
      setConversationMessages(conversationMessages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      setConversationMessages([]);
      setModerationAlerts([]);
    } finally {
      setIsLoadingMessages(false);
      setMessagesDialogOpen(true);
    }
  };

  // Format the message display based on metadata or message content
  const formatMessageContent = (message: Message) => {
    if (message.metadata && message.metadata.type === 'booking_request') {
      return `🗓️ Booking Request: ${message.metadata.details.activity} on ${message.metadata.details.date}`;
    }
    
    return message.content;
  };

  // Get a short preview of a message for the conversations list
  const getMessagePreview = (date: string) => {
    return `Last message on ${formatDate(date)}`;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading conversations...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading conversations: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Conversations Monitoring</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-[300px]"
          />
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No conversations found</p>
        </div>
      ) : (
        <Table>
          <TableCaption>List of user conversations</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User 1</TableHead>
              <TableHead>User 2</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversations
              .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime())
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((conversation: Conversation, index: number) => {
              // Check if this conversation has any moderation alerts
              const hasAlerts = allModerationAlerts && allModerationAlerts.some((alert: ModerationAlert) => 
                alert.locationId === conversation.locationId &&
                ((alert.senderId === conversation.userId1 && alert.receiverId === conversation.userId2) ||
                 (alert.senderId === conversation.userId2 && alert.receiverId === conversation.userId1))
              );
              
              return (
                <TableRow key={index} className={hasAlerts ? "bg-orange-50" : ""}>
                  <TableCell>
                    {conversation.userName1 || `User #${conversation.userId1}`}
                  </TableCell>
                  <TableCell>
                    {conversation.userName2 || `User #${conversation.userId2}`}
                  </TableCell>
                  <TableCell>
                    {conversation.locationTitle || `Location #${conversation.locationId}`}
                  </TableCell>
                  <TableCell>{getMessagePreview(conversation.lastMessageDate)}</TableCell>
                  <TableCell>
                    {hasAlerts && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">Private Info Detected</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasAlerts && (
                        <Badge variant="destructive" className="text-xs">
                          Alerts
                        </Badge>
                      )}
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewConversation(conversation)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> 
                        View Messages
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {filteredConversations.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredConversations.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredConversations.length)} of{" "}
            {filteredConversations.length} conversations
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
              Page {currentPage} of {Math.ceil(filteredConversations.length / itemsPerPage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredConversations.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredConversations.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={messagesDialogOpen} onOpenChange={setMessagesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation Messages</DialogTitle>
            <DialogDescription>
              {selectedConversation && (
                <div className="text-sm mt-1 bg-muted/30 p-2 rounded-md">
                  <span className="font-medium">Location:</span> {selectedConversation.locationTitle || `#${selectedConversation.locationId}`} <br />
                  <span className="font-medium">Between:</span> {selectedConversation.userName1 || `User #${selectedConversation.userId1}`} and {selectedConversation.userName2 || `User #${selectedConversation.userId2}`}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Show moderation alerts if any */}
          {moderationAlerts.length > 0 && (
            <Alert className="mb-4 border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">⚠️ Content Moderation Alerts</AlertTitle>
              <AlertDescription className="text-orange-700">
                <div className="space-y-2">
                  <p>
                    {moderationAlerts.length} message{moderationAlerts.length > 1 ? 's' : ''} in this conversation 
                    {moderationAlerts.length > 1 ? ' contain' : ' contains'} private information that has been automatically removed.
                  </p>
                  
                  {moderationAlerts.map((alert, idx) => (
                    <div key={idx} className="border-l-2 border-orange-400 pl-3 py-1 bg-white rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {alert.violationType === 'both' ? 'Phone & Email' : alert.violationType}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            Message #{alert.messageId}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Confidence: {alert.confidence}%
                        </span>
                      </div>
                      {alert.detectedPatterns && alert.detectedPatterns.length > 0 && (
                        <div className="mt-1 text-xs text-gray-600">
                          Detected patterns: {alert.detectedPatterns.slice(0, 3).join(', ')}
                          {alert.detectedPatterns.length > 3 && ` (+${alert.detectedPatterns.length - 3} more)`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex-grow overflow-auto mt-4">
            {isLoadingMessages ? (
              <div className="flex justify-center p-8">
                <p>Loading messages...</p>
              </div>
            ) : conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No messages found</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 p-4 bg-muted/5 rounded-lg">
                {conversationMessages
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((message: Message) => {
                  const isUser1 = selectedConversation && message.senderId === selectedConversation.userId1;
                  const isModerated = message.metadata?.moderation?.moderated;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${isUser1 ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[75%] ${isUser1 ? 'bg-muted' : 'bg-primary/10'} rounded-lg p-3 shadow-sm border ${
                        isModerated 
                          ? 'border-orange-400 bg-orange-50' 
                          : isUser1 ? 'border-muted/70' : 'border-primary/20'
                      }`}>
                        <div className="font-medium text-sm text-primary mb-1 flex items-center gap-2">
                          {message.senderName || `User #${message.senderId}`}
                          {isModerated && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-normal">
                              <Shield className="h-3 w-3" />
                              Moderated
                            </span>
                          )}
                        </div>
                        <div className="text-sm">
                          {formatMessageContent(message)}
                        </div>
                        {isModerated && (
                          <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-700">
                            <strong>Private information removed:</strong> {message.metadata.moderation.violationType}
                            <br />
                            <span className="text-[10px]">Confidence: {message.metadata.moderation.confidence}%</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(message.createdAt)}
                          </div>
                          <Badge variant="outline" className="text-[10px] ml-2">
                            {message.read ? "Read" : "Unread"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

