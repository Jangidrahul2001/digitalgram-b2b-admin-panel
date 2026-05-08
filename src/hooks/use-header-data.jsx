
import { useState, useEffect, useCallback } from 'react';
import { fetchWalletBalance, fetchNotifications, fetchNewsTicker, fetchUserProfile } from '../api/header-service';

export function useHeaderData() {
  const [walletData, setWalletData] = useState({ main: "0.00", aeps: "0.00", fee: "0", breakdown: [] });
  const [notifications, setNotifications] = useState([]);
  const [newsTicker, setNewsTicker] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [wallet, notifs, news, profile] = await Promise.all([
        fetchWalletBalance(),
        fetchNotifications(),
        fetchNewsTicker(),
        fetchUserProfile()
      ]);

      setWalletData(wallet);
      setNotifications(notifs);
      setNewsTicker(news);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load header data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    walletData,
    notifications,
    newsTicker,
    userProfile,
    isLoading,
    refreshData: fetchData,
    setNotifications
  };
}
