import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  User,
  Mail,
  Smartphone,
  Shield,
  Check,
  Loader2,
} from "@/components/icons";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { toast } from "sonner";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { usePost } from "../../../../hooks/usePost";
import { useFetch } from "../../../../hooks/useFetch";
import { emailRegex, formatEmailInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex, phoneRegex } from "../../../../utils/helperFunction";
import { Select } from "../../../../components/ui/select";

export default function AddUserPage() {
  const navigate = useNavigate();

  const [rolesOptions, setRolesOptions] = useState([]);
  const [packagesOptions, setPackagesOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    role: "",
    package: "",
  });

  // Add errors state
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.firstName?.trim())) {
      newErrors.firstName = "Please enter a valid name";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameWithSpaceRegex.test(formData.lastName?.trim())) {
      newErrors.lastName = "Please enter a valid name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile = "Invalid mobile number";
    }

    if (!formData.role) {
      newErrors.role = "Role selection is required";
    }

    if (!formData.package) {
      newErrors.package = "Package selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch Packages
  const { refetch: fetchPackages } = useFetch(
    `${apiEndpoints.fetchPackages}/${formData.role}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const packagesData = (data?.data || []).map((p) => ({
            label: p?.name || "Unknown",
            value: p?._id || null,
          }));
          setPackagesOptions(packagesData);
        }
      },
      onError: (error) => {
        console.error("Error fetching packages:", error);
        toast.error(handleValidationError(error) || "Failed to load packages");
      },
    },
    false
  );
  useEffect(() => {
    if (formData.role) {
      fetchPackages();
    }
  }, [formData.role]);

  // Fetch Roles
  useFetch(
    `${apiEndpoints.fetchRole}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const rolesData = (data?.data || []).map((r) => ({
            label: r?.name || r?.roleName || "Unknown",
            value: r?.id || r?._id,
          }));
          setRolesOptions(rolesData);
        }
      },
      onError: (error) => {
        console.error("Error fetching roles:", error);
        toast.error(handleValidationError(error) || "Failed to load roles");
      },
    },
    true
  );

  const { post: createUser } = usePost(apiEndpoints?.createUser, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "User created successfully");
        navigate("/users");
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Create user error:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.mobile,
      role: formData.role,
      package: formData.package,
    };

    createUser(payload);
  };

  // Clear error when user starts typing
  const handleInputChange = (field, value) => {
    if(field==="role"){
      setFormData({ ...formData, [field]: value ,package:""});

    }
    else{
      setFormData({ ...formData, [field]: value });
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };


  return (
    <PageLayout
      title="Create New User Account"
      subtitle="Register a new retailer, distributor or admin into the platform."
      showBackButton={true}
    >
      <div className="w-full">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-5 md:p-6 space-y-6">
              {/* Section 1: Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100/60">
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 uppercase tracking-wide">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="firstName"
                      className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      // required
                      placeholder="First Name"
                      className="h-9 md:h-10"
                      value={formData.firstName}
                      error={errors.firstName}
                      onChange={(e) => {

                        handleInputChange("firstName", formatNameInputWithSpace(e.target.value, 50));

                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="lastName"
                      className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      // required
                      placeholder="Last Name"
                      className="h-9 md:h-10"
                      value={formData.lastName}
                      error={errors.lastName}
                      onChange={(e) => {
                        handleInputChange("lastName", formatNameInputWithSpace(e.target.value, 50));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100/60">
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 uppercase tracking-wide">
                    Contact Channels
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1"
                    >
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-4.5 md:top-5 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold transition-colors group-focus-within:text-slate-900" />
                      <Input
                        id="email"

                        // required
                        placeholder="Email Address"
                        className="pl-10 h-9 md:h-10"
                        value={formData.email}
                        error={errors.email}
                        onChange={(e) => handleInputChange("email", formatEmailInput(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="mobile"
                      className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1"
                    >
                      Mobile Number
                    </Label>
                    <div className="relative group">
                      <Smartphone className="absolute left-3.5 top-4.5 md:top-5 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold transition-colors group-focus-within:text-slate-900" />
                      <Input
                        id="mobile"

                        // required
                        placeholder="Mobile Number"
                        className="pl-10 h-9 md:h-10"
                        value={formData.mobile}
                        error={errors.mobile}
                        onChange={(e) => {
                          handleInputChange("mobile", formatNumberInput(e.target.value, 10));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Access */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100/60">
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 uppercase tracking-wide">
                    Governance & Access
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Assign Role"
                    placeholder="Select Role"
                    value={formData.role}
                    error={errors.role}
                    onChange={(val) => handleInputChange("role", val)}
                    options={rolesOptions}
                  />

                  <Select
                    label="Select Package"
                    placeholder="Select Package"
                    value={formData.package}
                    error={errors.package}
                    onChange={(val) => handleInputChange("package", val)}
                    options={packagesOptions}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 md:px-6 py-4 bg-slate-50/30 border-t border-slate-100/60 flex items-center justify-end gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                type="button"
                className="h-9 md:h-10 px-6 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-[12px] font-bold transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 md:h-10 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center gap-2 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Create User Account
                    <Check className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
