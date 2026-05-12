"use client";
import React, { useState, useMemo, useEffect } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { Eye } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Select } from "../../../../components/ui/select";
import {
  formatDate,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { Button } from "../../../../components/ui/button";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

export default function KycRequestsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(null);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [kycData, setKycData] = useState([]);

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.fetchKyc}?page=${pageIndex}&limit=${pageSize}&status=${activeTab || ""}&search=${search}`;
    return url;
  };

  const { refetch: fetchKycRequest } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data.data);
          const mappedKyc = data.data.map((u, indx) => ({
            ...u,
            id: pageIndex * pageSize - pageSize + indx + 1,
            name:
              u.name ||
              `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
              u.username ||
              "Unknown",
          }));

          setKycData(mappedKyc);
          setTotalRecords(data.pagination.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching roles:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

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
        cell: ({ row, index }) => (
          <span className="font-semibold text-slate-500 text-[13px]">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => (
          <span className="text-slate-900 font-semibold text-[13px]">
            {row.getValue("name")}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "EMAIL",
        cell: ({ row }) => (
          <span className="text-slate-500 text-[13px] font-medium">{row.getValue("email")}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "MOBILE NUMBER",
        cell: ({ row }) => (
          <span className="text-slate-500 font-mono text-[13px] font-medium tracking-wide">
            {row.getValue("phone")}
          </span>
        ),
      },
      ...(activeTab === "Approved KYC" || activeTab === "Rejected KYC"
        ? [
          {
            accessorKey: "reviewedAt",
            header: "Approved At",
            cell: ({ row }) => (
              <span className="text-slate-500 font-mono text-[13px] font-medium">
                {formatDate(row.getValue("reviewedAt"))}
              </span>
            ),
          },
        ]
        : []),
      {
        id: "status",
        header: "KYC STATUS",
        cell: ({ row }) => {
          const rawStatus = row.original.status || "Pending";
          const statusKey =
            rawStatus.toLowerCase() === "rekyc"
              ? "Re-KYC"
              : rawStatus.toLowerCase() === "approved"
                ? "Approved"
                : rawStatus.toLowerCase() === "rejected"
                  ? "Rejected"
                  : "Pending";

          const styles = {
            Approved: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50",
            Pending: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100/50",
            "Re-KYC": "bg-purple-50 text-purple-700 border-purple-200 shadow-sm shadow-purple-100/50",
            Rejected: "bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-100/50",

          };

          const dots = {
            Approved: "bg-emerald-500",
            Pending: "bg-amber-500",
            Rejected: "bg-red-500",
            "Re-KYC": "bg-purple-500",
          };

          return (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all cursor-default mt-1",
                styles[statusKey]
              )}
            >
              <span className={cn("h-1 w-1 rounded-full animate-pulse", dots[statusKey])} />
              {statusKey}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => (
          <ActionButtons onView={() => {
            navigate(`/kyc-requests/${row.original._id}`)
          }}
            viewTitle="View Kyc" />
          
        ),
      },
    ],
    [pageIndex, pageSize, activeTab],
  );

  return (
    <PageLayout
      title="User KYC Request"
      subtitle="Manage pending and approved KYC verification requests."
      actions={
        <div className="w-auto">
          <Select
            placeholder="Select Status"
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            options={[
              { label: "All KYC", value: "" },
              { label: "Pending KYC", value: "pending" },
              { label: "Approved KYC", value: "approved" },
              { label: "Rejected KYC", value: "rejected" },
              { label: "Re-KYC", value: "rekyc" },
            ]}
            searchable={false}
            className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium min-w-[160px]"
          />
        </div>
      }
    >

      <DataTable
        columns={columns}
        data={kycData}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPaginationChange={({ pageIndex, pageSize }) => {
          handlePageChange(pageIndex, pageSize);
          setIsLoading(true);
        }}
        onSearch={(val) => setSearch(val)}
        exportData={kycData}
        exportColumns={columns}
        fileName={`KYC_Requests`}
      />
    </PageLayout>
  );
}
