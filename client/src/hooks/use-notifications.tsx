import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export type Notification = {
  id: number;
  userId: number;
  type: "booking_request" | "location_approved" | "location_rejected" | 
        "booking_approved" | "booking_rejected" | "booking_cancelled" | 
        "message_received" | "admin_message" | "booking_refunded" | 
        "location_spotlighted" | "custom_offer_received" | "custom_offer_accepted" | 
        "custom_offer_refused" | "custom_offer_cancelled" | "payout_method_required";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
};

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;

  // Fetch all notifications for the current user
  const { 
    data: notifications = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });

  // Fetch unread notification count
  const { 
    data: unreadCountData = { count: 0 }, 
    refetch: refetchCount 
  } = useQuery({
    queryKey: ['/api/notifications/unread/count'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
  
  const unreadCount = (unreadCountData as { count?: number })?.count || 0;

  // Mark a specific notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest({ 
        url: `/api/notifications/${notificationId}/read`, 
        method: 'PATCH' 
      }),
    onSuccess: () => {
      // Invalidate notifications queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest({ 
        url: '/api/notifications/read-all', 
        method: 'PATCH' 
      }),
    onSuccess: () => {
      // Invalidate notifications queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    }
  });

  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest({ 
        url: `/api/notifications/${notificationId}`, 
        method: 'DELETE' 
      }),
    onSuccess: () => {
      // Invalidate notifications queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    }
  });

  // Function to mark a notification as read
  const markAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Function to delete a notification
  const deleteNotification = (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  // Set up polling for new notifications
  useEffect(() => {
    let interval: number | undefined;
    
    if (isAuthenticated) {
      interval = window.setInterval(() => {
        refetch();
        refetchCount();
      }, 60000); // Poll every minute
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, refetch, refetchCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    refetchCount
  };
}