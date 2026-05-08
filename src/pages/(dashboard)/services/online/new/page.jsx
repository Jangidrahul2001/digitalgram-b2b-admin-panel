import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { Globe, Check, ExternalLink, FileText, Image } from "@/components/icons";
import { PageLayout } from "../../../../../components/layouts/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { usePost } from "../../../../../hooks/usePost";
import { formatAlphaNumeric, handleValidationError, urlRegex } from "../../../../../utils/helperFunction";
import { toast } from "sonner";
import { apiEndpoints } from "../../../../../api/apiEndpoints";

export default function NewOnlineServicePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceUrl: "",
    onlineServiceImage: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { post: addOnlineService } = usePost(`${apiEndpoints.addOnlineService}`, {
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Service created successfully");
        navigate("/services/online");
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error("Failed to create service:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = "Service name is required";
    }

    if (!formData.serviceUrl.trim()) {
      newErrors.serviceUrl = "Platform URL is required";
    } else {

      if (!urlRegex.test(formData.serviceUrl)) {
        newErrors.serviceUrl = "Please enter a valid URL starting with http:// or https://";
      }
    }

    if (!formData.onlineServiceImage) {
      newErrors.onlineServiceImage = "Brand icon is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate image immediately
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 200 * 1024; // 200KB

      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, onlineServiceImage: "Only JPEG, JPG, and PNG files are allowed" });
        return;
      } else if (file.size > maxSize) {
        setErrors({ ...errors, onlineServiceImage: "Image size must be less than 200KB" });
        return;
      }

      // Clear any existing image errors
      setErrors({ ...errors, onlineServiceImage: "" });

      setFormData({ ...formData, onlineServiceImage: file });

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('serviceName', formData.serviceName);
    formDataToSend.append('serviceUrl', formData.serviceUrl);
    formDataToSend.append('onlineServiceImage', formData.onlineServiceImage);

    await addOnlineService(formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

  };

  return (
    <PageLayout
      title="Add New Online Service"
      subtitle="Create a new external link service platform."
      showBackButton={true}
      breadcrumbs={[
        { label: "Services", link: "/services/online" },
        { label: "New Online Service" }
      ]}
      className="max-w-[1600px] mx-auto"
    >
      <div className="space-y-6">
        <Card className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardHeader className="p-5 md:p-6 pb-2 md:pb-3 border-b border-slate-50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800 uppercase tracking-wide">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                <Globe className="w-4 h-4" />
              </div>
              Platform Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6 space-y-6">
            {/* First Row: Name and URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Service Name
                </label>

                <Input
                  placeholder="e.g. Amazon"
                  value={formData.serviceName}
                  onChange={(e) => {
                    setFormData({ ...formData, serviceName: formatAlphaNumeric(e.target.value) });
                    if (errors.serviceName) setErrors({ ...errors, serviceName: "" });
                  }}
                  error={errors.serviceName}

                />


              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Platform URL
                </label>

                <Input
                  placeholder="https://example.com"
                  value={formData.serviceUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, serviceUrl: e.target.value });
                    if (errors.serviceUrl) setErrors({ ...errors, serviceUrl: "" });
                  }}
                  error={errors.serviceUrl}

                />
              </div>

            </div>

            {/* Second Row: Brand Icon with Preview */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                Brand Icon <span className="text-slate-300">(Max 200KB, JPEG/JPG/PNG only)</span>
              </label>

              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all ${errors.onlineServiceImage ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                {/* Upload Area */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors">
                    <Image className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {formData.onlineServiceImage ? "Change Image" : "Upload Brand Icon"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpeg,.jpg,.png"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">{formData.onlineServiceImage.name}</p>
                      <p className="text-xs text-slate-500">
                        {(formData.onlineServiceImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <img
                        src={imagePreview}
                        alt="Brand icon preview"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {errors.onlineServiceImage && <p className="text-red-500 text-xs ml-1">{errors.onlineServiceImage}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Global Actions */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="bg-white border-slate-200 text-slate-500 hover:bg-slate-50 px-10 h-9 md:h-10 rounded-xl font-extrabold text-[11px] uppercase tracking-widest w-full md:w-auto"
          >
            Discard
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-slate-950 hover:bg-slate-900 text-white px-10 h-9 md:h-10 rounded-xl font-bold shadow-lg shadow-slate-950/10 active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? "Adding..." : "Save Service"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
