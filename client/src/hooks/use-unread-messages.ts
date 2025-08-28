import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { useAuth } from "./use-auth";

export function useUnreadMessages() {
  const { user } = useAuth();

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  if (!messages || !user) return 0;

  return messages.filter(msg => !msg.read && msg.receiverId === user.id).length;
}
