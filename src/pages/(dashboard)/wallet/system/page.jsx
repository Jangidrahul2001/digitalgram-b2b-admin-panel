"use client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../../../../components/tables/data-table";
import { Button } from "../../../../components/ui/button";
import {
  Wallet,
  Lock,
  Receipt,
  History,
  Circle,
  ArrowRightLeft,
} from "@/components/icons";
import { cn } from "../../../../lib/utils";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { TableActions } from "../../../../components/shared/table-actions";
import { motion } from "framer-motion";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { handleValidationError } from "../../../../utils/helperFunction";
import { toast } from "sonner";
import SearchInput from "../../../../components/ui/SearchInput";
import ClickToCopy from "../../../../components/ui/ClickToCopy";

export default function WalletSystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [userWallets, setUserWallets] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.fetchAllUserWallets}?page=${pageIndex}&limit=${pageSize}`;

    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return url;
  };

  const { refetch: fetchUserWallets } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data.success) {
          setUserWallets(data.data);
          setTotalRecords(data.pagination.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching userSWallets:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    fetchUserWallets();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        cell: ({ row, index }) => (
          <span className="font-semibold text-slate-500 text-[13px]">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "User Name",
        cell: ({ row }) => {
          const userName = row.original.userName;
          return (
            <div className="flex flex-col items-center">
              <span className="text-slate-900 font-semibold text-[13px]">
                {row.getValue("fullName")}
              </span>
              <ClickToCopy text={userName} className={"text-[11px] text-slate-400 font-medium tracking-tight cursor-pointer hover:text-slate-600 transition-colors"}>
                {userName || "N/A"}
              </ClickToCopy>
            </div>
          );
        },
      },
      {
        accessorKey: "aepsWallet",
        header: "AEPS Wallet",
        cell: ({ row }) => (
          <span className="text-slate-700 font-bold text-[14px]">
            ₹{Number(row.getValue("aepsWallet") || 0).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "mainWallet",
        header: "Main Wallet",
        cell: ({ row }) => (
          <span className="text-slate-600 font-bold text-[14px]">
            ₹{Number(row.getValue("mainWallet") || 0).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "aepsHoldAmount",
        header: "AEPS Hold",
        cell: ({ row }) => (
          <span className="text-rose-600 font-bold text-[13px]">
            ₹{Number(row.getValue("aepsHoldAmount") || 0).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "mainHoldAmount",
        header: "Main Hold",
        cell: ({ row }) => (
          <span className="text-rose-600 font-bold text-[13px]">
            ₹{Number(row.getValue("mainHoldAmount") || 0).toLocaleString("en-IN")}
          </span>
        ),
      },
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="User's Wallet"
      subtitle="Overview of user wallet balances and activity."
      actions={
        <div className="flex items-center gap-3">
          <Link to="/wallet/system/hold-release">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                className="bg-slate-900 hover:bg-slate-800 text-white hover:text-white rounded-xl px-6 h-9 md:h-10"
              >
                <Lock className="h-4 w-4 mr-2" />
                Hold & Release
              </Button>
            </motion.div>
          </Link>
          <Link to="/wallet/system/credit-debit">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                className="bg-slate-900 hover:bg-slate-800 text-white hover:text-white rounded-xl px-6 h-9 md:h-10"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Credit & Debit
              </Button>
            </motion.div>
          </Link>
        </div>
      }
    >
      {/* Table Container */}
      <div className="p-0">
        <DataTable
          columns={columns}
          data={userWallets}
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
          exportData={userWallets}
          fileName="User_Wallets_Report"
        />
      </div>
    </PageLayout>
  );
}
