import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Message, MessageWithMetadata } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Archive, Inbox } from "lucide-react";
import { Conversation } from "@/components/messages/conversation";
import { MessageList } from "@/components/messages/message-list";
import { BookingDetailsPanel } from "@/components/messages/booking-details-panel";
import { AppLayout } from "@/components/layout/app-layout";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useHostMode } from "@/hooks/use-host-mode";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MessagesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isHostMode } = useHostMode();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: number;
    locationId: number;
    username: string;
    userImage?: string;
  } | null>(null);

  // Add error handling for conversation selection
  const handleSelectConversation = async (conversation: {
    userId: number;
    locationId: number;
    username: string;
    userImage?: string;
  }) => {
    console.log('Selecting conversation:', conversation);
    console.log('Current user ID:', user?.id);
    setSelectedConversation(conversation);
    
    // Clear notifications for this conversation immediately
    if (user && conversation.userId && conversation.locationId) {
      try {
        console.log('Clearing notifications for conversation:', conversation.userId, conversation.locationId);
        await apiRequest({
          url: `/api/notifications/messages/read/${conversation.userId}/${conversation.locationId}`,
          method: 'PATCH',
        });
        console.log('Notifications cleared successfully');
        
        // Refresh notification counts
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    }
  };

  // Function to handle back navigation on mobile
  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const urlUserId = params.get('userId');
  const urlLocationId = params.get('locationId');
  const urlUserName = params.get('userName');
  
  // Get user info from sessionStorage if available
  const storedUserName = urlUserId && sessionStorage.getItem(`host-${urlUserId}`);
  const storedUserImage = urlUserId && sessionStorage.getItem(`host-image-${urlUserId}`);

  const { data: messages, isLoading } = useQuery<MessageWithMetadata[]>({
    queryKey: ["/api/messages", isHostMode ? "host" : "client", showArchived ? "archived" : "active"],
    queryFn: async () => {
      const url = `/api/messages?mode=${isHostMode ? "host" : "client"}&archived=${showArchived}`;
      console.log('Fetching messages from:', url, 'showArchived:', showArchived);
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      console.log('Messages received:', data.length, 'showArchived:', showArchived);
      return data;
    },
    enabled: !!user,
  });

  // Get location data if we have a selected conversation
  const { data: location } = useQuery({
    queryKey: [`/api/locations/${selectedConversation?.locationId}`],
    enabled: !!selectedConversation?.locationId,
  });

  // WebSocket connection setup
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Update messages in the cache
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
          
          // Also invalidate conversation-specific queries if we're currently viewing that conversation
          if (selectedConversation && data.data) {
            const newMessage = data.data;
            if (
              newMessage.locationId === selectedConversation.locationId &&
              (newMessage.senderId === selectedConversation.userId || 
               newMessage.receiverId === selectedConversation.userId)
            ) {
              queryClient.invalidateQueries({ 
                queryKey: [`/api/messages/conversation/${selectedConversation.userId}/${selectedConversation.locationId}`] 
              });
            }
          }

          // Show notification for new messages
          if (data.data.receiverId === user.id) {
            toast({
              title: t("messages.newMessage"),
              description: t("messages.receivedNewMessage"),
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: t("messages.connectionError"),
        description: t("messages.connectionErrorDesc"),
        variant: "destructive",
      });
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, queryClient, toast, selectedConversation]);

  // Set initial conversation from URL parameters and session storage
  useEffect(() => {
    if (urlUserId && urlLocationId) {
      // First, try to use URL params or session storage data if available
      if (urlUserName || storedUserName) {
        setSelectedConversation({
          userId: parseInt(urlUserId),
          locationId: parseInt(urlLocationId),
          username: urlUserName || storedUserName || `User ${urlUserId}`,
          userImage: storedUserImage || undefined,
        });
        return;
      }
      
      // If no URL or stored data, and messages are loaded, try to find info from messages
      if (messages) {
        const relevantMessages = messages.filter(
          msg => 
            (msg.senderId === parseInt(urlUserId) || msg.receiverId === parseInt(urlUserId)) && 
            msg.locationId === parseInt(urlLocationId)
        );
        
        if (relevantMessages.length > 0) {
          const message = relevantMessages[0];
          const username = message.senderId === parseInt(urlUserId) 
            ? message.senderName || `User ${urlUserId}`
            : message.receiverName || `User ${urlUserId}`;
          
          const userImage = message.senderId === parseInt(urlUserId)
            ? message.senderImage
            : message.receiverImage;
            
          // Also save in session storage for future use
          if (username && username !== `User ${urlUserId}`) {
            sessionStorage.setItem(`host-${urlUserId}`, username);
          }
          if (userImage) {
            sessionStorage.setItem(`host-image-${urlUserId}`, userImage);
          }
            
          setSelectedConversation({
            userId: parseInt(urlUserId),
            locationId: parseInt(urlLocationId),
            username,
            userImage,
          });
        } else {
          // Fallback in case no messages are found
          setSelectedConversation({
            userId: parseInt(urlUserId),
            locationId: parseInt(urlLocationId),
            username: `User ${urlUserId}`,
            userImage: undefined,
          });
        }
      }
    }
  }, [urlUserId, urlLocationId, urlUserName, storedUserName, storedUserImage, messages]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Find booking request message if it exists
  const bookingRequestMessage = messages?.find(msg =>
    selectedConversation &&
    msg.metadata?.type === 'booking_request' &&
    msg.locationId === selectedConversation.locationId &&
    (msg.senderId === selectedConversation.userId || msg.receiverId === selectedConversation.userId)
  );

  return (
    <AppLayout>
      <div className="h-full w-full overflow-hidden">
        <div className={`grid grid-cols-1 md:grid-cols-[320px_1fr] ${selectedConversation && bookingRequestMessage?.metadata?.details ? 'lg:grid-cols-[360px_1fr_400px]' : 'lg:grid-cols-[360px_1fr]'} h-full`}>
          {/* Mobile: Show conversation list or conversation based on selection */}
          <div className={`md:border-r border-gray-200 overflow-y-auto bg-gray-50 ${selectedConversation ? 'hidden md:block' : 'block'}`}>
            {/* Tabs for Active/Archived messages */}
            <Tabs value={showArchived ? "archived" : "active"} onValueChange={(value) => {
              setShowArchived(value === "archived");
              setSelectedConversation(null); // Clear selection when switching tabs
            }} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  messages={messages || []}
                  onSelectConversation={handleSelectConversation}
                  currentUserId={user?.id || 0}
                  showArchived={showArchived}
                />
                
                {/* Show empty state for archived messages */}
                {showArchived && (!messages || messages.length === 0) && (
                  <div className="p-8 text-center text-gray-500">
                    <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No archived conversations</p>
                    <p className="text-xs mt-2">Archived conversations will appear here</p>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          <div className={`h-full overflow-hidden ${selectedConversation ? 'block' : 'hidden md:block'}`}>
            {selectedConversation && selectedConversation.userId && selectedConversation.locationId ? (
              <Conversation
                otherUserId={selectedConversation.userId}
                locationId={selectedConversation.locationId}
                username={selectedConversation.username || `User ${selectedConversation.userId}`}
                userImage={selectedConversation.userImage}
                socket={socket}
                onBack={handleBackToList}
                showBookingCard={false}
                includeArchived={showArchived}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <p className="text-gray-500 text-lg text-center px-4">
                  {t("messages.selectConversation")}
                </p>
              </div>
            )}
          </div>

          {/* Details panel - hidden on mobile, shown on large screens when conversation is selected */}
          {selectedConversation && bookingRequestMessage?.metadata?.details && (
            <div className="hidden lg:block border-l border-gray-200 bg-gray-50 overflow-y-auto">
              <BookingDetailsPanel 
                details={bookingRequestMessage.metadata.details}
                locationId={selectedConversation.locationId}
                otherUserId={selectedConversation.userId}
                username={selectedConversation.username}
                userImage={selectedConversation.userImage}
                isArchived={showArchived}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}