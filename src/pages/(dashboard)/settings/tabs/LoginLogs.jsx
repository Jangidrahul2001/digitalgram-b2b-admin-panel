import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DataTable } from "../../../../components/tables/data-table";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  formatDate,
  handleValidationError,
} from "../../../../utils/helperFunction";

const LoginLogs = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loginLogsColumns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SR.NO.",
        cell: ({ row, index }) => (
          <span className="font-semibold text-slate-500 text-[13px] pl-2">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "user",
        header: "User Details",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[14px]">
              {row.getValue("user")}
            </span>
            <span className="text-[12px] text-slate-400 lowercase tracking-tight">
              {row.original.email || "no-email@system.com"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => (
          <span className="text-slate-800 font-mono text-[12px] font-bold tracking-tight">
            {row.getValue("ipAddress")}
          </span>
        ),
      },
      {
        accessorKey: "device",
        header: "Device Info",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-700 text-[12px] font-bold">
              {row.getValue("device") || "Unknown Device"}
            </span>
          </div>
        ),
      },
      {
        id: "mapView",
        header: "Location",
        cell: ({ row }) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`,
                "_blank",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg border border-slate-200 hover:border-slate-900 transition-all duration-200 text-[12px] font-bold"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map View</span>
          </motion.button>
        ),
      },
      {
        accessorKey: "loginTime",
        header: "Timestamp",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-900 text-[12px] font-bold">
              {formatDate(row.getValue("loginTime")).split(' ')[0]}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              at {formatDate(row.getValue("loginTime")).split(' ').slice(1).join(' ')}
            </span>
          </div>
        ),
      },
    ],
    [pageIndex, pageSize],
  );

  const { refetch: fetchLoginLogs } = useFetch(
    `${apiEndpoints?.loginLogs}?page=${pageIndex}&limit=${pageSize}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setLoginLogs(data?.data);
          setTotalRecords(data?.pagination?.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  useEffect(() => {
    fetchLoginLogs();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-6 bg-slate-900 rounded-full" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Login Logs</h2>
      </div>

      <DataTable
        columns={loginLogsColumns}
        data={loginLogs}
        isLoading={isLoading}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPaginationChange={({ pageIndex, pageSize }) => {
          handlePageChange(pageIndex, pageSize);
          setIsLoading(true);
        }}
        onSearch={(val) => setSearchQuery(val)}
        exportData={loginLogs}
        fileName="User_Login_Logs_Report"
      />
    </div>
  );
};

export default LoginLogs;
