"use client";
import {
  Filter,
  Eye,
  Calendar as CalendarIcon,
  ShieldCheck,
  History,
  Search as SearchIcon
} from "@/components/icons";
import { format } from "date-fns";
import {
  Card,
  CardContent,
} from "../../../../components/ui/card";
import {
  formatDate,
  formatToINR,
  InputSlice,
} from "../../../../utils/helperFunction";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../../lib/utils";
import { RefreshCw, Zap } from "lucide-react";
import { useFetch } from "../../../../hooks/useFetch";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

export default function TransactionSearchPage() {
  const [reportData, setReportData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [internalLoading, setInternalLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [selectedUser, setSelectedUser] = useState("");
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  const [useList, setUserList] = useState([]);

  // Fetch users for dropdown
  const { data: usersData } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const options = [{ label: "All Users", value: "all" }];
          const users = data?.data?.map((user) => ({
            label: `${user?.fullName || "User"} (${user.userName || "userId"})`,
            value: user._id,
          }));
          options.push(...users);
          setUserList(options);
        }
      },
    },
    true,
    false
  );

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (date?.from) params.from = format(date.from, "yyyy-MM-dd");
    if (date?.to) params.to = format(date.to, "yyyy-MM-dd");
    if (selectedUser && selectedUser !== "all") params.userId = selectedUser;
    if (search) params.search = search;

    return params;
  }, [currentPage, pageSize, date, selectedUser, search]);







  const handleSearch = () => {
    setCurrentPage(1);
    const params = buildQueryParams();
    refetch(params);
  };

  const handleReset = () => {
    setSearch("");
    setDate({ from: null, to: null });
    setSelectedUser("");
    setCurrentPage(1);
  };

  const handlePaginationChange = ({ pageIndex }) => {
    setCurrentPage(pageIndex);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "srNo",
        header: "SR NO.",
        center: true,
        cell: ({ index }) => (
          <span className="font-semibold text-[13px] text-slate-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "DATE & TIME",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold tracking-tight text-[12px]">
              {formatDate(row.getValue("createdAt")).split(" ")[0]}
            </span>
            <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest leading-none mt-1">
              {formatDate(row.getValue("createdAt")).split(" ")[1]}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "userName",
        header: "NAME & USER ID",
        center: true,
        cell: ({ row }) => {
          const fullName = row.original.fullName || "User Name";
          const userName = row.getValue("userName");
          return (
            <div className="flex flex-col justify-center items-center min-w-0">
              <span
                className="text-slate-900 font-bold text-[13px] capitalize truncate max-w-[150px]"
                title={fullName}
              >
                {fullName}
              </span>
              <ClickToCopy text={userName}>
                <span
                  className="text-slate-400 text-[11px] font-black lowercase mt-1 flex items-center cursor-pointer hover:text-slate-600 transition-colors">
                  ({userName})
                </span>
              </ClickToCopy>
            </div>
          );
        },
      },
      {
        accessorKey: "referenceId",
        header: "REFERENCE ID",
        center: true,
        cell: ({ row }) => (
          <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
            <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
              {row.original.referenceId}
            </span>
          </ClickToCopy>
        )
      },
      {
        accessorKey: "description",
        header: "TRANSACTION TYPE",
        center: true,
        cell: ({ row }) => {
          const description = row.getValue("description") || "General Adjustment";
          return (
            <div className="flex flex-col items-center justify-center gap-1 min-w-0">
              <span
                className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-200/50 "
                title={description}
              >
                {description}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        center: true,
        cell: ({ row }) => {
          const amount = row.original.amount || (Math.abs(row.original.closingBalance - row.original.openingBalance));
          const isCredit = row.original.closingBalance > row.original.openingBalance;
          const formattedAmount = `${isCredit ? "+" : ""}${formatToINR(amount)}`;
          return (
            <div className="flex flex-col items-center justify-center min-w-0">
              <span
                className={cn(
                  "text-[14px] font-black tabular-nums tracking-tighter truncate max-w-[120px]",
                  isCredit ? "text-emerald-600" : "text-slate-900"
                )}
                title={formattedAmount}
              >
                {formattedAmount}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: "closingBalance",
        header: "FINAL BALANCE",
        center: true,
        cell: ({ row }) => {
          const val = formatToINR(row.getValue("closingBalance"));
          return (
            <span
              className="text-slate-900 font-bold text-[13px] tabular-nums truncate max-w-[120px] block"
              title={val}
            >
              {val}
            </span>
          );
        },
      },
      {
        id: "view",
        header: "AUDIT",
        center: true,
        cell: ({ row }) => (
          <ActionButtons onView={() => navigate(`/transactions`, { state: { transactionId: row.original._id } })} />
        ),
      },
    ],
    [currentPage, pageSize, navigate]
  );

  const filterActions = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[180px]">
        <Select
          placeholder="Users"
          options={useList}
          value={selectedUser}
          onChange={setSelectedUser}
          className="h-10 border-slate-200 rounded-xl text-sm font-semibold"
        />
      </div>

      <DateRangePicker
        date={date}
        setDate={setDate}
        onApply={handleSearch}
        onReset={handleReset}
        triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
        align="right"
      />
    </div>
  );

  return (
    <PageLayout
      title="Transaction Search"
      subtitle="Comprehensive audit and global transaction explorer"
      showBackButton={false}
      actions={filterActions}
    >
      <div className="flex flex-col gap-6 font-sans pb-10">

        {/* Minimal Search Hub with Title and Zap Icon */}
        <Card className="border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] bg-white rounded-2xl relative overflow-hidden group">
          {/* Decorative Zap Icon */}
          <div className="absolute top-6 right-6 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-100/50 text-slate-500 shadow-sm transition-all duration-300 hover:scale-110">
            <Zap className="w-5 h-5 fill-slate-500/20" />
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Find Transactions</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Search Anything</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full flex items-center gap-3">
                <div className="relative flex-1 group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#2f35cd] transition-colors">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search Reference, Mobile or UTR..."
                    value={search}
                    onChange={(e) => setSearch(InputSlice(e.target.value, 100))}
                    onKeyDown={handleKeyDown}
                    className="h-11 pl-11 pr-14 bg-slate-50/50 border-slate-200/60 rounded-xl text-[13px] font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
                <Button
                  onClick={handleSearch}
                  className="flex-1 lg:flex-none h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-2"
                >
                  <SearchIcon className="w-3.5 h-3.5" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 lg:flex-none h-11 px-6 border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Output Table */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={reportData}
            isLoading={internalLoading}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
            onSearch={setSearch}
            searchValue={search}
            exportData={reportData}
            fileName="Global_Audit_Log"
            loadingMessage="Establishing link to master ledger..."
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>

        {/* Informational Footer */}
        <div className="flex flex-col items-center gap-4 py-12 opacity-30 select-none">
          <div className="h-px w-12 bg-slate-300" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Production Audit Trace Validated
          </p>
        </div>

      </div>
    </PageLayout>
  );
}
