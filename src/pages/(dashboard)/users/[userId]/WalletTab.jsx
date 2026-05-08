import React, { useState, useMemo } from 'react'
import { BentoCard } from '../../../../components/ui/bento-card';
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AlertCircle, Check, CreditCard, Settings, Shield, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Unlock } from 'lucide-react';
import { Select } from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { usePatch } from '../../../../hooks/usePatch';
import { useFetch } from '../../../../hooks/useFetch';
import { ConfirmationModal } from '../../../../components/modals/confirmation-modal';
import { DataTable } from '../../../../components/tables/data-table';
import { apiEndpoints } from '../../../../api/apiEndpoints';
import { toast } from 'sonner';
import { formatToINR, handleValidationError, InputSlice } from '../../../../utils/helperFunction';
import { cn } from '../../../../lib/utils';
import { fetchAdminWallet } from '../../../../store/slices/walletSlice';
import { useDispatch } from 'react-redux';

// Validation functions
const validateWalletType = (walletType) => {
  if (!walletType) return "Please select a wallet type";
  return null;
};

const validateAction = (action) => {
  if (!action) return "Please select an action type";
  return null;
};

const validateAmount = (amount) => {
  if (!amount) return "Amount is required";
  if (isNaN(amount) || parseFloat(amount) <= 0) return "Amount must be a positive number";
  if (parseFloat(amount) > 10000000) return "Amount cannot exceed ₹1,00,00,000";
  return null;
};

const validateReason = (reason) => {
  if (!reason || reason.trim().length < 5) return "Reason must be at least 5 characters long";
  if (reason.trim().length > 200) return "Reason cannot exceed 200 characters";
  return null;
};

