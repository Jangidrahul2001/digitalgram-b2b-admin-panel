"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  Settings,
  FileText,
  Package,
  Shield,
  Check,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
} from "@/components/icons";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { BentoCard } from "../../../../components/ui/bento-card";
import { KYCActionModal } from "../../../../components/modals/kyc-action-modal";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { Select } from "../../../../components/ui/select";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/ui/loading-screen";

// --- Components ---



import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import {
  formatDate,
  handleValidationError,
} from "../../../../utils/helperFunction";
import ServicesTab from "./Services";
import KycTab from "./KycTab";
import { PageLayout } from "../../../../components/layouts/page-layout";
import PackageTab from "./PackageTab";
import WalletTab from "./WalletTab";

// ... imports

const StatusBadge = ({ status }) => {
  const rawStatus = status || "Pending";
  const statusLower = rawStatus.toLowerCase();

  let styles = "bg-amber-50 text-amber-700 border-amber-200";
  let Icon = Clock;
  let text = "Pending";

  if (statusLower === "approved") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
    text = "Approved";
  } else if (statusLower === "rejected") {
    styles = "bg-red-50 text-red-700 border-red-200";
    Icon = XCircle;
    text = "Rejected";
  } else if (statusLower === "submitted") {
    styles = "bg-blue-50 text-blue-700 border-blue-200";
    Icon = Clock;
    text = "Submitted";
  } else if (statusLower === "rekyc" || statusLower === "re-kyc") {
    styles = "bg-purple-50 text-purple-700 border-purple-200";
    Icon = AlertCircle;
    text = "Re-Kyc";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles}`}>
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </span>
  );
};
export default function UserDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location?.state?.tab || "kyc");
  const [user, setUser] = useState(null);
  const [userKyc, setUserKyc] = useState({});

  const { refetch: fetchParticularUser } = useFetch(
    `${apiEndpoints?.fetchParticularUser}/${params.userId}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const result = [];
          data?.data?.commission?.forEach((serviceItem) => {
            const { serviceName, data } = serviceItem;

            data.forEach((categoryItem) => {
              const { name, plans } = categoryItem;

              plans.forEach((plan) => {              
                result.push({
                  service: serviceName,
                  category: name,
                  from: plan.from,
                  to: plan.to,
                  commissionType: plan.type,
                  commissionAmount: plan.commission,
                });
              });
            });
          });

          setUser({ ...user, ...data?.data, commission: result, services: data?.data?.assignedServiceIds });
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching user Details:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-full mx-auto pb-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>
        <LoadingScreen variant="page" message="Accessing User Data" subtitle="Please wait while we fetch the details" />
      </div>
    );
  }

  return (
    <PageLayout
      title="User Details"
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          Managing profile & services for
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 font-bold text-[11px] border border-slate-200 uppercase tracking-tight">
            {user?.firstName} {user?.lastName}
          </span>
        </span>
      }
      showBackButton={true}
      actions={
        userKyc?.status && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">KYC Status:</span>
            <StatusBadge status={userKyc.status} />
          </div>
        )
      }
    >
      {/* Custom Tabs Navigation */}
      <div className="bg-slate-100/50 backdrop-blur-md rounded-[1.25rem] p-1.5 border border-slate-200/60 flex overflow-x-auto gap-1 items-center sticky top-2 z-30 shadow-inner">
        {[
          { id: "kyc", label: "KYC Details", icon: Shield },
          { id: "services", label: "Services", icon: RefreshCw },
          { id: "package", label: "Package & Commission", icon: Package },
          { id: "wallets", label: "Wallets", icon: Wallet },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const status = user?.kycStatus?.toLowerCase();
          const isKycApproved = status === "approved";
          const hasServices = user?.services && user.services.length > 0;

          let isDisabled = false;
          if (tab.id !== "kyc" && !isKycApproved) isDisabled = true;
          // Only show as disabled if they literally haven't passed the first gate
          // but allow viewing services/package for already active users
          if (["package", "wallets", "settings"].includes(tab.id) && !hasServices && !isKycApproved)
            isDisabled = true;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`
                                relative flex items-center gap-2.5 px-6 py-2.5 rounded-[1rem] text-[13px] font-bold transition-all duration-300 min-w-max outline-none
                                ${activeTab === tab.id ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}
                                ${isDisabled ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                            `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-800 rounded-[1rem] shadow-lg shadow-slate-900/5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? "text-white" : "text-slate-500"}`} />
              <span className="relative z-10 uppercase tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

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
            {activeTab === "kyc" && (
              // <div>hello</div>
              <KycTab
                userKyc={userKyc}
                setUserKyc={setUserKyc}
                // onUpdate={handleUserUpdate}
                onChangeTab={setActiveTab}
              />
            )}
            {activeTab === "wallets" && <WalletTab userId={params.userId} user={user} fetchParticularUser={fetchParticularUser} />}
            {activeTab === "package" && (
              <PackageTab userId={params.userId} user={user} onChangeTab={setActiveTab} fetchParticularUser={fetchParticularUser} />

            )}

            {activeTab === "services" && (
              <ServicesTab
                userId={params.userId}
                user={user}
                fetchParticularUser={fetchParticularUser}
                onChangeTab={setActiveTab}
              />
            )}
            {activeTab === "settings" && (
              <div className="p-10 text-center text-slate-400">
                Settings Coming Soon
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}