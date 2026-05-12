import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Select } from "../../../../components/ui/select";
import { Trash2, Plus } from "@/components/icons";
import { getBanks } from "indian-bank-ifsc";
import { usePost } from "../../../../hooks/usePost";
import { toast } from "sonner";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { usePatch } from "../../../../hooks/usePatch";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { useDelete } from "../../../../hooks/useDelete";
import { formatIfscInput, formatNameInputWithSpace, formatNumberInput, formatUpiInput, handleValidationError, ifscRegex } from "../../../../utils/helperFunction";
import { DataTable } from "../../../../components/tables/data-table";
import ClickToCopy from "../../../../components/ui/ClickToCopy";

const StatusBadge = ({ row, refetchBankTopupList }) => {
  const id = row._id;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { patch: updateBankTopupStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        refetchBankTopupList();
        setIsModalOpen(false);
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleConfirm = () => {
    updateBankTopupStatus(`${apiEndpoints?.updateBankTopupStatus}/${id}`, {});
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${row?.isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-slate-50 text-slate-400 border border-slate-100"
          }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${row?.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
        {row?.isActive ? "Active" : "Inactive"}
      </motion.button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={row?.isActive ? "Deactivate Bank?" : "Activate Bank?"}
        description={
          row?.isActive
            ? "Are you sure you want to deactivate this bank account?"
            : "Are you sure you want to activate this bank account?"
        }
        confirmText={row?.isActive ? "Deactivate" : "Activate"}
        isDestructive={row?.isActive}
      />
    </>
  );
};

export function WalletTopupBankTab() {
  const [selectedId, setSelectedId] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [topUpBankList, setTopUpBankList] = useState([]);
  const [qrPreview, setQrPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    qrCode: null,
    upiId: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
  });

  const { post: addBankTopUp } = usePost(`${apiEndpoints.addBankTopup}`, {
    onSuccess: () => {
      toast.success("Bank account added successfully");
      setFormData({
        qrCode: null,
        upiId: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        accountHolderName: "",
      });
      setQrPreview(null);
      setErrors({});
      refetchBankTopupList();
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  useEffect(() => {
    const banks = getBanks();
    if (banks.length > 0) {
      const temp = banks.map((bank) => ({
        label: bank.name,
        value: bank.name,
      }));
      setBankList(temp);
    }
  }, []);

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, qrCode: "Only PNG, JPEG, JPG formats allowed" }));
        return;
      }

      // Validate file size (200KB = 200 * 1024 bytes)
      if (file.size > 200 * 1024) {
        setErrors(prev => ({ ...prev, qrCode: "File size must be less than 200KB" }));
        return;
      }

      // Clear errors if validation passes
      setErrors(prev => ({ ...prev, qrCode: null }));

      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, qrCode: file });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.qrCode) {
      newErrors.qrCode = "QR Code is required";
    }

    if (!formData.accountNumber) newErrors.accountNumber = "Account number is required";
    if (!formData.ifscCode) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC";
    }
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.accountHolderName) newErrors.accountHolderName = "Account holder name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    addBankTopUp(data, { headers: { "Content-Type": "multipart/form-data" } });
  };

  const { refetch: refetchBankTopupList } = useFetch(
    `${apiEndpoints?.fetchAllBankTopup}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setTopUpBankList(data?.data);
          setIsLoading(false);
        }
      },
      onError: () => setIsLoading(false),
    },
    true
  );

  const { remove: deleteBankTopup } = useDelete(
    `${apiEndpoints?.deleteTopUpBank}/${selectedId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Bank account deleted successfully");
          setDeleteModal(false);
          setSelectedId("");
          refetchBankTopupList();
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    }
  );

  const columns = useMemo(() => [
    {
      id: "index",
      header: "SR.NO.",
      cell: ({ row, index }) => (
        <div className="flex items-center justify-center">
          <span className="h-6 min-w-[24px] px-1.5 flex items-center justify-center font-bold text-[10px] text-slate-500 bg-slate-100 rounded-md border border-slate-200/50">
            {index + 1}
          </span>
        </div>
      )
    },
    {
      accessorKey: "accountNumber",
      header: "Account Details",
      cell: ({ row }) => (
        <div className="flex flex-col justify-center items-center gap-0.5">
          <span className="font-bold text-slate-900 text-[13px] tracking-tight">{row.getValue("accountNumber")}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono bg-slate-50 px-1 rounded shadow-inner-sm">
              {row.original.ifscCode}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold text-slate-700 text-[13px]">{row.getValue("bankName")}</span>
        </div>
      )
    },
    {
      accessorKey: "accountHolderName",
      header: "Account Holder",
      cell: ({ row }) => (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="font-bold text-slate-800 text-[13px]">{row.getValue("accountHolderName")}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {row.original.upiId ? (
              <ClickToCopy text={row.original.upiId}>
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50/50 text-indigo-600 rounded-md border border-indigo-100/50">
                  {row.original.upiId}
                </span>
              </ClickToCopy>
            ) : (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100 italic">
                No UPI ID
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <StatusBadge row={row.original} refetchBankTopupList={refetchBankTopupList} />
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedId(row.original._id);
              setDeleteModal(true);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 border border-rose-100"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )
    }
  ], [refetchBankTopupList]);

  return (
    <>
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={deleteBankTopup}
        title="Delete Bank Account"
        description="Are you sure you want to delete this bank? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      <div className="flex flex-col gap-10">
        <Card className="border border-slate-200/60 shadow-sm bg-white rounded-[2rem] overflow-hidden transition-all duration-300 ">
          <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-6 py-5">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shadow-slate-900/10">
                <Plus className="h-4 w-4" />
              </div>
              Add New Bank Account
            </CardTitle>  
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-3 flex flex-col gap-4">
                <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">QR Code Identity *</Label>
                <div className={`aspect-square w-full max-w-[180px] mx-auto md:mx-0 flex items-center justify-center bg-slate-50 border-2 border-dashed rounded-[1.5rem] overflow-hidden p-3 group transition-all duration-300 hover:border-slate-400 hover:bg-white relative ${errors.qrCode ? "border-rose-300 bg-rose-50/30" : "border-slate-200"
                  }`}>
                  {qrPreview ? (
                    <img
                      src={qrPreview}
                      alt="QR Preview"
                      className="w-full h-full object-contain rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-slate-600">
                      <Plus className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload QR</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleQrChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-medium text-center md:text-left px-1">
                  PNG, JPG, JPEG only. Max 200KB.
                </div>
                {errors.qrCode && (
                  <div className="text-[10px] text-rose-500 font-medium text-center md:text-left px-1">
                    {errors.qrCode}
                  </div>
                )}
              </div>

              <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Account Number</Label>
                  <Input
                    error={errors.accountNumber}
                    placeholder="Enter digits"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: formatNumberInput(e.target.value, 20) })}
                    className={`bg-slate-50/50 h-10 border-slate-200 rounded-xl focus:bg-white focus:ring-slate-900/5 transition-all text-sm font-bold placeholder:font-normal ${errors.accountNumber ? "border-rose-300 bg-rose-50/30" : ""}`}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">IFSC Code</Label>
                  <Input
                    error={errors.ifscCode}
                    placeholder="IFSC Code"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: formatIfscInput(e.target.value.toUpperCase()) })}
                    className={`bg-slate-50/50 h-10 border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-slate-900/5 transition-all text-sm font-bold placeholder:font-normal uppercase ${errors.ifscCode ? "border-rose-300 bg-rose-50/30" : ""}`}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Banking Institution</Label>
                  <Select
                    error={errors.bankName}
                    placeholder="Search Bank"
                    options={bankList}
                    value={formData.bankName}
                    onChange={(value) => setFormData({ ...formData, bankName: value })}
                    className={`w-full h-10 rounded-xl border-slate-200 ${errors.bankName ? "border-rose-300" : ""}`}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Account Holder Name</Label>
                  <Input
                    error={errors.accountHolderName}
                    placeholder="As per passbook"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: formatNameInputWithSpace(e.target.value, 50) })}
                    className={`bg-slate-50/50 h-10 border-slate-200 rounded-xl focus:bg-white focus:ring-slate-900/5 transition-all text-sm font-bold placeholder:font-normal ${errors.accountHolderName ? "border-rose-300 bg-rose-50/30" : ""}`}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2.5">
                  <Label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">UPI ID (Transfer Medium)</Label>
                  <Input
                    error={errors.upiId}
                    placeholder="e.g. name@upi"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: formatUpiInput(e.target.value) })}
                    className="bg-slate-50/50 h-10 border-slate-200 rounded-xl focus:bg-white focus:ring-slate-900/5 transition-all text-sm font-bold placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 pt-8 border-t border-slate-100/80">
              <Button
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 h-12 px-12 rounded-xl font-bold  active:scale-95 transition-all flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                Add Bank Account
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setFormData({ qrCode: null, upiId: "", accountNumber: "", ifscCode: "", bankName: "", accountHolderName: "" });
                  setQrPreview(null);
                  setErrors({});
                }}
                className="w-full sm:w-auto text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold transition-all"
              >
                Reset Fields
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-slate-900 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Registered Banks</h2>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={topUpBankList}
            isLoading={isLoading}
            onSearch={(query) => console.log("Search:", query)}
            fileName="Wallet_Topup_Banks"
            exportData={topUpBankList}
          />
        </div>
      </div>
    </>
  );
}