const ModernWalletCard = ({ label, value, type, trend }) => {
  const config = {
    main: {
      gradient: "from-emerald-500/10 to-emerald-500/5",
      text: "text-emerald-700",
      border: "border-emerald-100",
      icon: Wallet,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    aeps: {
      gradient: "from-amber-500/10 to-amber-500/5",
      text: "text-amber-700",
      border: "border-amber-100",
      icon: Wallet,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    mainHold: {
      gradient: "from-rose-500/10 to-rose-500/5",
      text: "text-rose-700",
      border: "border-rose-100",
      icon: CreditCard,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
    },
    slate: {
      gradient: "from-slate-500/10 to-slate-500/5",
      text: "text-slate-700",
      border: "border-slate-100",
      icon: Shield,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    aepsHold: {
      gradient: "from-blue-500/10 to-blue-500/5",
      text: "text-blue-700",
      border: "border-blue-100",
      icon: CreditCard,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  }[type] || {
    gradient: "from-slate-50 to-white",
    text: "text-slate-900",
    border: "border-slate-100",
    icon: Wallet,
    iconColor: "text-slate-900",
    iconBg: "bg-slate-100",
  };

  const Icon = config?.icon;

  return (
    <motion.div
      className={`
                relative overflow-hidden rounded-2xl p-4 border ${config?.border} bg-white/60 backdrop-blur-md
                shadow-sm transition-all duration-300
            `}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config?.gradient} opacity-50`}
      />
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            {label}
          </p>
          <h3 className={`text-xl font-black tracking-tight ${config?.text}`}>
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-xl ${config?.iconBg}`}>
          <Icon className={`w-4 h-4 ${config?.iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="relative mt-3 flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400">{trend}</span>
        </div>
      )}
    </motion.div>
  );
};

// Enhanced Select component with error support
const SelectWithError = ({ error, className, ...props }) => {
  return (
    <div className="w-full">
      <Select
        className={`${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const WalletTab = ({ userId, user, fetchParticularUser }) => {

  const [formData, setFormData] = useState({
    walletType: "",
    action: "",
    amount: "",
    reason: ""
  });
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('');

  // Fetch wallet transactions
  const { data: walletData, refetch } = useFetch(
    `${apiEndpoints.fetchWalletTransactions}/${userId}?page=${pageIndex}&limit=${pageSize}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const mappedTransactions = data.data.map((transaction) => ({
            ...transaction,
            id: transaction._id,
            formattedDate: new Date(transaction.createdAt).toLocaleDateString('en-IN'),
            formattedTime: new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
          }));
          setTransactions(mappedTransactions);
          setTotalRecords(data.pagination?.total || 0);
          setIsLoading(false)
        }
      },
      onError: (error) => {
        console.error('Error fetching transactions:', error);
        setIsLoading(false)
        toast.error(handleValidationError(error) || "Failed to fetch transactions");
      }
    },
    false
  );

  const { patch, error: apiError } = usePatch({
    onSuccess: (response) => {
      toast.success(response.message || "Transaction successful");
      setFormData({ walletType: "", action: "", amount: "", reason: "" });
      setErrors({});
      setIsSubmitting(false);
      setShowConfirmModal(false)
      refetch(); // Refresh the transactions table
      fetchParticularUser()
      dispatch(fetchAdminWallet());
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  });

  const walletOptions = [
    { label: "Main Wallet", value: "main" },
    { label: "AEPS Wallet", value: "aeps" },
  ];

  const actionOptions = [
    { label: "Credit", value: "credit" },
    { label: "Debit", value: "debit" },
    { label: "Hold", value: "hold" },
    { label: "Release", value: "release" },
  ];

  const validateForm = () => {
    const newErrors = {};

    const walletTypeError = validateWalletType(formData.walletType);
    if (walletTypeError) newErrors.walletType = walletTypeError;

    const actionError = validateAction(formData.action);
    if (actionError) newErrors.action = actionError;

    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;

    const reasonError = validateReason(formData.reason);
    if (reasonError) newErrors.reason = reasonError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show confirmation modal instead of directly submitting
    setShowConfirmModal(true);
  };

  const handleConfirmTransaction = async () => {
    setIsSubmitting(true);

    try {
      if (formData.walletType === "aeps" && formData.action === "credit") {
        toast.error("Direct credit to AEPS wallet is not allowed.");
        setIsSubmitting(false);
        setShowConfirmModal(false)

      }
      else {
        await patch(`${["hold", "release"].includes(formData.action) ? apiEndpoints.holdAndReleaseAmount : apiEndpoints.debitCreditAmount}`, {
          userId: userId,
          walletType: formData.walletType,
          type: formData.action,
          amount: formData.amount,
          reason: formData.reason,
        });
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'credit': return 'text-emerald-600';
      case 'debit': return 'text-red-600';
      case 'hold': return 'text-amber-600';
      case 'release': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'credit': return ArrowUpRight;
      case 'debit': return ArrowDownLeft;
      case 'hold': return Clock;
      case 'release': return Unlock;
      default: return Wallet;
    }
  };

  const getWalletLabel = (walletType) => {
    const wallet = walletOptions.find(w => w.value === walletType);
    return wallet ? wallet.label : walletType;
  };

  const getActionLabel = (action) => {
    const actionItem = actionOptions.find(a => a.value === action);
    return actionItem ? actionItem.label : action;
  };

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: "index",
      header: "SR.NO.",
      cell: ({ row, index }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-slate-600">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "walletType",
      header: "WALLET TYPE",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-slate-700 text-[13px]">
            {row.getValue("walletType") || "Main Wallet"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "ACTION",
      cell: ({ row }) => {
        const action = row.getValue("type");
        const ActionIcon = getActionIcon(action);
        return (
          <div className="flex items-center gap-2">
            <ActionIcon className={`w-4 h-4 ${getActionColor(action)}`} />
            <span className={`font-medium text-[13px] capitalize ${getActionColor(action)}`}>
              {action}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 text-[13px]">
          ₹ {row.getValue("amount")?.toLocaleString('en-IN') || '0.00'}
        </span>
      ),
    },
    {
      accessorKey: "reason",
      header: "REASON",
      cell: ({ row }) => (
        <span className="text-slate-500 text-[13px] max-w-[200px] truncate block">
          {row.getValue("reason") || "No reason provided"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.original.status || "completed";
        const statusConfig = {
          completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
          pending: "bg-amber-50 text-amber-700 border-amber-200",
          failed: "bg-red-50 text-red-700 border-red-200",
        };

        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
            statusConfig[status] || statusConfig.completed
          )}>
            <span className={cn(
              "h-1 w-1 rounded-full",
              status === 'completed' ? "bg-emerald-500" :
                status === 'pending' ? "bg-amber-500" : "bg-red-500"
            )} />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "formattedDate",
      header: "DATE & TIME",
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
          <span className="font-medium text-slate-700 text-[13px]">
            {row.getValue("formattedDate")}
          </span>
          <span className="text-xs text-slate-400">
            {row.original.formattedTime}
          </span>
        </div>
      ),
    },
  ], [pageIndex, pageSize]);
  return (
    <div className="space-y-8">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ModernWalletCard
          label="Main Wallet"
          value={formatToINR(user?.mainWallet || 0)}
          type="main"
          trend="Available balance"
        />
        <ModernWalletCard
          label="AEPS Wallet"
          value={formatToINR(user?.aepsWallet || 0)}
          type="aeps"
          trend="Available balance"
        />
        <ModernWalletCard
          label="Main Wallet Hold"
          value={formatToINR(user?.mainHoldAmount || 0)}
          type="mainHold"
          trend="Temporarily blocked"
        />
        <ModernWalletCard
          label="AEPS Wallet Hold"
          value={formatToINR(user?.aepsHoldAmount || 0)}
          type="aepsHold"
          trend="Temporarily blocked"
        />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Admin Action */}
        <BentoCard className="xl:col-span-1 p-0 h-fit border-slate-200/60 shadow-sm">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 px-6 flex flex-row items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-slate-900 uppercase tracking-tight">
                Admin Actions
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-600 font-medium">
                Manage user wallet funds manually with precision.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <SelectWithError
                label="Wallet Type"
                placeholder="Select Wallet"
                options={walletOptions}
                value={formData.walletType}
                onChange={(value) => handleInputChange('walletType', value)}
                error={errors.walletType}
              />

              <SelectWithError
                label="Action Type"
                placeholder="Select Action"
                options={actionOptions}
                value={formData.action}
                onChange={(value) => handleInputChange('action', value)}
                error={errors.action}
              />

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-5 -translate-y-1/2 text-slate-400 font-medium z-10 pointer-events-none">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    error={errors.amount}
                    className="pl-7 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-[13px] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Reason / Remarks
                </Label>
                <Input
                  placeholder="Enter reason for this action..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', InputSlice(e.target.value, 200))}
                  error={errors.reason}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-[13px] transition-all"
                />
              </div>

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {apiError.message || 'An error occurred while processing the transaction'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 text-[13px] font-bold rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Processing...' : 'Submit Transaction'}
              </Button>
            </form>
          </CardContent>
        </BentoCard>

        {/* Transaction History - Replaced static table with DataTable */}
        <div className="xl:col-span-2">
          <BentoCard className="p-0 border-slate-200/60 shadow-sm h-fit">
            <div className="p-0">
              <DataTable
                columns={columns}
                data={transactions}
                isLoading={isLoading}
                pageSize={pageSize}
                totalRecords={totalRecords}
                onPaginationChange={({ pageIndex, pageSize }) => {
                  handlePageChange(pageIndex, pageSize);
                  setIsLoading(true);
                }}
                onSearch={(val) => {
                  setSearch(val);
                  setPageIndex(1); // Reset to first page on search
                }}
                exportData={transactions}
                exportColumns={columns}
                fileName={`Wallet_Transactions_${userId}`}
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                        Transaction History
                      </h3>
                    </div>
                  </div>
                }
              />
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmTransaction}
        title="Confirm Wallet Transaction"
        description="Please review the transaction details before proceeding. This action cannot be undone."
        confirmText={isSubmitting ? "Processing..." : "Confirm Transaction"}
        cancelText="Cancel"
        isDestructive={formData.action === 'debit' || formData.action === 'hold'}
      >
        <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Wallet:</span>
            <span className="font-medium text-slate-900">{getWalletLabel(formData.walletType)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Action:</span>
            <span className={`font-medium ${getActionColor(formData.action)}`}>
              {getActionLabel(formData.action)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Amount:</span>
            <span className="font-bold text-slate-900">₹ {formData.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Reason:</span>
            <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">
              {formData.reason}
            </span>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}


export default WalletTab
