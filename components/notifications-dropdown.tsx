"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationsAPI } from "@/lib/api-client";
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";

interface Notification {
  _id: string;
  userId: string;
  fromUserId: string;
  type: string;
  title: string;
  content: string;
  meta: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    items: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export function NotificationsDropdown() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsAPI.getNotifications(1, 10),
    select: (res) => res.data as NotificationsResponse,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.data.items || [];

  // Update unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log("[v0] New notification received:", notification);
      // Refetch notifications to get the new one
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info(notification.title);
    };

    socket.on("notification_new", handleNewNotification);

    return () => {
      socket.off("notification_new", handleNewNotification);
    };
  }, [socket, queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diff = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      doctor_signup: "👨‍⚕️",
      appointment_scheduled: "📅",
      appointment_cancelled: "❌",
      appointment_rescheduled: "📋",
      appointment_pending: "⏳",
      patient_registered: "👤",
    };
    return icons[type] || "🔔";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-accent transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsReadMutation.mutate(notification._id)
                            }
                            className="flex-shrink-0 p-1 hover:bg-white rounded"
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t">
            <Button variant="outline" className="w-full text-xs bg-transparent" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
