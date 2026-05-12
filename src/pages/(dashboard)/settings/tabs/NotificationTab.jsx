import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import React, { useMemo, useState, useEffect } from 'react'
import { DataTable } from '../../../../components/tables/data-table'
import { ConfirmationModal } from '../../../../components/modals/confirmation-modal'
import { useFetch } from '../../../../hooks/useFetch'
import { useDelete } from '../../../../hooks/useDelete'
import { usePatch } from '../../../../hooks/usePatch'
import { apiEndpoints } from '../../../../api/apiEndpoints'
import { toast } from 'sonner'
import { handleValidationError } from '../../../../utils/helperFunction'

const NotificationTab = () => {
    const [notifications, setNotifications] = useState([])
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, _id: null })
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch notifications
    const { isLoading: isLoadingNotifications, refetch } = useFetch(
        `${apiEndpoints.fetchAllNotifications}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`,
        {
            onSuccess: (data) => {
                if (data?.success && data?.data) {
                    setNotifications(data?.data)
                }
            },
            onError: (error) => toast.error(handleValidationError(error) || "Failed to fetch notifications")
        }
    )

    useEffect(() => {
        refetch();
    }, [searchQuery]);

    // Delete notification
    const { remove } = useDelete(`${apiEndpoints.deleteNotification}/${deleteModal._id}`, {
        onSuccess: (data) => {
            refetch()
            toast.success(data.message || "Notification deleted successfully");
            setDeleteModal({ isOpen: false, _id: null })
        },
        onError: (error) => toast.error(handleValidationError(error) || "Failed to delete notification")
    })

    // Toggle notification status
    const { patch } = usePatch({
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || "Notification status updated successfully")
            }
            refetch()
        },
        onError: (error) => toast.error(handleValidationError(error) || "Failed to update status")
    })

    const handleDeleteClick = (_id) => {
        setDeleteModal({ isOpen: true, _id })
    }

    const handleDeleteConfirm = async () => {
        await remove()
    }

    const handleToggleStatus = async (id) => {
        await patch(`${apiEndpoints.toogleNotificationStatus}/${id}`)
    }

    const notificationColumns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "SR.NO.",
                cell: ({ row, index }) => (
                    <span className="font-semibold text-slate-500 text-[13px] pl-2">
                        {index + 1}
                    </span>
                ),
            },
            {
                accessorKey: "name",
                header: "Notification Heading",
                cell: ({ row }) => (
                    <div className="flex flex-col max-w-[500px]">
                        <span className="font-bold text-slate-900 text-[14px] leading-tight wrap-break-word">
                            {row.getValue("name")}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.getValue("isActive");
                    return (
                        <div 
                            onClick={() => handleToggleStatus(row.original._id)}
                            className={`
                                inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer transition-all hover:scale-105 active:scale-95
                                ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"}
                            `}
                        >
                            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {isActive ? "Active" : "Inactive"}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(row.original._id)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </motion.button>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notification List</h2>
            </div>
            
            <DataTable
                columns={notificationColumns}
                data={notifications}
                isLoading={isLoadingNotifications}
                onSearch={(val) => setSearchQuery(val)}
                exportData={notifications}
                fileName="System_Notifications_Report"
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, _id: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Notification"
                description="Are you sure you want to delete this notification? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    )
}

export default NotificationTab
