import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Home, Shield, Image as ImageIcon, ChevronLeft, MapPin, CalendarDays, Clock, Users, Calendar, DollarSign, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VerifiedAvatar } from "@/components/ui/verified-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { format, isToday, isYesterday } from "date-fns";
import { Link, useLocation } from "wouter";
import { formatUsername } from "@/lib/utils";

type Props = {
  otherUserId: number;
  locationId: number;
  username: string;
  userImage?: string;
  socket: WebSocket | null;
  onBack?: () => void;
  showBookingCard?: boolean;
  includeArchived?: boolean;
};

// Helper function to format dates consistently
function formatMessageDate(date: Date) {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMMM d, yyyy");
}

// Helper function to group messages by date
function groupMessagesByDate(messages: Message[]) {
  const groups: { [key: string]: Message[] } = {};

  // Make a copy of messages array to avoid modifying the original
  const messagesToGroup = [...messages];
  
  // Filter out system messages as they'll be handled separately
  messagesToGroup.filter(msg => {
    if (!msg.metadata) return true;
    
    let metadata = msg.metadata as any;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        return true;
      }
    }
    
    return !metadata?.type?.includes('system_message');
  })
    .forEach((message) => {
      const date = formatMessageDate(new Date(message.createdAt));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

  // Sort messages within each date group chronologically (oldest to newest)
  for (const date in groups) {
    groups[date].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  
  // Sort the dates chronologically (oldest to newest)
  const sortedGroups: { [key: string]: Message[] } = {};
  Object.keys(groups)
    .sort((a, b) => {
      if (a === "Today") return 1;
      if (b === "Today") return -1;
      if (a === "Yesterday") return 1;
      if (b === "Yesterday") return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    })
    .forEach(date => {
      sortedGroups[date] = groups[date];
    });

  return sortedGroups;
}

export function Conversation({ otherUserId, locationId, username, userImage, socket, onBack, showBookingCard = true, includeArchived = false }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  console.log('Conversation component rendered with props:', { otherUserId, locationId, username, user: !!user });
  
  // Validate required props
  if (!otherUserId || !locationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Invalid conversation data</p>
      </div>
    );
  }

  const { data: location } = useQuery({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId,
  });

  const { data: messages, isLoading, error } = useQuery<Message[]>({
    queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`, includeArchived ? "archived" : "active"],
    queryFn: async () => {
      const response = await fetch(
        `/api/messages/conversation/${otherUserId}/${locationId}?includeArchived=${includeArchived}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch conversation');
      return response.json();
    },
    enabled: !!user && !!otherUserId && !!locationId,
  });

  // Add error handling
  if (error) {
    console.error('Error loading messages:', error);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading conversation</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  // Get system message separately
  const systemMessage = {
    id: 0,
    senderId: 0,
    receiverId: user?.id || 0,
    content: "Please ensure all bookings remain on the platform, as taking them offline violates Blocmark's Terms of Service.\n\nBooking through Blocmark safeguards your payout under the Cancellation Policy, provides 24/7 support for your reservations, and ensures claims resolution for a seamless experience.",
    createdAt: new Date(),
    locationId,
    bookingId: null,
    read: true,
    archived: false,
    metadata: { type: 'system_message' }
  };

  const groupedMessages = groupMessagesByDate(messages || []);

  // Find booking request message if it exists
  const bookingRequestMessage = messages?.find(msg => {
    if (!msg || !msg.metadata) return false;
    
    // Parse metadata if it's a string
    let metadata = msg.metadata as any;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        console.error('Failed to parse message metadata:', e);
        return false;
      }
    }
    
    return metadata?.type === 'booking_request';
  });

  // WebSocket message listener for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          const newMessage = data.data;
          
          // Check if this message belongs to the current conversation
          if (
            newMessage.locationId === locationId &&
            (newMessage.senderId === otherUserId || newMessage.receiverId === otherUserId)
          ) {
            // Invalidate the conversation query to refetch messages
            queryClient.invalidateQueries({
              queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`],
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, otherUserId, locationId, queryClient]);

  // Mark messages as read when they're viewed
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMessages = messages?.filter(
        (msg) => !msg.read && msg.senderId === otherUserId
      );

      if (unreadMessages && unreadMessages.length > 0) {
        for (const msg of unreadMessages) {
          await apiRequest({
            url: `/api/messages/${msg.id}/read`,
            method: "POST"
          });
        }
        queryClient.invalidateQueries({
          queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`],
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/messages"],
        });
      }
    };

    markMessagesAsRead();
  }, [messages, otherUserId, locationId, queryClient]);

  // Mark message notifications as read when viewing the conversation
  useEffect(() => {
    const markNotificationsAsRead = async () => {
      console.log('markNotificationsAsRead effect triggered', { user: !!user, otherUserId, locationId });
      
      if (!user || !otherUserId || !locationId) {
        console.log('Skipping notification clearing - missing required data');
        return;
      }
      
      try {
        console.log(`Calling notification clearing API for conversation with user ${otherUserId} and location ${locationId}`);
        
        await apiRequest({
          url: `/api/notifications/messages/read/${otherUserId}/${locationId}`,
          method: "PATCH"
        });
        
        console.log('Successfully marked notifications as read');
        
        // Invalidate notification queries to refresh the count
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
      } catch (error) {
        console.error('Failed to mark message notifications as read:', error);
      }
    };

    markNotificationsAsRead();
  }, [user, otherUserId, locationId]);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/messages/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSelectedImage(data.imageUrl);
      setIsUploading(false);
      toast({
        title: "Image uploaded",
        description: "You can now send the image in your message.",
      });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Failed to upload image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadImageMutation.mutate(file);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { content: string; imageUrl?: string }) => {
      try {
        // Fix: Only include imageUrl when it exists and is not null/undefined
        const messageData: any = {
          receiverId: otherUserId,
          locationId,
          content: payload.content.trim() || "",  // Ensure empty string if content is just whitespace
        };
        
        // Only add imageUrl field if there actually is an image URL
        if (payload.imageUrl) {
          messageData.imageUrl = payload.imageUrl;
        }

        console.log("Sending message:", messageData);

        // Using fetch directly with proper headers to ensure correct content-type
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Response error:", errorText);
          throw new Error(`Failed to send message: ${errorText}`);
        }

        return res.json();
      } catch (err) {
        console.error("Message send error:", err);
        throw err;
      }
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`],
      });

      // Clear selected image after sending
      setSelectedImage(null);

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "new_message",
          data: newMessage,
        }));
      } else {
        console.warn("WebSocket not connected, message will be delivered on next page load");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't allow sending if there's no message text and no image
    if ((!message.trim() && !selectedImage) || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      content: message,
      imageUrl: selectedImage || undefined
    });
    
    setMessage("");
  };

  // Scroll to bottom when new messages arrive or component mounts
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current;
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    }
  }, [messages, bookingRequestMessage]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="text-lg font-medium flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden -ml-2"
              onClick={onBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href={`/users/${otherUserId}`} className="hover:opacity-80 transition-opacity">
            <VerifiedAvatar
              src={userImage}
              alt={username}
              fallback={username.slice(0, 2).toUpperCase()}
              isVerified={false}
              className="h-10 w-10 shrink-0"
            />
          </Link>
          <div className="flex-1">
            <div className="font-semibold">{formatUsername(username)}</div>
            {locationId && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Home className="h-3 w-3" />
                <Link
                  href={`/locations/${locationId}`}
                  className="hover:text-foreground transition-colors"
                >
                  Location #{locationId}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollRef} scrollHideDelay={0}>
          <div className="p-4 space-y-4 flex flex-col">
            {/* System message at the top of messages */}
            <div className="flex justify-center">
              <div className="max-w-[90%] rounded-lg px-4 py-3 bg-white border flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {systemMessage.content}
                </p>
              </div>
            </div>

            {showBookingCard && bookingRequestMessage && (() => {
              let metadata = bookingRequestMessage.metadata as any;
              if (typeof metadata === 'string') {
                try {
                  metadata = JSON.parse(metadata);
                } catch (e) {
                  return null;
                }
              }
              
              if (!metadata?.details) return null;
              
              const details = metadata.details;
              
              // Inline booking request card to avoid circular dependency
              return (
                <Card className="mb-4 bg-secondary/50">
                  <CardContent className="pt-4 px-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Booking Request Details</h3>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{details.locationTitle}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" />
                          <span>{details.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {details.time}
                            {details.isFlexible && (
                              <span className="text-xs text-muted-foreground ml-1">(Flexible)</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{details.attendees} attendees</span>
                        </div>

                        <div className="pt-2 border-t text-xs">
                          <span className="font-medium">Activity: </span>
                          <span className="text-muted-foreground">{details.activity}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Regular messages grouped by date */}
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {date}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {dateMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        msg.senderId === user?.id ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {msg.senderId === user?.id ? (
                        <VerifiedAvatar
                          src={user?.profileImage}
                          alt={user?.username}
                          fallback={user?.username?.slice(0, 2).toUpperCase()}
                          isVerified={user?.identityVerificationStatus === 'verified'}
                          className="h-8 w-8 shrink-0"
                        />
                      ) : (
                        <Link
                          href={`/users/${otherUserId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <VerifiedAvatar
                            src={userImage}
                            alt={username}
                            fallback={username.slice(0, 2).toUpperCase()}
                            isVerified={false}
                            className="h-8 w-8 shrink-0"
                          />
                        </Link>
                      )}
                      <div className="space-y-1 max-w-[80%]">
                        {/* Check if this is a custom offer message */}
                        {(() => {
                          if (!msg.metadata) return null;
                          
                          let metadata = msg.metadata as any;
                          if (typeof metadata === 'string') {
                            try {
                              metadata = JSON.parse(metadata);
                            } catch (e) {
                              return null;
                            }
                          }
                          
                          if (metadata?.type === 'custom_offer' && metadata?.details) {
                            const details = metadata.details;
                            const isReceiver = msg.receiverId === user?.id;
                            const offerStatus = metadata.status || 'pending';
                            
                            // Handle accept offer
                            const handleAcceptOffer = async () => {
                              try {
                                const response = await apiRequest({
                                  url: `/api/messages/custom-offer/${msg.id}/accept`,
                                  method: 'POST'
                                });
                                
                                toast({
                                  title: "Offer Accepted",
                                  description: "Redirecting to booking checkout..."
                                });
                                
                                queryClient.invalidateQueries({ queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`] });
                                
                                // Navigate after short delay - use bookingId from response
                                setTimeout(() => {
                                  if (response.bookingId) {
                                    // Navigate to booking checkout with the booking ID
                                    window.location.href = `/booking-checkout?bookingId=${response.bookingId}`;
                                  } else {
                                    // Fallback to location-based URL if no booking ID returned
                                    const params = new URLSearchParams();
                                    
                                    if (details.date) {
                                      params.set('date', details.date);
                                    }
                                    if (details.startTime) {
                                      params.set('startTime', details.startTime);
                                    }
                                    if (details.endTime) {
                                      params.set('endTime', details.endTime);
                                    }
                                    if (details.attendees) {
                                      params.set('groupSize', String(details.attendees));
                                    }
                                    params.set('customPrice', details.customPrice.toString());
                                    
                                    if (details.selectedAddons && details.selectedAddons.length > 0) {
                                      params.set('addons', details.selectedAddons.join(','));
                                    }
                                    
                                    if (details.additionalFees && details.additionalFees.length > 0) {
                                      params.set('additionalFees', JSON.stringify(details.additionalFees));
                                    }
                                    
                                    window.location.href = `/locations/${details.locationId}/booking-checkout?${params.toString()}`;
                                  }
                                }, 1500);
                              } catch (error: any) {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: error.message || "Failed to accept offer"
                                });
                              }
                            };
                            
                            // Handle refuse offer
                            const handleRefuseOffer = async () => {
                              try {
                                await apiRequest({
                                  url: `/api/messages/custom-offer/${msg.id}/refuse`,
                                  method: 'POST'
                                });
                                
                                toast({
                                  title: "Offer Refused",
                                  description: "The custom offer has been declined."
                                });
                                
                                queryClient.invalidateQueries({ queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`] });
                              } catch (error: any) {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: error.message || "Failed to refuse offer"
                                });
                              }
                            };
                            
                            return (
                              <Card className="p-4 bg-primary/5 border-primary/20">
                                <div className="flex items-start gap-3">
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-2">
                                      {isReceiver ? 'Custom Offer Received' : 'Custom Offer Sent'}
                                    </h4>
                                    
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <span className="font-medium">Property:</span>
                                        <span>{details.locationTitle}</span>
                                      </div>
                                      
                                      {details.date && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Calendar className="h-4 w-4" />
                                          <span>{details.date}</span>
                                        </div>
                                      )}
                                      
                                      {(details.startTime || details.endTime) && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            {details.startTime && details.endTime 
                                              ? `${details.startTime} - ${details.endTime}`
                                              : details.startTime || details.endTime}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {details.attendees && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Users className="h-4 w-4" />
                                          <span>
                                            {typeof details.attendees === 'string' 
                                              ? `${details.attendees.charAt(0).toUpperCase() + details.attendees.slice(1)} group`
                                              : `${details.attendees} attendees`}
                                          </span>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-2 font-semibold text-primary">
                                        <DollarSign className="h-4 w-4" />
                                        <span>${details.customPrice}</span>
                                      </div>
                                    </div>
                                    
                                    {isReceiver && offerStatus === 'pending' && (
                                      <div className="flex gap-2 mt-3">
                                        <Button 
                                          className="flex-1 sm:flex-initial" 
                                          size="sm"
                                          onClick={handleAcceptOffer}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Accept Offer
                                        </Button>
                                        <Button 
                                          variant="outline"
                                          className="flex-1 sm:flex-initial" 
                                          size="sm"
                                          onClick={handleRefuseOffer}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Refuse
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {offerStatus === 'accepted' && (
                                      <div className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
                                        <Check className="h-4 w-4" />
                                        Offer Accepted
                                      </div>
                                    )}
                                    
                                    {offerStatus === 'refused' && (
                                      <div className="mt-3 text-sm text-red-600 font-medium flex items-center gap-1">
                                        <X className="h-4 w-4" />
                                        Offer Refused
                                      </div>
                                    )}
                                    
                                    {offerStatus === 'expired' && (
                                      <div className="mt-3 text-sm text-muted-foreground font-medium">
                                        ⏱️ Offer Expired
                                      </div>
                                    )}
                                    
                                    {offerStatus === 'cancelled' && (
                                      <div className="mt-3 text-sm text-red-600 font-medium flex items-center gap-1">
                                        <X className="h-4 w-4" />
                                        Offer Cancelled
                                      </div>
                                    )}
                                    
                                    {/* Cancel button for host when offer is pending */}
                                    {!isReceiver && offerStatus === 'pending' && (
                                      <div className="mt-3">
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={async () => {
                                            try {
                                              await apiRequest({
                                                url: `/api/messages/custom-offer/${msg.id}/cancel`,
                                                method: 'POST'
                                              });
                                              
                                              toast({
                                                title: "Offer Cancelled",
                                                description: "The custom offer has been cancelled."
                                              });
                                              
                                              queryClient.invalidateQueries({ 
                                                queryKey: [`/api/messages/conversation/${otherUserId}/${locationId}`] 
                                              });
                                            } catch (error: any) {
                                              toast({
                                                variant: "destructive",
                                                title: "Error",
                                                description: error.message || "Failed to cancel offer"
                                              });
                                            }
                                          }}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Cancel Offer
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          }
                          return null;
                        })() || (
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              msg.senderId === user?.id
                                ? "bg-white border border-primary text-primary"
                                : msg.read
                                  ? "bg-white border border-gray-200"
                                  : "bg-white border border-gray-200 border-l-2 border-l-primary"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            {msg.imageUrl && (
                              <div className="mt-2">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Attached image" 
                                  className="rounded-md max-h-60 max-w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => msg.imageUrl && window.open(msg.imageUrl, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`text-xs text-muted-foreground ${
                            msg.senderId === user?.id ? "text-right" : "text-left"
                          }`}
                        >
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 mt-auto border-t">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          {/* Display the selected image preview */}
          {selectedImage && (
            <div className="mb-3 relative">
              <div className="rounded-md border overflow-hidden relative">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-h-32 max-w-full object-contain mx-auto"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 size-6 p-0 rounded-full"
                  onClick={() => setSelectedImage(null)}
                  type="button"
                >
                  &times;
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending || isUploading}
            />
            
            {/* Image upload button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleImageClick}
              disabled={sendMessageMutation.isPending || isUploading}
              className="flex-shrink-0"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
            
            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={sendMessageMutation.isPending || isUploading || (!message.trim() && !selectedImage)}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}