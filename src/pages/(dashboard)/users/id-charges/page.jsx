"use client"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../components/tables/data-table"
import { Button } from "../../../../components/ui/button"
import { Pencil, Trash2, CreditCard } from "lucide-react"
import { PageLayout } from "../../../../components/layouts/page-layout"
import { Select } from "../../../../components/ui/select"
import { toast } from "sonner"
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal"
import { formatNumberInput, formatToINR, handleValidationError } from "../../../../utils/helperFunction"
import { motion } from "framer-motion"
import { cn } from "../../../../lib/utils"
import { apiEndpoints } from "../../../../api/apiEndpoints"
import { useFetch } from "../../../../hooks/useFetch"
import { usePost } from "../../../../hooks/usePost"
import { usePatch } from "../../../../hooks/usePatch"
import { usePut } from "../../../../hooks/usePut"

const StatusToggle = ({ row, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPaymentRequired = row.original.isPaymentRequired;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none",
          isPaymentRequired ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-200"
        )}
      >
        <motion.span
          animate={{ x: isPaymentRequired ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0"
        />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          onToggle(row.original);
          setIsModalOpen(false);
        }}
        title={isPaymentRequired ? "Deactivate Payment Charge?" : "Activate Payment Charge?"}
        description="Are you sure you want to change the status of this charge?"
        confirmText={isPaymentRequired ? "Deactivate" : "Activate"}
        isDestructive={isPaymentRequired}
      />
    </>
  );
};

export default function IdChargePage() {
  const navigate = useNavigate()
  const [charges, setCharges] = useState([])
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCharge, setEditingCharge] = useState(null)
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (charges.length > 0 && selectedRole) {
      const matchedCharge = charges.find(charge => charge._id === selectedRole)
      if (matchedCharge) {
        setAmount(matchedCharge.onBoardCharge || "")
      }
    }
  }, [selectedRole])



  // Status Toggle State
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Helper to find role name by ID
  const getRoleName = (id) => {
    const role = roles.find(r => r.value === id)
    return role ? role.label : id
  }

  // --- API Hooks ---
  const { data: rolesData } = useFetch(apiEndpoints.fetchRole, {
    onSuccess: (res) => {
      const mappedRoles = (res.data || []).map(role => ({
        label: role.name,
        value: role._id
      }))
      setRoles(mappedRoles)
    }
  })

  const { data: chargesData, isLoading: fetching, refetch: fetchCharges } = useFetch(apiEndpoints.fetchIdCharges, {
    onSuccess: (res) => {
      const data = res.data || []
      setCharges(data)
    }
  })

  const { post: createCharge } = usePost(apiEndpoints.createIdCharge, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("ID Charge created successfully")
        setAmount("")
        setSelectedRole("")
        fetchCharges()
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  })

  const { put: updateCharge } = usePut(apiEndpoints.updateIdCharge, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("ID Charge updated successfully")
        setEditModalOpen(false)
        setEditingCharge(null)
        fetchCharges()
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  })

  const { patch: updateStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully")
        fetchCharges()
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  })



  // --- Handlers ---
  const handleCreateCharge = async () => {
    if (!selectedRole || !amount) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const roleName = getRoleName(selectedRole)
      const generatedName = roleName ? `${roleName} ID Charge` : "ID Charge"

      createCharge({
        name: generatedName,
        amount: parseFloat(amount),
        role: selectedRole
      })
    } catch (error) {
      console.error("Error creating charge:", error)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (charge) => {
    setEditingCharge(charge)
    setNewName(charge.name || charge.chargeName || "")
    setNewAmount(charge.onBoardCharge || "")
    setEditModalOpen(true)
  }

  const handleUpdateCharge = async () => {
    if (!newName.trim() || !newAmount) {
      toast.error("All fields are required")
      return
    }

    setUpdating(true)
    try {
      const chargeId = editingCharge.id || editingCharge._id
      updateCharge(chargeId, {
        name: newName,
        amount: parseFloat(newAmount)
      })
    } catch (error) {
      console.error("Error updating charge:", error)
    } finally {
      setUpdating(false)
    }
  }

  const initiateToggleStatus = async (charge) => {
    setUpdatingStatus(true)
    try {
      const chargeId = charge._id
      updateStatus(`${apiEndpoints.togglePaymentRequired}/${chargeId}`)
    } catch (error) {
      console.error("Error updating Payment required status :", error)
    } finally {
      setUpdatingStatus(false)
    }
  }







  const columns = React.useMemo(() => [
    {
      accessorKey: "index",
      header: "SR.NO.",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="font-bold text-slate-400 text-xs">{row.index + 1}</span>
      )
    },
    {
      accessorKey: "name",
      header: "NAME",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.getValue("name")}</span>
      )
    },
    {
      accessorKey: "onBoardCharge",
      header: "AMOUNT",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900">{formatToINR(row.getValue("onBoardCharge"))}</span>
      )
    },
    {
      id: "paymentRequired",
      header: "Payment Required",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusToggle row={row} onToggle={initiateToggleStatus} />
        </div>
      )
    },
    {
      id: "actions",
      header: "ACTIONS",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            onClick={() => openEditModal(row.original)}
          >
            <Pencil className="h-5 w-5" />
          </motion.button>

        </div>
      )
    }
  ], [roles]);

  return (
    <PageLayout
      title="ID Charges Management"
      subtitle="Create and manage charges for ID creation."
      actions={
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 md:h-10 px-8 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-70 flex items-center gap-2"
              onClick={() => navigate("/id-charges/offline-charges")}
            >
              Offline Payments
            </Button>
          </motion.div>
        </div>
      }
    >
      {/* Add New Charge Card */}
      <div className="bg-white rounded-[1.5rem] border border-slate-200/50 p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] group transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add ID Charge</h2>
            <p className="text-xs text-slate-400 font-medium">Define new role-based registration fees</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Assign to Role</label>
              <Select
                placeholder="Select Role"
                options={roles}
                value={selectedRole}
                onChange={setSelectedRole}
                className="h-11 border-slate-200 rounded-xl focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Charge Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-slate-900 font-bold text-sm placeholder:text-slate-400 hover:border-slate-300 bg-slate-50/30 focus:bg-white"
                  value={amount}
                  onChange={(e) => setAmount(formatNumberInput(e.target.value, 7))}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCharge()}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 md:h-10 px-8 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-70 flex items-center gap-2"
              onClick={handleCreateCharge}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Charge Structure"}
            </Button>
            <Button
              variant="ghost"
              className="text-slate-400  hover:text-rose-500 hover:bg-rose-50 h-9 md:h-10 px-6 rounded-xl font-semibold text-sm transition-colors"
              onClick={() => {
                setAmount("")
                setSelectedRole("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Charges List Card */}
      <div className="flex flex-col">
        <div className="p-0">
          <DataTable
            columns={columns}
            data={charges}
            isLoading={fetching}
            loadingMessage="Fetching ID charges..."
            pageSize={100}
            totalRecords={4}
            exportData={charges}
            fileName="ID_Charges_Report"
          />
        </div>
      </div>



      <ConfirmationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleUpdateCharge}
        title="Edit ID Charge"
        description="Update the charge details below."
        confirmText={updating ? "Updating..." : "Update"}
      >
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Charge Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-slate-900 transition-all text-slate-700 font-medium"
              placeholder="Enter charge name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-slate-900 transition-all text-slate-700 font-medium"
              placeholder="Enter amount"
            />
          </div>
        </div>
      </ConfirmationModal>
    </PageLayout>
  )
}
