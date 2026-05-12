import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  FileText,
  Package,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
} from "@/components/icons";
import { Button } from "../../../../components/ui/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { BentoCard } from "../../../../components/ui/bento-card";
import { KYCActionModal } from "../../../../components/modals/kyc-action-modal";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/ui/loading-screen";
import { PageLayout } from "../../../../components/layouts/page-layout";



import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { capitalize, formatDate, handleValidationError } from "../../../../utils/helperFunction";
import { usePatch } from "../../../../hooks/usePatch";
import { set } from "date-fns";
import { Check } from "lucide-react";
import ImageModal from "../../../../components/ui/ImageModal";

// ... imports

export default function UserDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kyc");
  const [user, setUser] = useState(null);



  const { refetch: refetchKycDetails } = useFetch(
    `${apiEndpoints?.fetchKycById}/${params.userId}`,
    {
      onSuccess: (data) => {
        setUser(data.data);
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

  if (isLoading) return <LoadingScreen message="Accessing User Data" />;

  return (
    <PageLayout
      title="KYC Details"
      subtitle={
        <div className="flex items-center gap-1.5">
          View KYC Details of
          <span className="font-mono font-semibold text-slate-800 tracking-tight">
            {" "}
            {capitalize(user?.firstName)} {user?.lastName}
          </span>
        </div>
      }
      showBackButton={true}
    >
      {/* Tab Content with AnimatePresence */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <KYCTab user={user} refetchKycDetails={refetchKycDetails} />
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

function KYCTab({ user, refetchKycDetails }) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [updatingSection, setUpdatingSection] = useState({ name: "", status: "" });
  const navigate = useNavigate();

  const handleView = (url) => {
    setSelectedImage(url)
    setImageModalOpen(true)
  }

  // Initialize section statuses based on user's current KYC status
  const [sectionStatus, setSectionStatus] = useState(() => {
    const personalDetailStatus = user.personalDetailStatus;
    const businessDetailStatus = user.businessDetailStatus;
    const bankDetailStatus = user.bankDetailStatus;
    const identityDetailStatus = user.identityDetailStatus;
    return {
      personalDetailStatus: personalDetailStatus,
      businessDetailStatus: businessDetailStatus,
      bankDetailStatus: bankDetailStatus,
      identityDetailStatus: identityDetailStatus,
    };
  });

  useEffect(() => {
    const personalDetailStatus = user.personalDetailStatus;
    const businessDetailStatus = user.businessDetailStatus;
    const bankDetailStatus = user.bankDetailStatus;
    const identityDetailStatus = user.identityDetailStatus;
    setSectionStatus({
      personalDetailStatus: personalDetailStatus,
      businessDetailStatus: businessDetailStatus,
      bankDetailStatus: bankDetailStatus,
      identityDetailStatus: identityDetailStatus,
    });
  }, [user]);

  const [updatingKycRequestStatus, setUpdatingKycRequestStatus] = useState(false);

  const { patch: updateUserKycSection } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Status updated successfully");
        refetchKycDetails();
        setUpdatingSection({ name: "", status: "" });
      }
    },
    onError: (error) => {
      setUpdatingSection({ name: "", status: "" });
      console.error("Failed to update Status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const toggleSection = (section, status) => {
    setUpdatingSection({ name: section, status });
    updateUserKycSection(`${apiEndpoints.updateKycSectionStatus}/${user._id}`, {
      status,
      section,
    });
  };

  const { patch: updateUserKyc } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "KYC Status updated successfully");
        refetchKycDetails();
        setUpdatingKycRequestStatus(false)
        if (data.data.kycStatus === "rekyc" || data.data.kycStatus === "rejected") {
          navigate(-1)
        }
        else {
          navigate(`/users/${user.userId}`, { state: { tab: "services" } });
        }
      }
    },
    onError: (error) => {
      setUpdatingKycRequestStatus(false)
      console.error("Failed to update Kyc Status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleKycUpdate = (newStatus, reason) => {
    console.log(newStatus)
    if (newStatus === "re-kyc") {
      setUpdatingKycRequestStatus(true)
      updateUserKyc(`${apiEndpoints.requestReKyc}/${user._id}`, {
        status: newStatus,
        reason: reason,
      });
    }
    else {
      setUpdatingKycRequestStatus(true)
      updateUserKyc(`${apiEndpoints.updateKycRequest}/${user._id}`, {
        status: newStatus,
        reason: reason,
      });
    }
  };

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
    rekyc: {
      icon: Clock,
      text: "Re-kyc",
      bg: "bg-amber-500",
      border: "border-amber-200",
      textCol: "text-amber-700",
      lightBg: "bg-amber-50",
      ring: "ring-amber-100",
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
  };

  const currentKey = user?.status;

  const config = statusConfig[currentKey] ?? statusConfig.pending;
  const StatusIcon = config?.icon;

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

  // Only allow clicking if a valid action is determined (not pending/partial)
  // Or if pending, maybe disable it.
  const isActionable = derivedAction !== "pending";

  const isApproved = user.status === "approved";
  const showControls = !isApproved;
  if (updatingKycRequestStatus) return <LoadingScreen variant="page" message="Updating KYC Status" />;
  return (
    <>
      <BentoCard hasHover={false} className="p-0 flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50/50 py-4 px-6 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">KYC Verification</CardTitle>
            <CardDescription className="text-slate-500 text-[13px]">
              Personal information and identity verification documents.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            {/* Simplified Status Badge (Non-Interactive) */}
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
                <StatusIcon className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                  Current Status
                </span>
                <span
                  className={`text-[11px] font-black uppercase tracking-wide ${config.textCol}`}
                >
                  {config.text}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.1em]">
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
              <InfoField label="First Name" value={user?.firstName} />
              <InfoField label="Last Name" value={user?.lastName} />
              <InfoField label="Email" value={user?.email} />
              <InfoField label="Mobile" value={user?.phone} />
              <InfoField
                label="Date of Birth"
                value={formatDate(user?.dob)}
              />
              <InfoField label="Father Name" value={user?.fatherName} />
              <InfoField label="State" value={user?.personalAddress?.state} />
              <InfoField label="City" value={user?.personalAddress?.city} />
              <InfoField
                label="PIN Code"
                value={user?.personalAddress?.pincode}
              />
              <InfoField
                label="Address"
                value={user?.personalAddress?.address}
                fullWidth
              />
            </div>
          </div>

          {/* Business Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.1em]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Company Name" value={user?.shopName} />
              <InfoField
                label="Business Pan No."
                value={user?.businessPanNumber}
              />
              <InfoField label="GST No" value={user?.gstNumber} />
              {/* <InfoField label="Company Type" value={user.companyType} /> */}
              <InfoField label="State" value={user?.businessAddress?.state} />
              <InfoField label="City" value={user?.businessAddress?.city} />
              <InfoField
                label="PIN Code"
                value={user?.businessAddress?.pincode}
              />
              <InfoField
                label="Address"
                value={user?.businessAddress?.address}
                fullWidth
              />
              {/* <InfoField value={user.companyAddress} fullWidth /> */}
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Shop / Workplace Image
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <DocPreview label="Shop Front View" url={user?.shopImageUrl} onView={handleView} />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.1em]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField
                label="Account Holder Name"
                value={user?.accountHolderName}
              />
              <InfoField label="Bank Name" value={user?.bankName} />
              <InfoField label="Account Number" value={user?.accountNumber} />
              <InfoField label="IFSC Code" value={user?.ifscCode} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-3">
              <DocPreview label="Blank Cheque" url={user?.blankChequeUrl} onView={handleView} />
            </div>
          </div>


          {/* Identity Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.1em]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Aadhaar No" value={user?.aadharNumber} />
              <InfoField label="PAN No" value={user?.panNumber} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {/* <DocPreview label="Photo" url={user.}/> */}
              <DocPreview label="Aadhaar" url={user?.aadharFileUrl} onView={handleView} />
              <DocPreview label="PAN" url={user?.panFileUrl} onView={handleView} />
            </div>
          </div>
        </CardContent>

        {/* Bottom Action Footer */}
        {!isApproved && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end sticky bottom-0 z-10 backdrop-blur-sm">
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
        currentStatus={user.kycStatus}
        userName={`${user.firstName} ${user.lastName}`}
      />
      <ImageModal isOpen={imageModalOpen} onClose={() => {
        setImageModalOpen(false)
        setSelectedImage(null)
      }} images={selectedImage ? [selectedImage] : []} />
    </>
  );
}

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

const InfoField = ({ label, value, fullWidth }) => (

  <div
    className={`bg-slate-50/80 p-2.5 px-3 rounded-xl border border-slate-100 ${fullWidth ? "col-span-full" : ""}`}
  >
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-[13px] font-semibold text-slate-800 truncate">{value}</p>
  </div>
);

const DocPreview = ({ label, url, onView }) => {
  const [hasError, setHasError] = useState(false);
  const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;
  const isPdf = url?.toLowerCase().endsWith(".pdf");

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
  if (!url || hasError) {
    return (
      <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 bg-white cursor-pointer group">
        <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <div className="w-full flex items-center justify-between mt-1">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
            N/A
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-3 flex flex-col items-center gap-2 bg-white shadow-sm cursor-pointer group">
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
