"use client";
import React, { useState, useEffect } from "react";
import { ManageServicesModal } from "../../../components/modals/manage-services-modal";
import { ConfirmationModal } from "../../../components/modals/confirmation-modal";
import { handleValidationError } from "../../../utils/helperFunction";
import { PageLayout } from "../../../components/layouts/page-layout";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import { Search, Plus, ShieldCheck, Eye } from "@/components/icons";
import { DataTable } from "../../../components/tables/data-table";
import ClickToCopy from "../../../components/ui/ClickToCopy";
import StatusBadge from "../../../components/ui/StatusBadge";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { UserCheck, UserPlus, Users } from "lucide-react";
import { Select } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch";
import { usePatch } from "../../../hooks/usePatch";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const StatusToggle = ({ row, updateUserStatus }) => {
  const id = row.original._id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptimisticActive, setIsOptimisticActive] = useState(row.original.isActive);
  console.log("isOptimisticActive", isOptimisticActive)

  // Sync with prop if it changes from outside (e.g., API response or external refresh)
  useEffect(() => {
    setIsOptimisticActive(row.original.isActive);
  }, [row.original.isActive]);

  const handleConfirm = () => {
    const newStatus = isOptimisticActive ? "inactive" : "active";
    setIsOptimisticActive(!isOptimisticActive);
    setIsModalOpen(false);

    updateUserStatus(`${apiEndpoints?.updateUserStatus}/${id}`, {
      status: newStatus,
    });
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          isOptimisticActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-200"
        )}
      >
        <motion.span
          animate={{ x: isOptimisticActive ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0"
          )}
        />
        <span className="sr-only">Toggle status</span>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={isOptimisticActive ? "Deactivate User?" : "Activate User?"}
        description={
          isOptimisticActive
            ? "Are you sure you want to deactivate this user? They will lose access to the platform."
            : "Are you sure you want to activate this user? They will regain access to the platform."
        }
        confirmText={isOptimisticActive ? "Deactivate" : "Activate"}
        isDestructive={isOptimisticActive}
      />
    </>
  );
};



