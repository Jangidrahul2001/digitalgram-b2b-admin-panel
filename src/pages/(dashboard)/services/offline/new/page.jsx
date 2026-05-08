import { toast } from "sonner";
import { useState } from "react";
import { Check, Settings, ClipboardList } from "@/components/icons";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { cn } from "../../../../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetch } from "../../../../../hooks/useFetch";
import { usePost } from "../../../../../hooks/usePost";
import { usePut } from "../../../../../hooks/usePut";
import { apiEndpoints } from "../../../../../api/apiEndpoints";
import { PageLayout } from "../../../../../components/layouts/page-layout";
import { handleValidationError } from "../../../../../utils/helperFunction";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";

export default function NewOfflineServicePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const action = state?.action || "add";
  const serviceId = state?.action === "edit" ? state._id : null;
  const isEditMode = action === "edit" && serviceId;

  const [fieldOptions, setFieldOptions] = useState([]);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [formData, setFormData] = useState({
    serviceName: "",
    amount: "",
    image: null,
    description: "",
    requiredDocuments: [],
    requiredFields: [],
  });
  const [serviceImageUrl, setServiceImageUrl] = useState(null);

  useFetch(
    `${apiEndpoints.fetchOfflineServiceById}/${serviceId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const service = data.data;
          setFormData({
            serviceName: service.serviceName || "",
            amount: service.amount || "",
            image: null,
            description: service.description || "",
            requiredDocuments:
              service.requiredDocuments?.map((d) => d._id) || [],
            requiredFields: service.requiredFields?.map((f) => f._id) || [],
          });
          setServiceImageUrl(service.serviceImageUrl);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch service data",
        );
      },
    },
    isEditMode,
  );

  useFetch(
    `${apiEndpoints.fetchFieldOptionsForOfflineService}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setFieldOptions([{ label: "Select All" }, ...data.data]);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch field Options",
        );
      },
    },
    true,
  );

  useFetch(
    `${apiEndpoints.fetchDocumentOptionsForOfflineService}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setDocumentOptions([{ label: "Select All" }, ...data.data]);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch document Options",
        );
      },
    },
    true,
  );

  const { post: createOfflineService, loading: createLoading } = usePost(
    `${apiEndpoints.createOfflineServiceData}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Service created successfully!");
          navigate("/services/offline");
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to create service");
      },
    },
  );

  const { put: updateOfflineService, error: updateError } = usePut(
    apiEndpoints.updateOfflineService,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Service updated successfully!");
          navigate(-1);
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to update service");
      },
    },
  );

  const handleCheckboxChange = (type, optionId) => {
    setFormData((prev) => {
      const list = prev[type];
      if (optionId === "Select All") {
        const allOptions =
          type === "requiredDocuments" ? documentOptions : fieldOptions;
        const allIds = allOptions
          .filter((o) => o.label !== "Select All")
          .map((o) => o._id);
        const isAllSelected = allIds.every((id) => list.includes(id));
        return { ...prev, [type]: isAllSelected ? [] : allIds };
      }
      const updated = list.includes(optionId)
        ? list.filter((item) => item !== optionId)
        : [...list, optionId];
      return { ...prev, [type]: updated };
    });
  };

  const isChecked = (type, optionId) => {
    if (optionId === "Select All") {
      const allOptions =
        type === "requiredDocuments" ? documentOptions : fieldOptions;
      const allIds = allOptions
        .filter((o) => o.label !== "Select All")
        .map((o) => o._id);
      return (
        allIds.length > 0 && allIds.every((id) => formData[type].includes(id))
      );
    }
    return formData[type].includes(optionId);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      toast.error("Service name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!isEditMode && !formData.image) {
      toast.error("Service image is required");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Valid service amount is required");
      return false;
    }
    if (
      formData.requiredDocuments.length === 0 &&
      formData.requiredFields.length === 0
    ) {
      toast.error("Please select at least one document or field");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = new FormData();
    payload.append("serviceName", formData.serviceName);
    payload.append("description", formData.description);
    payload.append("amount", formData.amount);
    if (formData.image) {
      payload.append("offlineServiceImage", formData.image);
    }
    payload.append(
      "requiredDocuments",
      JSON.stringify(formData.requiredDocuments),
    );
    payload.append("requiredFields", JSON.stringify(formData.requiredFields));

    if (isEditMode) {
      await updateOfflineService(serviceId, payload);
    } else {
      createOfflineService(payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  };

  const loading = createLoading;

  return (
    <PageLayout
      title={isEditMode ? "Edit Offline Service" : "Add New Service"}
      subtitle={isEditMode ? "Update the service details and requirements." : "Fill in the details to create a new service offering."}
      showBackButton={true}
      className="max-w-[1600px] mx-auto"
    >
      <div className="space-y-6">
        <Card className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm">
          <CardHeader className="p-5 md:p-6 pb-2 md:pb-3 border-b border-slate-50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800 uppercase tracking-wider">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-500 border border-orange-100">
                <Settings className="w-4 h-4" />
              </div>
              Service Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. ITR Return"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                  className="h-9 md:h-10 border-slate-200 focus:border-slate-900  rounded-xl bg-slate-50 focus:bg-white transition-all font-semibold text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Service Amount (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="h-9 md:h-10 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-all font-bold text-[13px] text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Service Image <span className="text-red-500">*</span>
                </label>
                <div className="flex h-9 md:h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-900/40">
                  <label className="flex h-full cursor-pointer items-center justify-center bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-colors">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <div className="flex-1 px-3 text-[12px] font-medium text-slate-500 ">
                    {formData.image
                      ? formData.image.name
                      : serviceImageUrl
                        ? "Existing image"
                        : "No file selected"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Provide a detailed description of this offline service..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[140px] pt-3 leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>


        {/* Card 2: Requirements */}
        <Card className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm">
          <CardHeader className="p-5 md:p-6 pb-2 md:pb-3 border-b border-slate-50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800 uppercase tracking-wider">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                <ClipboardList className="w-4 h-4" />
              </div>
              Client Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Documents Required
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {documentOptions.map((option) => (
                    <label
                      key={option._id || option.label}
                      className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-lg transition-all border border-transparent hover:bg-slate-50"
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200",
                          isChecked(
                            "requiredDocuments",
                            option._id || option.label,
                          )
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400",
                        )}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked(
                          "requiredDocuments",
                          option._id || option.label,
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            "requiredDocuments",
                            option._id || option.label,
                          )
                        }
                      />
                      <span className={cn(
                        "text-[13px] font-medium transition-colors ",
                        isChecked("requiredDocuments", option._id || option.label) ? "text-slate-900" : "text-slate-500"
                      )}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Data Fields Required
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {fieldOptions.map((option) => (
                    <label
                      key={option._id || option.label}
                      className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-lg transition-all border border-transparent hover:bg-slate-50"
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200",
                          isChecked(
                            "requiredFields",
                            option._id || option.label,
                          )
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400",
                        )}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked(
                          "requiredFields",
                          option._id || option.label,
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            "requiredFields",
                            option._id || option.label,
                          )
                        }
                      />
                      <span className={cn(
                        "text-[13px] font-medium transition-colors ",
                        isChecked("requiredFields", option._id || option.label) ? "text-slate-900" : "text-slate-500"
                      )}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions Card */}
      <div className="mt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-white border-slate-200 text-slate-500 hover:bg-slate-50 px-10 h-9 md:h-10 rounded-xl font-extrabold text-[11px] uppercase tracking-widest w-full md:w-auto"
        >
          Discard
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-950 hover:bg-slate-900 text-white px-10 h-9 md:h-10 rounded-xl font-bold active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest w-full md:w-auto"
        >
          {loading ? "Processing..." : isEditMode ? "Update Service" : "Save Service"}
        </Button>
      </div>
    </PageLayout>
  );
}
