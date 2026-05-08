"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { Ticket, Trash2 } from "lucide-react";
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition";
import { toast } from "sonner";
import { ConfirmationModal } from "../../../components/modals/confirmation-modal";
import { formatDate, formatNumberInput, handleValidationError, InputSlice } from "../../../utils/helperFunction";
import { useFetch } from "../../../hooks/useFetch";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { usePost } from "../../../hooks/usePost";
import { usePatch } from "../../../hooks/usePatch";
import { useDelete } from "../../../hooks/useDelete";
import { DataTable } from "../../../components/tables/data-table";
import { PageLayout } from "../../../components/layouts/page-layout";
import ClickToCopy from "../../../components/ui/ClickToCopy";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import StatusBadge from "../../../components/ui/StatusBadge";
import { Input } from "../../../components/ui/input";

export default function CouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusCoupon, setStatusCoupon] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [errors, setErrors] = useState({
    couponCode: "",
    amount: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [statusUpdating, setStatusUpdating] = useState(false);

  const buildApiUrl = () => {
    let url = `${apiEndpoints.fetchCouponList}?page=${pageIndex}&limit=${pageSize}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    return url;
  };

  const { post: generateCode } = usePost(apiEndpoints?.createCoupon, {
    onSuccess: (data) => {
      if (data.success) {
        setLoading(false);
        toast.success(data.message || "Code generated successfully");
        setCouponCode("");
        setAmount("");
        fetchCodeDetails();
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "error in generating code");
      setLoading(false);
    },
  });

  const { patch: updateCouponStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Coupon status updated successfully");
        fetchCodeDetails();
        setStatusModalOpen(false);
        setStatusCoupon(null);
        setStatusUpdating(false);
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update status");
      setStatusModalOpen(false);
      setStatusCoupon(null);
      setStatusUpdating(false);
    },
  });

  const { remove: deleteCoupon } = useDelete(
    `${apiEndpoints.deleteCoupon}/${deletingCoupon?._id}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Coupon deleted successfully");
          fetchCodeDetails();
          setDeleteModalOpen(false);
          setDeletingCoupon(null);
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to delete coupon");
        setDeleteModalOpen(false);
        setDeletingCoupon(null);
      },
    },
  );

  const { refetch: fetchCodeDetails } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data.success) {
          setCoupons(data.data);
          setTotalRecords(data.pagination?.total);
          setFetching(false);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch code details",
        );
        setFetching(false);
      },
    },
    false,
  );

  useEffect(() => {
    const mainArea = document.querySelector('main');
    if (mainArea) mainArea.scrollTop = 0;
  }, []);

  useEffect(() => {
    fetchCodeDetails();
  }, [pageIndex, pageSize, searchQuery]);

  const handleValidation = () => {
    if (!couponCode || !amount) {
      setErrors({
        couponCode: !couponCode ? "Coupon code is required" : "",
        amount: !amount ? "Amount is required" : "",
      });
      return false;
    }
    return true;
  };

  const handleCreateCoupon = async () => {
    if (!handleValidation()) {
      return;
    }
    setLoading(true);
    generateCode({ code: couponCode, amount });
  };

  const initiateToggleStatus = (coupon) => {
    setStatusCoupon(coupon);
    setStatusModalOpen(true);
  };

  const handleToggleStatus = () => {
    if (!statusCoupon) return;
    setStatusUpdating(true);
    updateCouponStatus(
      `${apiEndpoints.toggleCouponStatus}/${statusCoupon._id}`,
      {
        isActive: !statusCoupon.isActive,
      },
    );
  };

  const initiateDelete = (coupon) => {
    setDeletingCoupon(coupon);
    setDeleteModalOpen(true);
  };

  const handleDeleteCoupon = () => {
    if (!deletingCoupon) return;
    deleteCoupon({ couponId: deletingCoupon._id });
  };

  const getCouponStatus = (coupon) => {
    if (coupon.isUsed) return "used";
    if (coupon.isExpired) return "expired";
    return "unused";
  };

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
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
        accessorKey: "code",
        header: "Coupon Code",
        center: true,
        cell: ({ row }) => {
          const code = row.getValue("code");
          return (
            <div className="flex justify-center items-center min-w-0">
              <ClickToCopy text={code}>
                <span
                  className="px-2.5 py-1 bg-slate-100 text-slate-900 font-bold text-[13px] font-mono tracking-wider rounded-lg border border-slate-200/60 cursor-pointer hover:bg-slate-200 transition-colors"
                  title={code}
                >
                  {code}
                </span>
              </ClickToCopy>
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Value",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="font-bold text-slate-900 text-[14px]">
              ₹{Number(row.getValue("amount")).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Generated",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-[12px] text-slate-500 font-medium">
              {formatDate(row.getValue("createdAt"))}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        center: true,
        cell: ({ row }) => {
          const status = getCouponStatus(row.original);
          return (
            <div className="flex justify-center">
              <StatusBadge status={status} />
            </div>
          );
        },
      },
      {
        accessorKey: "usedBy",
        header: "User (If Used)",
        center: true,
        cell: ({ row }) => {
          const name = row.original.usedByDetail?.name || "--";
          const userName = row.original.usedByDetail?.userName;
          return (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-semibold text-[13px] text-slate-900">
                {name}
              </span>
              {userName && (
                <ClickToCopy text={userName}>
                  <span className="text-[11px] text-slate-500 font-medium cursor-pointer hover:text-slate-900 transition-colors">
                    ({userName})
                  </span>
                </ClickToCopy>
              )}
            </div>
          );
        },
      },
      {
        id: "isActive",
        header: "Access",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center items-center">
            <button
              onClick={() => {
                if (getCouponStatus(row.original) !== "used") {
                  initiateToggleStatus(row.original)
                } else {
                  toast.error("Coupon is already used")
                }
              }}
              className={`group relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${row.original.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-200"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${row.original.isActive ? "translate-x-5.5" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        center: true,
        cell: ({ row }) => (
          <ActionButtons
            onDelete={() => initiateDelete(row.original)}
          />
        ),
      },
    ],
    [pageIndex, pageSize, initiateToggleStatus, initiateDelete],
  );

  return (
    <PageLayout
      title="Coupon Management"
      subtitle="Generate and manage promotional coupons for users."
    >
      <div className="flex flex-col gap-8">

        <div className="bg-white rounded-[1.5rem] border border-slate-200/60 p-6 md:p-8 transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <Ticket className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Generate New Coupon
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                  Coupon Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  error={errors.couponCode}
                  value={couponCode}
                  onChange={(e) => { setCouponCode(InputSlice(e.target.value.toUpperCase(), 20)); setErrors({ ...errors, couponCode: "" }); }}
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  error={errors.amount}
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => { setAmount(formatNumberInput(e.target.value, 8)); setErrors({ ...errors, amount: "" }); }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleCreateCoupon}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Coupon"}
              </Button>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-11 px-8 rounded-xl font-medium"
                onClick={() => {
                  setCouponCode("");
                  setAmount("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-6 bg-slate-900 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Coupons List</h2>
          </div>

          <DataTable
            columns={columns}
            data={coupons}
            isLoading={fetching}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPaginationChange={({ pageIndex, pageSize }) => {
              handlePageChange(pageIndex, pageSize);
              setFetching(true);
            }}
            onSearch={(val) => setSearchQuery(val)}
            exportData={coupons}
            fileName="Promotional_Coupons_Report"
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={
          statusCoupon?.isActive ? "Deactivate Coupon?" : "Activate Coupon?"
        }
        description={
          statusCoupon?.isActive
            ? "Are you sure you want to deactivate this coupon? Users won't be able to apply it."
            : "Are you sure you want to activate this coupon?"
        }
        confirmText={statusCoupon?.isActive && statusUpdating ? "Deactivating..." : !statusCoupon?.isActive && statusUpdating ? "Activating..." : statusCoupon?.isActive ? "Deactivate" : "Activate"}
        isDestructive={statusCoupon?.isActive}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      <div className="h-20" />
    </PageLayout>
  );
}
