
import { useState, useEffect } from "react";
import {
  fetchDashboardWalletBalances,
  fetchLatestTransactions,
  fetchBusinessVolume,
  fetchTransactionStatusData,
  fetchChannelStatsData,
  fetchDropdownOptions,
  fetchServices,
  fetchUsers,
  fetchReportsData,
  fetchFundRequests
} from "../api/dashboard-service";

export function useDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  
  // Data State
  const [walletBalances, setWalletBalances] = useState([]);
  const [transactionFeed, setTransactionFeed] = useState([]);
  const [businessVolume, setBusinessVolume] = useState([]);
  const [successFailedData, setSuccessFailedData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [reportsPreview, setReportsPreview] = useState(null);
  const [fundRequests, setFundRequests] = useState([]);
  const [fundRequestsPeriod, setFundRequestsPeriod] = useState("today");

  // Dropdown Data State
  const [selectOptions, setSelectOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [loading, setLoading] = useState(true);

  // Initial Load (Static Data)
  useEffect(() => {
    setIsMounted(true);
    const loadStaticData = async () => {
      try {
        const [selectOpts, serviceOpts, userOpts] = await Promise.all([
          fetchDropdownOptions(),
          fetchServices(),
          fetchUsers()
        ]);
        setSelectOptions(selectOpts);
        setServiceOptions(serviceOpts);
        setUserOptions(userOpts);
      } catch (error) {
        console.error("Failed to load static options", error);
      }
    };
    loadStaticData();
  }, []);

  // Dynamic Data Load (Depend on Filters)
  useEffect(() => {
    if (!isMounted) return;

    const loadDynamicData = async () => {
      setLoading(true);
      try {
        // Pass filters to API functions
        const filters = { status: selectedOption, service: selectedService, user: selectedUser };

        const [wallets, txns, volume, status, channels, reports, funds] = await Promise.all([
          fetchDashboardWalletBalances(filters),
          fetchLatestTransactions(filters),
          fetchBusinessVolume(filters),
          fetchTransactionStatusData(filters),
          fetchChannelStatsData(filters),
          fetchReportsData(),
          fetchFundRequests(fundRequestsPeriod)
        ]);

        setWalletBalances(wallets);
        setTransactionFeed(txns);
        setBusinessVolume(volume);
        setSuccessFailedData(status);
        setChannelData(channels);
        setReportsPreview(reports);
        setFundRequests(funds);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicData();
  }, [selectedOption, selectedService, selectedUser, fundRequestsPeriod, isMounted]);

  return {
    isMounted,
    loading,
    // Filters
    selectedOption, setSelectedOption,
    selectedService, setSelectedService,
    selectedUser, setSelectedUser,
    fundRequestsPeriod, setFundRequestsPeriod,
    // Dropdown Options
    selectOptions,
    serviceOptions,
    userOptions,
    // Data
    walletBalances,
    transactionFeed,
    businessVolume,
    successFailedData,
    channelData,
    reportsPreview,
    fundRequests
  };
}
