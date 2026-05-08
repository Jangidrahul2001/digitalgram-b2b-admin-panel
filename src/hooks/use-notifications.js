import { useState, useEffect, useCallback } from "react";
import { notificationsData } from "../data/notifications-data";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(notificationsData);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    notifications,
    setNotifications,
    isLoading,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllRead,
    refreshNotifications: fetchNotifications
  };
}
