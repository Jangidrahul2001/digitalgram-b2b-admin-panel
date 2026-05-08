"use client";
import React, { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Select } from "../../../../../components/ui/select";
import { Link } from "react-router-dom";
import { PageLayout } from "../../../../../components/layouts/page-layout";
import { PageTransition } from "../../../../../components/ui/page-transition";
import { ConfirmationModal } from "../../../../../components/modals/confirmation-modal";
import { apiEndpoints } from "../../../../../api/apiEndpoints";
import { useFetch } from "../../../../../hooks/useFetch";
import { usePatch } from "../../../../../hooks/usePatch";
import { toast } from "sonner";
import { formatNumberInput, handleValidationError, InputSlice } from "../../../../../utils/helperFunction";
import { fetchAdminWallet } from "../../../../../store/slices/walletSlice";
import { useDispatch } from "react-redux";

export default function CreditDebitPage() {
  const [formData, setFormData] = useState({
    selectedUser: "",
    mainWallet: "",
    aepsWallet: "",
    mainWalletHold: "",
    aepsWalletHold: "",
    selectedWallet: "",
    type: "",
    amount: "",
    reason: "",
  });
  const [userList, setUserList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const {
    data,
    error,
    refetch: refetchUserList,
  } = useFetch(
    `${apiEndpoints?.fetchAllUserWithoutPagination}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data?.data?.map((user) => {
            return {
              ...user,
              label: user.fullName || user.name,
              value: user._id,
            };
          });
          setUserList(temp);
        }
      },
      onError: (error) => {
        console.error("Error fetching initial data:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { patch: debitCreditAmount } = usePatch({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response?.message || "Action completed successfully");
        setFormData({
          selectedUser: "",
          mainWallet: "",
          aepsWallet: "",
          mainWalletHold: "",
          aepsWalletHold: "",
          selectedWallet: "",
          type: "",
          amount: "",
          reason: "",
        });
        setErrors({});
        refetchUserList();
        dispatch(fetchAdminWallet());
      }
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    },
  });

  const handleUserChange = (value) => {
    const selectedUser = userList.find((user) => user.value === value);
    if (selectedUser) {
      setFormData({
        ...formData,
        selectedUser: value,
        mainWallet: selectedUser?.mainWallet,
        aepsWallet: selectedUser?.aepsWallet,
        mainWalletHold: selectedUser?.mainHold,
        aepsWalletHold: selectedUser?.aepsHold,
      });
    }
  };

  const walletOptions = [
    { value: "main", label: "Main Wallet" },
    { value: "aeps", label: "AEPS Wallet" },
  ];

  const getActionOptions = () => {
    if (formData.selectedWallet === "aeps") {
      return [{ value: "debit", label: "Debit" }];
    }
    return [
      { value: "debit", label: "Debit" },
      { value: "credit", label: "Credit" },
    ];
  };



  const validateForm = () => {
    const newErrors = {};
    if (!formData.selectedUser) newErrors.selectedUser = "User is required";
    if (!formData.selectedWallet)
      newErrors.selectedWallet = "Wallet type is required";
    if (!formData.type) newErrors.type = "Action is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.reason) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    const payload = {
      userId: formData.selectedUser,
      walletType: formData.selectedWallet,
      type: formData.type,
      amount: formData.amount,
      reason: formData.reason,
    };

    debitCreditAmount(apiEndpoints?.debitCreditAmount, payload);
  };

  return (
    <PageTransition>
      <PageLayout
        title="Credit or Debit Amount"
        subtitle="Perform manual credit or debit operations on user wallets."
        showBackButton={true}
      >
        <div className="w-full">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 space-y-6">
              {/* Row 1: User Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Select
                    options={userList}
                    value={formData.selectedUser}
                    onChange={handleUserChange}
                    placeholder="Search and select user"
                    label="Target User"
                  />
                  {errors.selectedUser && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">
                      {errors.selectedUser}
                    </p>
                  )}
                </div>

                {formData.selectedUser && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                        Main Balance
                      </label>
                      <Input
                        type="text"
                        value={`₹ ${formData.mainWallet}`}
                        className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold text-slate-900"
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                        AEPS Balance
                      </label>
                      <Input
                        type="text"
                        value={`₹ ${formData.aepsWallet}`}
                        className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold text-slate-900"
                        readOnly
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Row 2: Stats Display */}
              {formData.selectedUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Main Wallet Hold</span>
                    <span className="text-sm font-bold text-rose-600">₹ {formData.mainWalletHold}</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AEPS Wallet Hold</span>
                    <span className="text-sm font-bold text-rose-600">₹ {formData.aepsWalletHold}</span>
                  </div>
                </div>
              )}

              {/* Row 3: Action fields */}
              {formData.selectedUser && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Select
                      options={walletOptions}
                      value={formData.selectedWallet}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          selectedWallet: value,
                          type: "",
                        });
                      }}
                      placeholder="Select Wallet"
                      label="Wallet Type"
                    />
                    {errors.selectedWallet && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">
                        {errors.selectedWallet}
                      </p>
                    )}
                  </div>
                  <div>
                    <Select
                      options={getActionOptions()}
                      value={formData.type}
                      onChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                      placeholder="Select Action"
                      label="Action Type"
                    />
                    {errors.type && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">{errors.type}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                      Transaction Amount
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: formatNumberInput(e.target.value, 8) })}
                      className="h-11 bg-white border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all rounded-xl font-bold text-slate-900"
                    />
                    {errors.amount && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">{errors.amount}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Row 4: Reason */}
              {formData.selectedUser && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Internal Reason / Remarks
                  </label>
                  <textarea
                    placeholder="Explain why this manual adjustment is being made..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: InputSlice(e.target.value, 200) })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                    rows={3}
                  />
                  {errors.reason && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">{errors.reason}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {formData.selectedUser && (
              <div className="px-5 md:px-6 py-4 bg-slate-50/50 border-t border-slate-100/60 flex items-center justify-end gap-3">
                <Link to="/wallet/system">
                  <Button
                    variant="ghost"
                    className="h-10 px-6 rounded-xl text-slate-500 hover:text-slate-900 font-bold text-[12px] transition-all"
                  >
                    Discard
                  </Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-10 rounded-xl font-bold text-[12px] shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? "Processing Transaction..." : "Submit Transaction"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          title="Confirm Wallet Adjustment"
          description={`You are about to ${formData.type} ₹${formData.amount} in the ${formData.selectedWallet === "main" ? "Main Wallet" : "AEPS Wallet"} for the selected user. This action will be logged.`}
          confirmText={isSubmitting ? "Processing..." : "Confirm & Proceed"}
          cancelText="Cancel"
        />
      </PageLayout>
    </PageTransition>
  );
}
