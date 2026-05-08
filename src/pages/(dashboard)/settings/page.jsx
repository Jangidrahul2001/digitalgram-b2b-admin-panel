"use client";

import LoginLogs from "./tabs/LoginLogs";
import BannersTab from "./tabs/BannersTab";
import NotificationTab from "./tabs/NotificationTab";
import PolicyTab from "./tabs/PolicyTab";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Tabs } from "../../../components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition";
import { Link, useSearchParams } from "react-router-dom";
import {
  Settings2, History, Bell, Image as ImageIcon,
  IdCard, Banknote, FileText, ShieldCheck,
  Trash2, Plus, Settings
} from "lucide-react";
import { ManageServicesTab } from "./tabs/Manage-services-tab";
import { WalletTopupBankTab } from "./tabs/wallet-topup-bank-tab";
import { MainSettingsTab } from "./tabs/main-settings-tab";
import NewUserSetting from "./tabs/NewUserSetting";
import { PageLayout } from "../../../components/layouts/page-layout";

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "site_setting";
  const [activeTab, setActiveTab] = useState(initialTab);

  const settingIcons = {
    "Site Setting": <Settings2 className="w-4 h-4" />,
    "New Users Setting": <Settings className="w-4 h-4" />,
    "User Login Logs": <History className="w-4 h-4" />,
    Notification: <Bell className="w-4 h-4" />,
    Banners: <ImageIcon className="w-4 h-4" />,
    "Manage Services": <IdCard className="w-4 h-4" />,
    "Wallet Topup Bank": <Banknote className="w-4 h-4" />,
    "Terms & Condition": <FileText className="w-4 h-4" />,
    "Privacy Policy": <ShieldCheck className="w-4 h-4" />,
    "Refund Policy": <Trash2 className="w-4 h-4" />,
  };

  const settingTabs = [
    "Site Setting",
    "New Users Setting",
    "User Login Logs",
    "Notification",
    "Banners",
    "Manage Services",
    "Wallet Topup Bank",
    "Terms & Condition",
    "Privacy Policy",
    "Refund Policy",
  ];

  const tabsRef = useRef(null);

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const pageActions = (
    <AnimatePresence>
      {activeTab === "notification" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
          <Link to="/settings/notifications/new">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Notification
            </Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage platform configuration and logs."
      actions={pageActions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-30 bg-white -mx-4 md:-mx-6 px-4 md:px-6 pt-2 border-b border-slate-200 mb-6">
          <div className="relative inline-block w-full">
            <div
              ref={tabsRef}
              className="flex items-center gap-4 md:gap-8 overflow-x-auto relative z-0 w-full pr-20 xl:pr-0 pb-1 settings-subtle-scroll"
            >
              {settingTabs.map((tab) => {
                const value = tab.toLowerCase().replace(/ /g, "_");
                const isActive = activeTab === value;

                return (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={`
                      relative flex items-center justify-center gap-2 px-1 py-4 text-sm font-medium transition-all duration-200 z-10 cursor-pointer whitespace-nowrap shrink-0 snap-start
                      ${isActive ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-700"}
                    `}
                  >
                    <span className="relative z-20 flex items-center gap-2">
                      {settingIcons[tab] && React.cloneElement(settingIcons[tab], {
                        className: `w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`
                      })}
                      {tab}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="popLayout" initial={false}>
            <SidebarPageTransition key={activeTab}>
              {activeTab === "site_setting" && <MainSettingsTab />}
              {activeTab === "new_users_setting" && <NewUserSetting />}
              {activeTab === "user_login_logs" && <LoginLogs />}
              {activeTab === "notification" && <NotificationTab />}
              {activeTab === "banners" && <BannersTab />}
              {activeTab === "manage_services" && <ManageServicesTab />}
              {activeTab === "wallet_topup_bank" && <WalletTopupBankTab />}
              {activeTab === "terms_&_condition" && <PolicyTab title="Terms & Condition" />}
              {activeTab === "privacy_policy" && <PolicyTab title="Privacy Policy" />}
              {activeTab === "refund_policy" && <PolicyTab title="Refund Policy" />}
            </SidebarPageTransition>
          </AnimatePresence>
        </div>
      </Tabs>

      <style dangerouslySetInnerHTML={{
        __html: `
        .settings-subtle-scroll::-webkit-scrollbar {
          height: 2px;
        }
        .settings-subtle-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .settings-subtle-scroll::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .settings-subtle-scroll:hover::-webkit-scrollbar-thumb {
          background: #e2e8f0;
        }
        .settings-subtle-scroll {
          scrollbar-width: thin;
          scrollbar-color: #f1f5f9 transparent;
        }
      `}} />
    </PageLayout>
  );
}
