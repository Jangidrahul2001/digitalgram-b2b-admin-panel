import { useState, useEffect, useCallback } from "react";
import { monthlyData, deviceData } from "../data/analytics-charts-data";

export function useAnalytics() {
  const [chartsData, setChartsData] = useState({ monthly: [], device: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setChartsData({ monthly: monthlyData, device: deviceData });
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...chartsData,
    isLoading,
    refreshAnalytics: fetchAnalytics
  };
}
