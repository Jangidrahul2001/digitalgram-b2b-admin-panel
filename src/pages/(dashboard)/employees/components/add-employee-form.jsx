import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { emailRegex, formatEmailInput,  formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex, phoneRegex } from "../../../../utils/helperFunction";
import { useFetch } from "../../../../hooks/useFetch";
import { usePost } from "../../../../hooks/usePost";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Smartphone, ShieldCheck, Check, LayoutGrid, Users } from "lucide-react";

export function AddEmployeeForm({ onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [modulePermissions, setModulePermission] = useState([]);

  const { refetch: fetchPermissions } = useFetch(
    `${apiEndpoints.permissionList}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setModulePermission(data?.data);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching permissions:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  const { post: addEmployee } = usePost(apiEndpoints.addEmployee, {
    onSuccess: (res) => {
      toast.success("Employee added successfully");
      setFormData({ name: "", email: "", phone: "", permissions: [] });
      setErrors({});
      onCancel?.();
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to add employee");
    },
  });

  const handleChange = (field, value) => {
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleAssignAll = (checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? modulePermissions.map((p) => p._id) : [],
    }));
  };

  const validate = () => {
    const newErrors = {};
   
  

    if (!formData.name.trim()) newErrors.name = "Required";
     else if(!nameWithSpaceRegex.test(formData.name?.trim())){
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
    await addEmployee(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[200px] border border-slate-100 rounded-2xl bg-slate-50/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const allAssigned = modulePermissions.length > 0 && formData.permissions.length === modulePermissions.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <Card className="border border-slate-200/50 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 leading-none">
              Add New Employee
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                  <Input
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", formatNameInputWithSpace(e.target.value,60))}
                    error={errors.name}
                    className={`h-9 md:h-10 pl-10 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-semibold placeholder:font-normal ${errors.name ? "border-rose-300 ring-rose-50" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                  <Input
                    placeholder="example@work.com"
             
                    value={formData.email}
                    error={errors.email}
                    onChange={(e) => handleChange("email", formatEmailInput(e.target.value))}
                    className={`h-9 md:h-10 pl-10 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-semibold placeholder:font-normal ${errors.email ? "border-rose-300 ring-rose-50" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Mobile Number</Label>
                <div className="relative group">
                  <Smartphone className="absolute left-3 top-4.5 md:top-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                  <Input
                    placeholder="10 digit number"
                    value={formData.phone}
                    error={errors.phone}
                    onChange={(e) => handleChange("phone", formatNumberInput(e.target.value,10))}
                    maxLength={10}
                    className={`h-9 md:h-10 pl-10 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all text-[13px] font-semibold placeholder:font-normal ${errors.phone ? "border-rose-300 ring-rose-50" : ""}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-900" />
                  <span className="text-sm font-bold text-slate-900">Module Permissions</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAssignAll(!allAssigned)}
                  className={`text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-all ${allAssigned ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {allAssigned ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {modulePermissions.map((perm) => {
                  const isSelected = formData.permissions.includes(perm._id);
                  return (
                    <motion.div
                      key={perm._id}
                      whileHover={{ y: -1 }}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? "bg-white border-slate-300 shadow-sm" : "bg-white border-transparent hover:border-slate-200 opacity-70 hover:opacity-100"}`}
                      onClick={() => togglePermission(perm._id)}
                    >
                      <div className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-transparent"}`}>
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <span className={`text-[13px] font-bold tracking-tight truncate ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                        {perm.name.replace(/_/g, " ")}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              
              {errors.permissions && (
                <p className="text-[11px] font-medium text-rose-500 text-center">{errors.permissions}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 h-10 px-8 rounded-xl font-bold text-sm transition-all"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-10 rounded-xl shadow-lg shadow-slate-900/10 transition-all font-bold text-sm"
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
