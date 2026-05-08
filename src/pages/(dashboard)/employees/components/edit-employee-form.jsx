import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { X, Edit, User, Mail, Smartphone, ShieldCheck, Check, Save } from "lucide-react";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { emailRegex, formatEmailInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex, phoneRegex } from "../../../../utils/helperFunction";
import { useFetch } from "../../../../hooks/useFetch";
import { usePut } from "../../../../hooks/usePut";
import { toast } from "sonner";

export function EditEmployeeForm({ employeeId, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modulePermissions, setModulePermission] = useState([]);

  const { refetch: fetchPermissions } = useFetch(
    `${apiEndpoints.permissionList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setModulePermission(data.data);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch permissions",
        );
      },
    },
    false,
  );

  const { refetch: fetchEmployee } = useFetch(
    `${apiEndpoints.fetchEmployeeById}/${employeeId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const emp = data.data;
          setFormData({
            name: emp.name || "",
            email: emp.email || "",
            phone: emp.phone || "",
            permissions: emp.permissionIds || [],
          });
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch employee");
        setIsLoading(false);
      },
    },
    false,
  );

  const { put: updateEmployee } = usePut(apiEndpoints.updateEmployee, {
    onSuccess: () => {
      toast.success("Employee updated successfully");
      setIsEditMode(false);
      onClose();
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update employee");
    },
  });

  useEffect(() => {
    if (isOpen && employeeId) {
      setIsLoading(true);
      setIsEditMode(false);
      fetchPermissions();
      fetchEmployee();
    }
  }, [isOpen, employeeId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (field, value) => {
    if (!isEditMode) return;

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permId) => {
    if (!isEditMode) return;
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleAssignAll = (checked) => {
    if (!isEditMode) return;
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? modulePermissions.map((p) => p._id) : [],
    }));
  };

  const validate = () => {
    const newErrors = {};


    if (!formData.name.trim()) newErrors.name = "Required";
    else if (!nameWithSpaceRegex.test(formData.name?.trim())) {
      newErrors.name = "Enter a valid name";
    }
    if (!formData.email.trim()) newErrors.email = "Required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid format";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "10 digits required";
    if (formData.permissions.length === 0)
      newErrors.permissions = "Select at least one";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await updateEmployee(employeeId, formData);
  };

  if (!isOpen) return null;

  const allAssigned = modulePermissions.length > 0 && formData.permissions.length === modulePermissions.length;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-[95%] lg:max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
          >
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-3 border-slate-900 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-white">
                  <div className="flex items-center gap-4">
                    <User size={20} className="text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Edit Employee Identity
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isEditMode && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(true)}
                        className="rounded-xl border-slate-200 text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs uppercase px-6 h-10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Enter Edit Mode
                      </Button>
                    )}
                    <button
                      onClick={onClose}
                      className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1 tracking-tight">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <Input
                          placeholder="Name"
                          value={formData.name}
                          error={errors.name}
                          onChange={(e) => handleChange("name", formatNameInputWithSpace(e.target.value, 60))}
                          className={`bg-white h-9 md:h-10 pl-10 border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-bold text-slate-800 disabled:opacity-60 disabled:bg-slate-50 disabled:border-transparent placeholder:font-normal ${errors.name ? "border-rose-300" : ""}`}
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1 tracking-tight">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <Input
                          placeholder="email@work.com"
                        
                          value={formData.email}
                          error={errors.email}
                          onChange={(e) => handleChange("email", formatEmailInput(e.target.value))}
                          className={`bg-white h-9 md:h-10 pl-10 border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-bold text-slate-800 disabled:opacity-60 disabled:bg-slate-50 disabled:border-transparent placeholder:font-normal ${errors.email ? "border-rose-300" : ""}`}
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1 tracking-tight">Active Contact</Label>
                      <div className="relative group">
                        <Smartphone className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <Input
                          placeholder="Primary contact"
                          value={formData.phone}
                          error={errors.phone}
                          onChange={(e) => handleChange("phone", formatNumberInput(e.target.value, 10))}
                          className={`bg-white h-9 md:h-10 pl-10 border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-bold text-slate-800 disabled:opacity-60 disabled:bg-slate-50 disabled:border-transparent placeholder:font-normal ${errors.phone ? "border-rose-300" : ""}`}
                          maxLength={10}
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-slate-900" />
                        <span className="text-sm font-bold text-slate-900">
                          Employee Permissions
                        </span>
                      </div>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleAssignAll(!allAssigned)}
                          className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-all ${allAssigned ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                        >
                          {allAssigned ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl max-h-96 overflow-y-auto custom-scrollbar">
                      {modulePermissions.map((perm) => {
                        const isSelected = formData.permissions.includes(perm._id);
                        return (
                          <motion.div
                            key={perm._id}
                            whileHover={isEditMode ? { y: -1 } : {}}
                            className={`relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all select-none ${isEditMode ? "cursor-pointer" : "cursor-default opacity-80 hover:opacity-100"} ${isSelected ? "bg-white border-slate-300 shadow-sm" : "bg-white border-transparent"}`}
                            onClick={() => togglePermission(perm._id)}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-transparent"}`}>
                                <Check size={10} strokeWidth={4} />
                              </div>
                              <span className={`text-[13px] font-bold tracking-tight truncate ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                                {perm.name.replace(/_/g, " ")}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-900 h-10 px-8 rounded-xl font-bold text-sm transition-all"
                        onClick={() => setIsEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-10 rounded-xl shadow-lg shadow-slate-900/20 transition-all font-bold text-sm flex items-center gap-2"
                      >
                        <Save size={18} />
                        Update user
                      </Button>
                    </div>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
