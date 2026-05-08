import { useState, useEffect, useRef } from "react";
import {
  fetchUserLoginLogs,
  fetchNotifications,
  fetchBanners
} from "../data/settings-data";

// Global cache to store data across component unmounts (navigation)
const globalCache = {
  loginLogs: null,
  notifications: null,
  banners: null,
  // track if we have attempted fetch to avoid double fetch in strict mode or quick remounts
  fetched: { logs: false, notifs: false, banners: false }
};

export function useSettings(activeTab) {
  // Initialize state from global cache to persist data
  const [loginLogs, setLoginLogs] = useState(globalCache.loginLogs || [])
  const [isLoadingLogs, setIsLoadingLogs] = useState(!globalCache.fetched.logs)

  const [notifications, setNotifications] = useState(globalCache.notifications || [])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(!globalCache.fetched.notifs)

  const [banners, setBanners] = useState(globalCache.banners || [])
  const [isLoadingBanners, setIsLoadingBanners] = useState(!globalCache.fetched.banners)

  const PROMO_BANNER_IMAGE = "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"

  const handleAddBanner = () => {
    const newId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
    const newBanner = {
      id: newId,
      image: PROMO_BANNER_IMAGE,
      title: `New Promotion ${newId}`,
      status: "Active"
    };
    const updatedBanners = [newBanner, ...banners];
    setBanners(updatedBanners);
    globalCache.banners = updatedBanners; // Update cache
  };

  const handleDeleteBanner = (id) => {
    const updatedBanners = banners.filter(b => b.id !== id);
    setBanners(updatedBanners);
    globalCache.banners = updatedBanners; // Update cache
  };

  const handleToggleBannerStatus = (id) => {
    const updatedBanners = banners.map(b =>
      b.id === id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b
    );
    setBanners(updatedBanners);
    globalCache.banners = updatedBanners; // Update cache
  };

  // --- Notification Logic ---
  const [isAddNotificationModalOpen, setAddNotificationModalOpen] = useState(false)

  const handleAddNotification = (data) => {
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    const newNotification = {
      id: newId,
      heading: data.heading,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    globalCache.notifications = updatedNotifications; // Update cache
  };

  useEffect(() => {
    // 1. Fetch Login Logs
    if (activeTab === 'user_login_logs' && !globalCache.fetched.logs) {
      setIsLoadingLogs(true)
      fetchUserLoginLogs().then(data => {
        setLoginLogs(data)
        globalCache.loginLogs = data
        globalCache.fetched.logs = true
        setIsLoadingLogs(false)
      })
    } 
    // 2. Fetch Notifications
    else if (activeTab === 'notification' && !globalCache.fetched.notifs) {
      setIsLoadingNotifications(true)
      fetchNotifications().then(data => {
        setNotifications(data)
        globalCache.notifications = data
        globalCache.fetched.notifs = true
        setIsLoadingNotifications(false)
      })
    } 
    // 3. Fetch Banners
    else if (activeTab === 'banners' && !globalCache.fetched.banners) {
      setIsLoadingBanners(true)
      fetchBanners().then(data => {
        const professionalBanners = data.map(b => ({ ...b, image: PROMO_BANNER_IMAGE }));
        setBanners(professionalBanners)
        globalCache.banners = professionalBanners
        globalCache.fetched.banners = true
        setIsLoadingBanners(false)
      })
    }
  }, [activeTab])

  return {
    loginLogs,
    isLoadingLogs,
    notifications,
    isLoadingNotifications,
    banners,
    isLoadingBanners,
    toDate: new Date(),
    handleAddBanner,
    handleDeleteBanner,
    handleToggleBannerStatus,
    isAddNotificationModalOpen,
    setAddNotificationModalOpen,
    handleAddNotification
  }
}
