import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Select } from "../../../../components/ui/select";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from "@/components/icons";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import {
  formatDate,
  formatToINR,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { cn } from "../../../../lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
import ExpandableMessage from "../../../../components/ui/ExpandableMessage";

export default function CommissionWiseReportPage() {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reportData, setReportsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [search, setSearch] = useState("");

  // Date Picker States
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // Fetch users for dropdown
  const { data: usersData } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {},
    true,
    false,
  );

  // Fetch services for dropdown
  const { data: servicesData } = useFetch(
    apiEndpoints.fetchServices,
    {},
    true,
    false,
  );

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (date?.from) params.from = format(date.from, "yyyy-MM-dd");
    if (date?.to) params.to = format(date.to, "yyyy-MM-dd");
    if (selectedUser && selectedUser !== "all") {
      params.userId = selectedUser;
    }
    if (selectedService && selectedService !== "all") {
      params.service = selectedService;
    }

    return params;
  }, [currentPage, pageSize, selectedUser, selectedService, date]);

  // Fetch commission report data
  const {
    error,
    refetch,
    isLoading: reportLoading
  } = useFetch(
    apiEndpoints.commissionWiseReport,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setReportsData(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
      },
      onError: (error) => {
        console.error("Failed to fetch commission report:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      }
    },
    false,
    true,
  );

  // Fetch data when filters change
  useEffect(() => {
    const params = buildQueryParams();
    refetch(params);
  }, [buildQueryParams, refetch]);

  // Process users data for dropdown
  const userOptions = useMemo(() => {
    const allUserOption = { label: "All Users", shortLabel: "All Users", value: "all" };

    if (usersData?.success && usersData?.data) {
      return [
        allUserOption,
        ...usersData.data.map((user) => ({
          label: `${user.fullName} (${user.userName})`,
          shortLabel: user.fullName,
          value: user._id,
        }))
      ];
    }
    return [allUserOption];
  }, [usersData]);

  // Process services data for dropdown
  const serviceOptions = useMemo(() => {
    const allServiceOption = { label: "All Services", value: "all" };

    if (servicesData?.success && servicesData?.data) {
      return [
        allServiceOption,
        ...servicesData.data.map((service) => ({
          label: service.name,
          value: service._id,
        }))
      ];
    }
    return [allServiceOption];
  }, [servicesData]);

  const handleSearch = () => {
    setCurrentPage(1);
    const params = buildQueryParams();
    refetch(params);
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setSelectedUser("");
    setSelectedService("");
    setCurrentPage(1);
  };

  const handlePaginationChange = ({ pageIndex }) => {
    setCurrentPage(pageIndex);
  };

  const filterActions = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[160px]">
        <Select
          placeholder="Service"
          options={serviceOptions}
          value={selectedService}
          onChange={(val) => {
            setSelectedService(val);
            setCurrentPage(1);
          }}
          className="h-9 md:h-10 border-slate-200 rounded-xl text-xs font-bold"
        />
      </div>

      <div className="w-[180px]">
        <Select
          placeholder="Select User"
          options={userOptions}
          value={selectedUser}
          onChange={(val) => {
            setSelectedUser(val);
            setCurrentPage(1);
          }}
          className="h-9 md:h-10 border-slate-200 rounded-xl text-sm font-bold"
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

  const columns = useMemo(() => [
    {
      id: "srNo",
      header: "SR NO.",
      center: true,
      cell: ({ row, index }) => (
        <span className="font-semibold text-[13px] text-slate-600">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "DATE",
      center: true,
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium whitespace-nowrap text-[13px]">
          {formatDate(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      id: "nameUserId",
      header: "NAME & USER ID",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col items-center justify-center">
          <span className="font-semibold text-[13px] text-slate-900 capitalize">
            {row.original.fullName || row.original.name || row.original.userName}
          </span>
          <ClickToCopy text={row.original.userId} className="text-[11px] text-slate-500 mt-0.5">
            ({row.original.userName})
          </ClickToCopy>
        </div>
      ),
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
      ),
    },
    {
      accessorKey: "serviceType",
      header: "SERVICE",
      center: true,
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium whitespace-nowrap text-[13px] uppercase">
          {row.getValue("serviceType")}
        </span>
      ),
    },

    {
      accessorKey: "amount",
      header: "COMMISSION",
      center: true,
      cell: ({ row }) => (
        <span className="text-emerald-600 font-bold text-[13px]">
          {formatToINR(row.getValue("amount"))}
        </span>
      ),
    },

    {
      accessorKey: "description",
      header: "DESCRIPTION",
      center: true,
      cell: ({ row }) => <ExpandableMessage text={row.getValue("description")} />
    },
  ], [currentPage, pageSize]);

  return (
    <PageLayout
      title="Commission Wise Report"
      subtitle="Track earnings and commissions across services."
      showBackButton={false}
      actions={filterActions}
    >
      <div className="flex flex-col gap-6 font-sans">
        {/* Results Section */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={reportData}
            isLoading={reportLoading}
            onSearch={setSearch}
            searchValue={search}
            exportData={reportData}
            exportColumns={columns}
            fileName="Commission_Report"
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            onPaginationChange={handlePaginationChange}
            totalRecords={totalRecords}
            pageSize={pageSize}
          />
        </div>
      </div>
    </PageLayout>
  );
}