export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.fetchUsers}?page=${pageIndex}&limit=${pageSize}`;

    if (statusFilter !== "All") {
      url += `&status=${statusFilter.toLowerCase()}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  };

  const { refetch: fetchUserStats } = useFetch(
    `${apiEndpoints.fetchUserStats}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setUserStats(data?.data);
        }
        setIsStatsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching userStats:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsStatsLoading(false);
      },
    },
    true,
  );
  const { refetch: fetchUsers } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {

          setUsers(data?.data);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching roles:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { patch: updateUserStatus } = usePatch({
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        toast.success(data?.message || "Status updated successfully");

        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((user) =>
            user.id === data?.data._id
              ? { ...user, status: data?.data.isActive ? "active" : "inactive" }
              : user,
          );
          return [...updatedUsers];
        });
      }
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  useEffect(() => {
    fetchUsers();
  }, [pageIndex, pageSize, statusFilter, search]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const userStatsData = {
    "STATE HEAD": {
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100 hover:border-amber-200 hover:shadow-amber-500/10",
      gradientTo: "to-amber-50/40",
      accent: "bg-amber-500",
      icon: Search
    },
    "MASTER DISTRIBUTOR": {
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-500/10",
      gradientTo: "to-emerald-50/40",
      accent: "bg-emerald-500",
      icon: UserCheck,
    },

    DISTRIBUTOR: {
      color: "text-rose-600",
      bg: "bg-rose-50/50",
      border: "border-rose-100 hover:border-rose-200 hover:shadow-rose-500/10",
      gradientTo: "to-rose-50/40",
      accent: "bg-rose-500",
      icon: UserPlus
    },
    RETAILER: {
      color: "text-indigo-600",
      bg: "bg-indigo-50/50",
      border: "border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-500/10",
      gradientTo: "to-indigo-50/40",
      accent: "bg-indigo-500",
      icon: Users
    },

  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex items-center gap-2 justify-center">

            <span className="font-semibold text-[13px] text-slate-600">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "FULL NAME",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-semibold text-[13px] text-slate-900">
                {row.original.firstName} {row.original.lastName}
              </span>
              {row.original.kycStatus?.toLowerCase() === "approved" && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-50" />
              )}
            </div>
            <ClickToCopy text={row.original.userName}>
              <span className="text-[11px] text-slate-500 font-medium hover:text-slate-700 cursor-pointer transition-colors inline-block mt-0.5">
                ( {row.original.userName} )
              </span>
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "parentUser",
        header: "PARENT USER",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[13px] text-slate-700 font-medium">
              {row.getValue("parentUser") || "Admin"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "PHONE NUMBER",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[13px] text-slate-600 font-medium tracking-wide">
              {row.getValue("phone") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "ROLE",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-bold text-slate-700 text-[11px] px-2.5 py-1 bg-slate-100/80 rounded-md capitalize">
              {row.getValue("role")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "package",
        header: "PACKAGE",
        center: true,
        cell: ({ row }) => {
          const pkg = row.original.package || "---";
          return (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-bold text-slate-700 text-[11px] px-2 py-0.5 bg-slate-100/80 rounded-md">

                {pkg}
              </span>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "ACCOUNT STATUS",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center pr-8">
            <StatusToggle row={row} updateUserStatus={updateUserStatus} />
          </div>
        ),
      },
      {
        id: "kycStatus",
        header: "KYC STATUS",
        center: true,

        cell: ({ row }) => {
          const rawStatus = row.original.kycStatus || "Pending";
          let statusKey = rawStatus;
          if (rawStatus.toLowerCase() === "rekyc") statusKey = "Re-Kyc";

          return (
            <div className="flex justify-center items-center">
              <StatusBadge status={statusKey} />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "ACTIONS",
        center: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center gap-3">
              <ActionButtons
                onView={() => navigate(`/users/${row.original._id}`)}
              />
            </div>
          );
        },
      },
    ],
    [pageIndex, pageSize, statusFilter],
  );

  return (
    <PageLayout
      title="User listing"
      subtitle="Manage user access and permissions."
      actions={
        <>
          <div className="w-auto">
            <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
              <Select
                placeholder="Select Status"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "All Status", value: "All" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                searchable={false}
                className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
              />
            </div>
          </div>
          <Link to="/users/new">
            <Button className="h-9 md:h-10 px-5 text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-600/20 transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
          <Link to="/users/upgrade">
            <Button
              variant="outline"
              className="h-9 md:h-10 px-5 text-sm font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all duration-200"
            >
              Upgrade User
            </Button>
          </Link>

        </>
      }
    >
      {/* ─── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isStatsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse"
            >
              {/* skeleton accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100" />
              <div className="p-5 pt-6 flex items-start justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                  <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                  <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-11 w-11 bg-slate-100 rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))
          : ["STATE HEAD", "MASTER DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"].map((role, i) => {
            const stat = userStats.find(s => s.role?.toUpperCase() === role) || { role, count: 0, percentage: 0 };
            const statData = userStatsData[role];

            return (
              <div
                key={role ?? i}
                className={cn(
                  "relative bg-linear-to-tr from-white transition-all duration-300 cursor-default group overflow-hidden shadow-sm hover:shadow-md",
                  statData?.gradientTo || "to-slate-50",
                  statData?.border || "border-slate-100",
                  "border rounded-2xl"
                )}
              >
                <div className="p-5 flex items-start justify-between">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-2">
                      {role}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">
                        {stat.count}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                        statData?.color === "text-emerald-600" ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                          statData?.color === "text-rose-600" ? "text-rose-600 bg-rose-50 border-rose-100" :
                            statData?.color === "text-indigo-600" ? "text-indigo-600 bg-indigo-50 border-indigo-100" :
                              "text-amber-600 bg-amber-50 border-amber-100"
                      )}>
                        {stat.percentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase flex items-center gap-1.5">
                      <span className={cn("h-1 w-1 rounded-full", statData?.accent || "bg-slate-300")} />
                      Total Registered
                    </p>
                  </div>

                  <div className={cn(
                    "p-3 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                    statData?.bg || "bg-slate-100"
                  )}>
                    {statData && <statData.icon className={cn("h-5 w-5", statData.color)} />}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Spacer between stats and table */}
      <div className="h-2" />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPaginationChange={({ pageIndex, pageSize }) => {
          handlePageChange(pageIndex, pageSize);
          setIsLoading(true)
        }}
        onSearch={(val) => setSearch(val)}
        exportData={users}
        exportColumns={columns}
        fileName="Users_Export"
      />

      {/* Modals */}
      <ManageServicesModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        user={selectedUser}
      />
    </PageLayout>
  );
}
