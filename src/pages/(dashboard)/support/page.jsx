import React, { useState, useMemo, useEffect, useRef } from "react";

import { useSearchParams } from "react-router-dom";
import { PageLayout } from "../../../components/layouts/page-layout";
import { motion } from "framer-motion";
import { SupportStats } from "./components/support-stats";
import { DataTable } from "../../../components/tables/data-table";
import { Eye, Edit, CheckCircle2 } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/dropdown-menu";
import { TicketModal } from "../../../components/modals/ticket-modal";
import { useFetch } from "../../../hooks/useFetch";
import { apiEndpoints } from "../../../api/apiEndpoints";
import {
  formatDate,
  handleValidationError,
} from "../../../utils/helperFunction";
import { usePatch } from "../../../hooks/usePatch";
import { toast } from "sonner";
import { Select } from "../../../components/ui/select";
import { DateRangePicker } from "../../../components/ui/date-range-picker";
import { format } from "date-fns";
import { RemarkDialog } from "./components/remark-dailog";
import { MessageCircle } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import ClickToCopy from "../../../components/ui/ClickToCopy";

export default function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [selectedTicketForRemark, setSelectedTicketForRemark] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsIsLoading, setStatsIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [serviceList, setServiceList] = useState([]);

  // Fetch Services for dropdown
  const { refetch: fetchServices } = useFetch(
    apiEndpoints.fetchServices,
    {
      onSuccess: (data) => {
        if (data.success) {
          const options = [{ label: "All Services", value: "all" }];
          data.data.forEach((service) => {
            options.push({
              label: service.name,
              shortLabel: service.name,
              value: service.name
            });
          });
          setServiceList(options);
        }
      },
    },
    true
  );

  const handleAddRemark = (ticket) => {
    setSelectedTicketForRemark(ticket);
    setIsRemarkDialogOpen(true);
  };

  const buildQueryParams = () => {
    let url = `${apiEndpoints.fetchSupportTickets}?page=${pageIndex}&limit=${pageSize}`;

    if (selectedStatus && selectedStatus !== "all") {
      url += `&status=${selectedStatus}`;
    }

    if (selectedService && selectedService !== "all") url += `&serviceName=${selectedService}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (dateRange.from) url += `&from=${format(dateRange.from, "yyyy-MM-dd")}`;
    if (dateRange.to) url += `&to=${format(dateRange.to, "yyyy-MM-dd")}`;

    return url;
  };

  const { refetch: fetchSupportTickets } = useFetch(
    buildQueryParams(),
    {
      onSuccess: (data) => {
        if (data.success) {
          setTickets(data.data);
          setTotalRecords(data.pagination.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching Tickets :", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { refetch: fetchSupportStats } = useFetch(
    `${apiEndpoints.fetchSupportStats}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = Object.keys(data?.data)?.map((status) => {
            return { label: status, value: data?.data[status] };
          });
          setStats(temp);
        }
        setStatsIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch support stats");
        setStatsIsLoading(false);
      },
    },
    true,
  );

  const { patch: updateStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || `Status Updated Successfully`);
        fetchSupportStats();
        fetchSupportTickets();
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleStatusChange = (ticketId, newStatus) => {
    updateStatus(`${apiEndpoints.updateSupportStatus}/${ticketId}`, {
      status: newStatus,
    });
  };

  useEffect(() => {
    fetchSupportTickets();
  }, [pageIndex, pageSize, searchQuery, selectedService, selectedStatus, dateRange]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleViewTicket = (ticket, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setClickPosition({ x, y });
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sn",
        header: "SN",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex justify-center">
            <span className="text-slate-900 font-bold text-[13px] uppercase tracking-tighter">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ticketId",
        header: "TICKET ID",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ClickToCopy text={row.getValue("ticketId")}>
              <span className="font-bold text-slate-900 text-[12px] tracking-tight cursor-pointer hover:text-indigo-600 transition-colors">
                {row.getValue("ticketId")}
              </span>
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "serviceName",
        header: "SERVICE",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-900 font-bold text-[13px]">{row.getValue("serviceName")}</span>
          </div>
        ),
      },
      {
        accessorKey: "transactionId",
        header: "REF ID",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.getValue("transactionId") ? (
              <ClickToCopy text={row.getValue("transactionId")}>
                <span className="text-slate-500 font-mono text-[12px] font-medium tracking-tight cursor-pointer hover:text-slate-900 transition-colors">
                  {row.getValue("transactionId")}
                </span>
              </ClickToCopy>
            ) : (
              <span className="text-slate-400 font-mono text-[12px] font-medium tracking-tight">
                N/A
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "STATUS",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "TIMELINE",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-slate-900 font-bold text-[12px]">
              {formatDate(row.getValue("createdAt"))}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "OPERATIONS",
        center: true,
        cell: ({ row }) => {
          const ticket = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <ActionButtons
                onView={(e) => handleViewTicket(ticket, e)}
              />
              {ticket.status === "pending" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                    >
                      <Edit className="h-5 w-5" strokeWidth={1.5} />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100"
                  >
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                        Transition Protocol
                      </p>
                    </div>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(ticket._id, "resolved")}
                      className="cursor-pointer flex items-center gap-3 p-2.5 text-slate-700 focus:text-emerald-700 focus:bg-emerald-50 font-medium rounded-lg transition-all group outline-none"
                    >
                      <div className="bg-slate-100 group-hover:bg-emerald-100 group-focus:bg-emerald-100 p-1.5 rounded-md transition-colors shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 group-focus:text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 group-focus:text-emerald-700 transition-colors">
                          Acknowledge
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                          Resolve Inquiry
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddRemark(ticket)}
                      className="cursor-pointer flex items-center gap-3 p-2.5 text-slate-700 focus:text-purple-700 focus:bg-purple-50 font-medium rounded-lg transition-all group outline-none"
                    >
                      <div className="bg-slate-100 group-hover:bg-purple-100 group-focus:bg-purple-100 p-1.5 rounded-md transition-colors shrink-0">
                        <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-purple-600 group-focus:text-purple-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-purple-700 group-focus:text-purple-700 transition-colors">
                          Add Remark
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                          Add Note
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
      }
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="Support System"
      subtitle="Operational monitoring and global inquiry response console."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          {/* Service Dropdown */}
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select service"
              options={serviceList}
              value={selectedService}
              onChange={setSelectedService}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[130px] xl:min-w-[140px]">
            <Select
              placeholder="Select status"
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Resolved", value: "resolved" },
                { label: "Closed", value: "closed" },
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              searchable={false}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          {/* Date Picker */}
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
            className="w-full md:w-full lg:w-full xl:w-auto"
            triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-10">
        <SupportStats stats={stats} isLoading={statsIsLoading} />

        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={tickets}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPaginationChange={({ pageIndex, pageSize }) => {
                handlePageChange(pageIndex, pageSize);
                setIsLoading(true);
              }}
              onSearch={(val) => {
                setSearchQuery(val);
                setPageIndex(1);
              }}
              exportData={tickets}
              fileName="Support_Infrastructure_Audit"
            />
          </div>
        </div>
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticketId={selectedTicket?._id || ""}
      />

      <RemarkDialog
        isOpen={isRemarkDialogOpen}
        onClose={() => setIsRemarkDialogOpen(false)}
        ticketId={selectedTicketForRemark?._id}
        onSuccess={() => {
          fetchSupportTickets();
          fetchSupportStats();
        }}
      />
    </PageLayout>
  );
}
