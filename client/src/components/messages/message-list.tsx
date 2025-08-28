import { useMemo } from "react";
import { Message, MessageWithMetadata } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Home, Archive, MoreVertical, Image as ImageIcon } from "lucide-react";
import { VerifiedAvatar } from "@/components/ui/verified-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn, formatUsername } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Props = {
  messages: MessageWithMetadata[];
  onSelectConversation: (conversation: {
    userId: number;
    locationId: number;
    username: string;
    userImage?: string;
  }) => void;
  currentUserId: number;
  showArchived?: boolean;
};

type GroupedMessage = {
  userId: number;
  locationId: number;
  username: string;
  userImage?: string;
  userVerified?: boolean;
  lastMessage: MessageWithMetadata;
  unreadCount: number;
};

export function MessageList({ messages, onSelectConversation, currentUserId, showArchived = false }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const archiveConversationMutation = useMutation({
    mutationFn: async ({userId, locationId}: {userId: number, locationId: number}) => {
      console.log('Archive mutation starting:', { userId, locationId });
      try {
        const result = await apiRequest(`/api/messages/conversation/${userId}/${locationId}/archive`, {
          method: 'POST'
        });
        console.log('Archive mutation success:', result);
        return result;
      } catch (error) {
        console.error('Archive mutation error:', error);
        throw error;
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch messages
      await queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      await queryClient.refetchQueries({ queryKey: ["/api/messages"] });
      
      toast({
        title: showArchived ? "Conversation unarchived" : "Conversation archived",
        description: showArchived ? "Messages moved to inbox" : "Messages moved to archive",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to archive conversation:", error);
      toast({
        title: "Failed to archive conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { inboxCount, archivedCount } = useMemo(() => {
    const result = messages.reduce((acc, msg) => {
      if (msg.archived) {
        acc.archivedCount++;
      } else {
        acc.inboxCount++;
      }
      return acc;
    }, { inboxCount: 0, archivedCount: 0 });
    
    console.log('MessageList counts - inbox:', result.inboxCount, 'archived:', result.archivedCount);
    return result;
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const groups = new Map<string, GroupedMessage>();
    
    console.log('MessageList - showArchived:', showArchived, 'total messages:', messages.length);
    const filteredMessages = messages.filter(msg => showArchived === msg.archived);
    console.log('MessageList - filtered messages:', filteredMessages.length);

    filteredMessages.forEach((message) => {
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const key = `${otherUserId}-${message.locationId}`;

        const otherUserName = message.senderId === currentUserId
          ? message.receiverName || `User ${message.receiverId}`
          : message.senderName || `User ${message.senderId}`;

        const userImage = message.senderId === currentUserId
          ? message.receiverImage
          : message.senderImage;
        
        const userVerified = message.senderId === currentUserId
          ? (message as any).receiverVerified
          : (message as any).senderVerified;

        if (!groups.has(key)) {
          groups.set(key, {
            userId: otherUserId,
            locationId: message.locationId,
            username: otherUserName,
            userImage,
            userVerified,
            lastMessage: message,
            unreadCount: message.senderId !== currentUserId && !message.read ? 1 : 0,
          });
        } else {
          const group = groups.get(key)!;
          if (message.createdAt > group.lastMessage.createdAt) {
            group.lastMessage = message;
          }
          if (message.senderId !== currentUserId && !message.read) {
            group.unreadCount++;
          }
        }
      });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages, currentUserId, showArchived]);

  return (
    <div className="h-full flex flex-col bg-white">
      
      <ScrollArea className="flex-1">
          <div className="px-4">
            <div className="space-y-2">
              {groupedMessages.map((group) => (
                <div
                  key={`${group.userId}-${group.locationId}`}
                  className="relative -mx-4 hover:bg-gray-50 cursor-pointer transition-colors group py-1"
                  onClick={() => onSelectConversation(group)}
                >
                  <div className="flex items-center gap-3 px-4 py-3 pr-12">
                    <VerifiedAvatar
                      src={group.userImage}
                      alt={group.username}
                      fallback={group.username.slice(0, 2).toUpperCase()}
                      isVerified={group.userVerified || false}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{formatUsername(group.username)}</h4>
                          {/* Display location info if available */}
                          {group.lastMessage.metadata?.type === 'booking_request' && (
                            <div className="text-xs text-muted-foreground truncate">
                              {group.lastMessage.metadata.details.locationTitle}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {group.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shrink-0">
                              {group.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm truncate mt-1 ${
                        !group.lastMessage.read && group.lastMessage.senderId !== currentUserId
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                      }`}>
                        {group.lastMessage.imageUrl && (
                          <span className="inline-flex items-center mr-1">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {group.lastMessage.content ? group.lastMessage.content : "Image sent"}
                          </span>
                        )}
                        {!group.lastMessage.imageUrl && group.lastMessage.content}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-md rounded-md border border-gray-100">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveConversationMutation.mutate({
                            userId: group.userId,
                            locationId: group.locationId
                          });
                        }}
                        className="flex items-center gap-2 text-gray-700 hover:text-cyan-700 hover:bg-gray-50"
                      >
                        <Archive className="h-4 w-4" />
                        {showArchived ? "Unarchive Conversation" : "Archive Conversation"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {groupedMessages.length === 0 && (
                <div className="text-center py-8 px-4 my-4 bg-white border border-gray-100 rounded-md shadow-sm">
                  <p className="text-gray-500">
                    {showArchived ? "No archived messages" : "No messages yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
    </div>
  );
}