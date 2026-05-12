import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BentoCard } from "../../../../components/ui/bento-card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  FileText, // Add this
  Package,
  Shield,
  XCircle,
} from "lucide-react";
import {
  dateSplitByT,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { KYCActionModal } from "../../../../components/modals/kyc-action-modal";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/ui/loading-screen";
import { usePatch } from "../../../../hooks/usePatch";
import { AnimatePresence, motion } from "framer-motion";
import ImageModal from "../../../../components/ui/ImageModal";

const InfoField = ({ label, value, fullWidth }) => (
  <div
    className={`bg-slate-50/50 p-2.5 px-4 rounded-2xl border border-slate-100/60 hover:border-slate-200 transition-colors ${fullWidth ? "col-span-full" : ""}`}
  >
    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-[13px] font-semibold text-slate-700 truncate tracking-tight">{value || "N/A"}</p>
  </div>
);

const DocPreview = ({ label, url, onView }) => {
  const [hasError, setHasError] = useState(false);
  const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;
  const isPdf = url?.toLowerCase().endsWith(".pdf");

  if (!url || hasError) {
    return (
      <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-3 flex flex-col items-center gap-2 bg-white transition-all cursor-pointer group">
        <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center border border-slate-100 italic text-slate-400">
          <FileText className="w-8 h-8 text-slate-200" />
        </div>
        <div className="w-full flex items-center justify-between px-1">
          <span className="text-[12px] font-bold text-slate-700">{label}</span>
          <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] font-bold rounded-lg border-slate-100" disabled>
            N/A
          </Button>
        </div>
      </div>
    );
  }

  const handleView = () => {
    if (!url) return;

    if (isPdf) {
      const filename = url.substring(url.lastIndexOf("/") + 1) || label;
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.title = filename;
        newWindow.document.body.style.margin = "0";
        newWindow.document.body.style.height = "100vh";


        const iframe = newWindow.document.createElement("iframe");
        iframe.src = fullUrl;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        newWindow.document.body.appendChild(iframe);

      }

    }
    else {
      onView(fullUrl);
    }
  };

  return (
    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-3 flex flex-col items-center gap-2 bg-white transition-all hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer group">
      <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-100">
        {isPdf ? (
          <iframe
            src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full"
            title={label}
            onError={() => setHasError(true)}
          />
        ) : (
          <img
            src={fullUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
      </div>
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-[12px] font-bold text-slate-700">{label}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-[11px] font-bold rounded-lg border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
          onClick={handleView}
        >
          View
        </Button>
      </div>
    </div>
  );
};
const KycTab = ({ userKyc, setUserKyc, onUpdate, onChangeTab }) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [updatingSection, setUpdatingSection] = useState({ name: "", status: "" });
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const navigate = useNavigate();
  const [showKyc, setShowKyc] = useState(false)
  const [updatingKycRequestStatus, setUpdatingKycRequestStatus] = useState(false);
  const handleView = (url) => {
    setSelectedImage(url)
    setImageModalOpen(true)
  }

  const { refetch: refetchKycDetails } = useFetch(
    `${apiEndpoints?.fetchKycByUserId}/${params.userId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setUserKyc(data.data);
          setShowKyc(true)
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching initial data:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true, // auto fetch on mount
  );

  const [sectionStatus, setSectionStatus] = useState(() => {
    const personalDetailStatus = userKyc?.personalDetailStatus || "pending";
    const businessDetailStatus = userKyc?.businessDetailStatus || "pending";
    const bankDetailStatus = userKyc?.bankDetailStatus || "pending";
    const identityDetailStatus = userKyc?.identityDetailStatus || "pending";
    return {
      personalDetailStatus: personalDetailStatus,
      businessDetailStatus: businessDetailStatus,
      bankDetailStatus: bankDetailStatus,
      identityDetailStatus: identityDetailStatus,
    };
  });

  useEffect(() => {
    const personalDetailStatus = userKyc?.personalDetailStatus;
    const businessDetailStatus = userKyc?.businessDetailStatus;
    const bankDetailStatus = userKyc?.bankDetailStatus;
    const identityDetailStatus = userKyc?.identityDetailStatus;
    setSectionStatus({
      personalDetailStatus: personalDetailStatus,
      businessDetailStatus: businessDetailStatus,
      bankDetailStatus: bankDetailStatus,
      identityDetailStatus: identityDetailStatus,
    });
  }, [userKyc]);

  const { patch: updateUserKycSection } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        setUpdatingSection({ name: "", status: "" });
        toast.success("Status updated successfully");
        refetchKycDetails();
      }
    },
    onError: (error) => {
      setUpdatingSection({ name: "", status: "" });
      console.error("Failed to update Status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const toggleSection = (section, status) => {
    setUpdatingSection(section)
    updateUserKycSection(
      `${apiEndpoints.updateKycSectionStatus}/${userKyc._id}`,
      {
        status,
        section,
      },
    );
  };

  const handleKycUpdate = (newStatus, reason) => {
    console.log(newStatus)
    setUpdatingKycRequestStatus(true)
    if (newStatus === "re-kyc") {
      updateUserKyc(`${apiEndpoints.requestReKyc}/${userKyc._id}`, {
        status: newStatus,
        reason: reason,
      });
    }
    else {
      updateUserKyc(`${apiEndpoints.updateKycRequest}/${userKyc._id}`, {
        status: newStatus,
        reason: reason,
      });
    }
  };

  const { patch: updateUserKyc } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "KYC Status updated successfully");
        refetchKycDetails();
        setUpdatingKycRequestStatus(false)
        if (data.data.kycStatus === "rekyc") {
          navigate(-1)
        }
        else {
          onChangeTab("services")
        }
      }
    },
    onError: (error) => {
      setUpdatingKycRequestStatus(false)
      console.error("Failed to update Kyc Status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  // Status Configuration
  const statusConfig = {
    approved: {
      icon: CheckCircle2,
      text: "Approved",
      bg: "bg-emerald-500",
      border: "border-emerald-200",
      textCol: "text-emerald-700",
      lightBg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    rejected: {
      icon: XCircle,
      text: "Rejected",
      bg: "bg-rose-500",
      border: "border-rose-200",
      textCol: "text-rose-700",
      lightBg: "bg-rose-50",
      ring: "ring-rose-100",
    },
    submitted: {
      icon: Clock,
      text: "Re-kyc",
      bg: "bg-amber-500",
      border: "border-amber-200",
      textCol: "text-amber-700",
      lightBg: "bg-amber-50",
      ring: "ring-amber-100",
    },
    rekyc: {
      icon: AlertCircle,
      text: "Re-kyc",
      bg: "bg-purple-500",
      border: "border-purple-200",
      textCol: "text-purple-700",
      lightBg: "bg-purple-50",
      ring: "ring-purple-100",
    },
    pending: {
      icon: Clock,
      text: "Pending",
      bg: "bg-amber-500",
      border: "border-amber-200",
      textCol: "text-amber-700",
      lightBg: "bg-amber-50",
      ring: "ring-amber-100",
    },
    active: {
      icon: CheckCircle2,
      text: "Active",
      bg: "bg-emerald-500",
      border: "border-emerald-200",
      textCol: "text-emerald-700",
      lightBg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    Inactive: {
      icon: XCircle,
      text: "Inactive",
      bg: "bg-rose-500",
      border: "border-rose-200",
      textCol: "text-rose-700",
      lightBg: "bg-rose-50",
      ring: "ring-rose-100",
    }
  };

  const currentKey = userKyc?.status?.toLowerCase();
  // console.log(currentKey, "ppppppp")
  const config = statusConfig[currentKey] || statusConfig.pending;
  const KycStatusIcon = config.icon;

  const userStatus = "active";
  const userStatusconfig = statusConfig[userStatus];
  const StatusIcon = userStatusconfig?.icon;

  // Calculate Derived Action for the Button
  const stats = Object.values(sectionStatus).reduce(
    (acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 },
  );

  let derivedAction = "pending";
  const totalSections = Object.keys(sectionStatus).length;

  if (stats.approved === totalSections && totalSections > 0) {
    derivedAction = "approved";
  } else if (stats.rejected >= 1 && stats.rejected <= 3) {
    derivedAction = "re-kyc";
  } else if (stats.rejected == 4) {
    derivedAction = "rejected";
  }

  // Action Button Config
  const actionButtonConfig = {
    approved: {
      text: "Approve KYC",
      classes: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
      icon: Shield,
    },

    "re-kyc": {
      text: "Request Re-KYC",
      classes: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
      icon: AlertCircle,
    },
    rejected: {
      text: "Reject KYC",
      classes: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
      icon: Shield,
    },
    pending: {
      text: "Save Changes",
      classes:
        "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 opacity-50 cursor-not-allowed",
      icon: Package,
    },
  }[derivedAction] || {
    text: "Update Status",
    classes: "bg-slate-900",
    icon: Package,
  };

  const isActionable = derivedAction !== "pending";

  const isApproved = userKyc?.status === "approved";

  const showControls = !isApproved && Object.keys(userKyc).length > 0;

  if (isLoading) return <LoadingScreen variant="page" message="Accessing KYC Data" />;
  if (updatingKycRequestStatus) return <LoadingScreen variant="page" message="Updating KYC Status" />;
  return (
    <div>
      <>
        <BentoCard className="p-0 flex flex-col h-full">
          <CardHeader className="flex flex-row justify-between items-center bg-slate-50/50 pb-6 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-tight">KYC Verification</CardTitle>
              <CardDescription className="text-slate-500 text-[13px] font-medium">
                Review personal evidence and identity verification documents.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`
                            flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-2xl
                            bg-white border transition-all duration-300 shadow-sm
                            ${config?.border}
                        `}
              >
                <div
                  className={`
                                h-7 w-7 rounded-full flex items-center justify-center
                                ${config?.lightBg} ${config?.textCol}
                            `}
                >
                  <KycStatusIcon className="w-3.5 h-3.5" />
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">
                    Kyc Status
                  </span>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wide ${config?.textCol}`}
                  >
                    {config?.text}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          {

            showKyc &&
            <CardContent className="p-8 space-y-8 flex-1">
              {/* Personal Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Personal Information
                  </h3>
                  {showControls && sectionStatus.personalDetailStatus !== "approved" && (
                    <StatusToggle
                      section="personalDetailStatus"
                      currentStatus={sectionStatus.personalDetailStatus}
                      updatingSection={updatingSection}
                      onToggle={toggleSection}
                    />
                  )}
                  {showControls && sectionStatus.personalDetailStatus == "approved" && (
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5 ">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        APPROVED
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="First Name" value={userKyc?.firstName} />
                  <InfoField label="Last Name" value={userKyc?.lastName} />
                  <InfoField label="Email" value={userKyc?.email} />
                  <InfoField label="Mobile" value={userKyc?.phone} />
                  <InfoField
                    label="Date of Birth"
                    value={dateSplitByT(userKyc?.dob)}
                  />
                  <InfoField label="Father Name" value={userKyc?.fatherName} />
                  <InfoField
                    label="State"
                    value={userKyc?.personalAddress?.state}
                  />
                  <InfoField
                    label="City"
                    value={userKyc?.personalAddress?.city}
                  />
                  <InfoField
                    label="PIN Code"
                    value={userKyc?.personalAddress?.pincode}
                  />
                  <InfoField
                    label="Address"
                    value={userKyc?.personalAddress?.address}
                    fullWidth
                  />
                </div>
              </div>

              {/* Business Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Business Information
                  </h3>
                  {showControls && sectionStatus.businessDetailStatus !== "approved" && (
                    <StatusToggle
                      section="businessDetailStatus"
                      currentStatus={sectionStatus.businessDetailStatus}
                      updatingSection={updatingSection}
                      onToggle={toggleSection}
                    />
                  )}
                  {showControls && sectionStatus.businessDetailStatus == "approved" && (
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5 ">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        APPROVED
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Company Name" value={userKyc?.shopName} />
                  <InfoField
                    label="Business Pan No."
                    value={userKyc?.businessPanNumber}
                  />
                  <InfoField label="GST No" value={userKyc?.gstNumber} />
                  {/* <InfoField label="Company Type" value={user.companyType} /> */}
                  <InfoField
                    label="State"
                    value={userKyc?.businessAddress?.state}
                  />
                  <InfoField
                    label="City"
                    value={userKyc?.businessAddress?.city}
                  />
                  <InfoField
                    label="PIN Code"
                    value={userKyc?.businessAddress?.pincode}
                  />
                  <InfoField
                    label="Address"
                    value={userKyc?.businessAddress?.address}
                    fullWidth
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    Shop / Workplace Image
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DocPreview
                      label="Shop Front View"
                      url={userKyc?.shopImageUrl}
                      onView={handleView}
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Bank Details
                  </h3>
                  {showControls && sectionStatus.bankDetailStatus !== "approved" && (
                    <StatusToggle
                      section="bankDetailStatus"
                      currentStatus={sectionStatus.bankDetailStatus}
                      updatingSection={updatingSection}
                      onToggle={toggleSection}
                    />
                  )}
                  {showControls && sectionStatus.bankDetailStatus == "approved" && (
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5 ">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        APPROVED
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Bank Name" value={userKyc?.bankName} />
                  <InfoField
                    label="Account Number"
                    value={userKyc?.accountNumber}
                  />
                  <InfoField label="IFSC Code" value={userKyc?.ifscCode} />



                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  mt-3">
                  <DocPreview label="Blank Cheque" url={userKyc?.blankChequeUrl} onView={handleView} />
                </div>
              </div>

              {/* Identity Documents */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Identity Documents
                  </h3>
                  {showControls && sectionStatus.identityDetailStatus !== "approved" && (
                    <StatusToggle
                      section="identityDetailStatus"
                      currentStatus={sectionStatus.identityDetailStatus}
                      updatingSection={updatingSection}
                      onToggle={toggleSection}
                    />
                  )}
                  {showControls && sectionStatus.identityDetailStatus == "approved" && (
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5 ">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        APPROVED
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Aadhaar No" value={userKyc?.aadharNumber} />
                  <InfoField label="PAN No" value={userKyc?.panNumber} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <DocPreview label="Aadhaar" url={userKyc?.aadharFileUrl} onView={handleView} />
                  <DocPreview label="PAN" url={userKyc?.panFileUrl} onView={handleView} />
                </div>
              </div>
            </CardContent>
          }

          {/* Bottom Action Footer */}
          {!isApproved && showControls && (
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex justify-end sticky bottom-0 z-10 backdrop-blur-sm">
              <Button
                onClick={() => isActionable && setIsActionModalOpen(true)}
                disabled={!isActionable || updatingKycRequestStatus}
                className={`${actionButtonConfig?.classes} flex items-center gap-2 ${updatingKycRequestStatus ? 'opacity-50' : ''}`}
              >
                {updatingKycRequestStatus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {actionButtonConfig?.icon && (
                      <actionButtonConfig.icon className="w-5 h-5" />
                    )}
                    {actionButtonConfig?.text}
                  </>
                )}
              </Button>
            </div>
          )}
        </BentoCard>

        <KYCActionModal
          isOpen={isActionModalOpen}
          sectionStatus={sectionStatus}
          onClose={() => setIsActionModalOpen(false)}
          onConfirm={handleKycUpdate}
          currentStatus={userKyc?.status}
          userName={`${userKyc?.firstName} ${userKyc?.lastName}`}
        />
        <ImageModal isOpen={imageModalOpen} onClose={() => {
          setImageModalOpen(false)
          setSelectedImage(null)
        }} images={selectedImage ? [selectedImage] : []} />
      </>
    </div>
  );
};


const StatusToggle = ({ section, currentStatus, updatingSection, onToggle }) => {
  const isUpdatingThis = updatingSection.name === section;
  const isAnythingUpdating = updatingSection.name !== "";
  const targetStatus = updatingSection.status;

  return (
    <div className="grid grid-cols-2 bg-slate-200/50 rounded-xl p-1 gap-1 border border-slate-200/60 w-[180px] h-9">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle(section, "approved")}
        disabled={isAnythingUpdating}
        className={`h-full rounded-lg text-[9px] font-bold transition-all duration-300 uppercase tracking-wide flex items-center justify-center overflow-hidden relative ${isUpdatingThis && targetStatus === "approved"
          ? "bg-emerald-600 text-white shadow-sm"
          : currentStatus === "approved"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
          } ${isAnythingUpdating ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isUpdatingThis && targetStatus === "approved" ? (
            <motion.div
              key="updating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
              className="flex items-center gap-1.5"
            >
              <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="truncate tracking-tight">Wait...</span>
            </motion.div>
          ) : (
            <motion.span
              key="approved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            >
              Approved
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle(section, "rejected")}
        disabled={isAnythingUpdating}
        className={`h-full rounded-lg text-[9px] font-bold transition-all duration-300 uppercase tracking-wide flex items-center justify-center overflow-hidden relative ${isUpdatingThis && targetStatus === "rejected"
          ? "bg-rose-600 text-white shadow-sm"
          : currentStatus === "rejected"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
          } ${isAnythingUpdating ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isUpdatingThis && targetStatus === "rejected" ? (
            <motion.div
              key="updating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
              className="flex items-center gap-1.5"
            >
              <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="truncate tracking-tight">Wait...</span>
            </motion.div>
          ) : (
            <motion.span
              key="rejected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            >
              Rejected
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default KycTab;
