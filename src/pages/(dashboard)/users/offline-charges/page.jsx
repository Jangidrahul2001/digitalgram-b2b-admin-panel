"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../components/tables/data-table"
import { Check, X, Eye, Image, AlertCircle, FileImage } from "lucide-react"
import { PageLayout } from "../../../../components/layouts/page-layout"
import { Button } from "../../../../components/ui/button"
import { toast } from "sonner"
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal"
import ImageModal from "../../../../components/ui/ImageModal"
import { formatDate, handleValidationError } from "../../../../utils/helperFunction"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../../../lib/utils"
import { apiEndpoints } from "../../../../api/apiEndpoints"
import { useFetch } from "../../../../hooks/useFetch"
import { usePatch } from "../../../../hooks/usePatch"
import { createPortal } from "react-dom"
import { Select } from "../../../../components/ui/select"
import { DropdownMenu, DropdownMenuContent } from "../../../../components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import ClickToCopy from "../../../../components/ui/ClickToCopy"

// Custom Rejection Modal Component
function RejectionModal({ isOpen, onClose, onConfirm, chargeName, isProcessing }) {

  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    onConfirm(reason)
    setReason("")
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Request</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    Please provide a reason for rejecting {chargeName}'s offline charge request.
                  </p>

                  <textarea
                    className="w-full min-h-[100px] p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                    placeholder="Enter rejection reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-black/5"
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default function OfflineChargePage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setfilter] = useState({ status: null, mode: null })


  // Approve/Reject State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // "approve" or "reject"
    charge: null
  })
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    charge: null
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Image Modal State
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: []
  })

  // Build API URL with pagination and search
  const buildApiUrl = () => {
    let url = `${apiEndpoints.fetchOnBoardingRequests}?page=${pageIndex}&limit=${pageSize}&mode=${filter?.mode || ""}&status=${filter?.status || ""}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    return url
  }



  // Handle image view
  const handleViewPaymentProof = (paymentProof) => {
    if (!paymentProof) {
      toast.error("No payment proof available")
      return
    }

    // Handle both single image and array of images
    const images = [`${import.meta.env.VITE_API_URL}${paymentProof}`]
    setImageModal({
      isOpen: true,
      images: images
    })
  }



  // Using offline charge endpoints with pagination
  const { refetch: fetchOnBoardingRequests } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data)
          const mappedRequests = data.data.map((request) => ({
            ...request,
            id: request._id,
          }))
          setRequests(mappedRequests)
          setTotalRecords(data.pagination?.total || 0)
          setIsLoading(false)
        }
      },
      onError: (error) => {
        console.error("Error fetching requests:", error)
        setIsLoading(false)
        toast.error(handleValidationError(error) || "Something went wrong")
      }
    },
    false
  )

  const { patch: updateStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully")
        fetchOnBoardingRequests()
        setIsProcessing(false)
        setRejectionModal({ isOpen: false, charge: null })
        setActionModal({ isOpen: false, type: null, charge: null })
      }
    },
    onError: (error) => {
      setIsProcessing(false)
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  })

  // Refetch when pagination or search changes
  useEffect(() => {
    fetchOnBoardingRequests()
  }, [pageIndex, pageSize, search, filter.mode, filter.status])

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex)
      setPageSize(newPageSize)
    }
  }

  const handleAction = (type, charge) => {
    if (type === 'reject') {
      setRejectionModal({
        isOpen: true,
        charge
      })
    } else {
      setActionModal({
        isOpen: true,
        type,
        charge
      })
    }
  }

  const confirmAction = async () => {
    if (!actionModal.charge || !actionModal.type) return

    setIsProcessing(true)
    try {
      const chargeId = actionModal.charge._id
      updateStatus(`${apiEndpoints.approveIdChargeRequest}/${chargeId}`)

    } catch (error) {
      console.error(`Error during ${actionModal.type}:`, error)
      setIsProcessing(false)
    }
  }

  const confirmRejection = async (reason) => {
    if (!rejectionModal.charge) return

    setIsProcessing(true)
    try {
      const chargeId = rejectionModal.charge._id
      updateStatus(`${apiEndpoints.rejectIdChargeRequest}/${chargeId}`, { rejectionReason: reason })

    } catch (error) {
      console.error("Error during rejection:", error)
      setIsProcessing(false)
    }
  }

  const columns = React.useMemo(() => [
    {
      accessorKey: "index",
      header: "SR.NO.",
      headerClassName: "text-center",
      cell: ({ row, index }) => (
        <span className="font-bold text-slate-400 text-xs">
          {(pageIndex - 1) * pageSize + index + 1}
        </span>
      )
    },
    {
      accessorKey: "paymentProof",
      header: "PAYMENT PROOF",
      headerClassName: "text-center",
      cell: ({ row }) => {
        const paymentProof = row.getValue("paymentProof")
        const hasProof = paymentProof && (Array.isArray(paymentProof) ? paymentProof.length > 0 : true)

        return (
          <div className="flex justify-center">
            {hasProof ? (
              <div
                className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                onClick={() => handleViewPaymentProof(paymentProof)}
                title="View Payment Proof"
              >
                <FileImage className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                <Image className="h-4 w-4" />
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "fullName",
      header: "NAME",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.getValue("fullName")}</span>
      )
    },
    {
      accessorKey: "paymentDate",
      header: "PAYMENT DATE",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className=" text-slate-700">{formatDate(row.getValue("paymentDate"))}</span>
      )
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900">₹{row.getValue("amount")}</span>
      )
    },
    {
      accessorKey: "referenceId",
      header: "Transaction Id",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <ClickToCopy text={row.getValue("referenceId")} className={"px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[11px] font-bold cursor-pointer hover:bg-amber-100 transition-colors inline-block"}>
          {row.getValue("referenceId")}
        </ClickToCopy>

      )
    },

    {
      accessorKey: "mode",
      header: "MODE",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="text-slate-700">{row.getValue("mode")}</span>
      )
    },

    {
      id: "status",
      header: "STATUS",
      headerClassName: "text-center",
      cell: ({ row }) => {
        const status = row.original.status;
        const isApproved = status === "approved";
        const isRejected = status === "rejected";
        const isPending = !isApproved && !isRejected;

        return (
          <div className="flex justify-center">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isApproved ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                isRejected ? "bg-rose-50 text-rose-600 border border-rose-100" :
                  "bg-amber-50 text-amber-600 border border-amber-100"
            )}>
              {status}
            </span>
          </div>
        )
      }
    },
    {
      header: "Rejection Reason",
      accessorKey: "rejectionReason",
      headerClassName: "text-center",
      cell: ({ row }) => {
        const text = row.original.rejectionReason || "---";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="max-w-[150px] md:max-w-[200px] items-center truncate cursor-pointer group">
                <span className="text-[11px] font-medium text-slate-400 capitalize whitespace-nowrap transition-colors duration-200 group-hover:text-indigo-600">
                  {text}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-[300px] p-3 bg-white border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-xl z-[100]"
            >
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Full Description</p>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed break-words">
                  {text}
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    },
    {
      accessorKey: "utrNumber",
      header: "UTR",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className=" text-slate-700">{row.getValue("utrNumber")}</span>
      )
    },
    {
      accessorKey: "couponCode",
      header: "Coupon Code",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className=" text-slate-700">{row.getValue("couponCode")}</span>
      )
    },
    {
      id: "actions",
      header: "ACTIONS",
      headerClassName: "text-center",
      cell: ({ row }) => {
        const status = row.original.status;
        const isApproved = status === "approved";
        const isRejected = status === "rejected";
        const isPending = !isApproved && !isRejected;

        // Only show actions for pending status
        if (!isPending) {
          return (
            <div className="flex justify-center">
              <span className="text-xs text-slate-400 font-medium">No actions</span>
            </div>
          )
        }

        return (
          <div className="flex justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
              onClick={() => handleAction('approve', row.original)}
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/50 hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm"
              onClick={() => handleAction('reject', row.original)}
              title="Reject"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        )
      }
    }
  ], [pageIndex, pageSize]);

  return (
    <PageLayout
      title="Onboarding Charges"
      subtitle="Manage and configure requests for offline ID requests."
      showBackButton={true}
      className="max-w-[1600px] mx-auto"
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select Status"
              value={filter.status}
              onChange={(val) => setfilter({ ...filter, status: val })}
              options={[
                { label: "All Requests", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },]}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[130px] xl:min-w-[140px]">
            <Select
              placeholder="Select mode"
              value={filter.mode}
              onChange={(val) => setfilter({ ...filter, mode: val })}
              options={[
                { label: "All Mode", value: "" },
                { label: "Coupon", value: "couponCode" },
                { label: "Offline", value: "offline" },
                { label: "Online", value: "online" },
              ]}
              searchable={false}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>


        </div>
      }
    >
      {/* Main Content Card */}
      <div className="rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] overflow-hidden">

        {/* Table */}
        <div className="p-0 mb-20">
          <DataTable
            searchPlaceholder="Search requests..."
            searchValue={search}
            onSearch={(val) => { setSearch(val); setPageIndex(1) }}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            exportData={requests}
            fileName="offline_onBoarding_requests"
            columns={columns}
            data={requests}
            isLoading={isLoading}
            loadingMessage="Fetching offline requests..."
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPaginationChange={({ pageIndex, pageSize }) => {
              handlePageChange(pageIndex, pageSize)
              setIsLoading(true)

            }}
          />
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: null, charge: null })}
        onConfirm={confirmAction}
        title="Approve Request?"
        description="Are you sure you want to approve this offline charge request?"
        confirmText={isProcessing ? "Processing..." : "Approve"}
        isDestructive={false}
      />

      {/* Rejection Modal with Reason */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, charge: null })}
        onConfirm={confirmRejection}
        chargeName={rejectionModal.charge?.fullName}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, images: [] })}
        images={imageModal.images}
      />
    </PageLayout>
  )
}
