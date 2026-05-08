import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { Select } from "../../../../components/ui/select";
import { CustomDualCalendar } from "../../../../components/ui/custom-dual-calendar";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import { butteryDropdown } from "../../../../lib/animations";
import { Calendar as CalendarIcon } from "@/components/icons";
import {
  formatDate,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";

export default function AepsToWalletPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // Fetch Users for Filter
  const { refetch: fetchAllUsers } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data.success) {
          const userOptions = data.data.map(user => ({
            label: `${user.fullName} (${user.userName})`,
            shortLabel: user.fullName,
            value: user._id
          }));
          setUsers(userOptions);
        }
      }
    },
    true
  );

  const { refetch: fetchAepsToWalletHistory } = useFetch(
    `${apiEndpoints.aepsTowalletHistory}?page=${pageIndex}&limit=${pageSize}&search=${searchQuery}${selectedUser && selectedUser !== "" ? `&userId=${selectedUser}` : ""
    }${date.from ? `&startDate=${format(date.from, "yyyy-MM-dd")}` : ""}${date.to ? `&endDate=${format(date.to, "yyyy-MM-dd")}` : ""
    }`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setData(data.data);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching aepstowallethistory:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    fetchAepsToWalletHistory();
  }, [pageIndex, pageSize, searchQuery, selectedUser, date]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "sn",
        header: "SR.NO.",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Transaction Date",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-500 text-[12px] font-medium whitespace-nowrap">
              {formatDate(row.getValue("createdAt"))}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "User Name",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-900 font-semibold text-[13px]">
              {row.getValue("fullName")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="font-bold text-slate-900 text-[14px]">
              ₹{Number(row.getValue("amount") || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "openingBalance",
        header: "AEPS Before",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-500 font-medium text-[13px]">
              ₹{Number(row.getValue("openingBalance") || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "closingBalance",
        header: "AEPS After",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-indigo-600 font-bold text-[13px] bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/30">
              ₹{Number(row.getValue("closingBalance") || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="AEPS Wallet Transactions"
      subtitle="History of AEPS to Main Wallet transfers and settlements."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select User"
              value={selectedUser}
              onChange={(val) => setSelectedUser(val)}
              options={[{ label: "All Users", value: "" }, ...users]}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            className="w-full md:w-full lg:w-full xl:w-auto"
            triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
            align="right"
          />
        </div>
      }
    >
      <div className="p-0">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPaginationChange={({ pageIndex, pageSize }) => {
            handlePageChange(pageIndex, pageSize);
            setIsLoading(true);
          }}
          onSearch={(val) => setSearchQuery(val)}
          exportData={data}
          fileName="AEPS_Wallet_History_Report"
        />
      </div>
    </PageLayout>
  );
}
