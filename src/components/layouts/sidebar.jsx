import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"

// Custom Hook
// import { useSidebar } from "../../hooks/use-sidebar"
import { useBranding } from "../../hooks/use-branding"

import { Button } from "../../components/ui/button"
import { useFetch } from "../../hooks/useFetch"
import { apiEndpoints } from "../../api/apiEndpoints"
import { useNavigate } from "react-router-dom"
import { getIcon, MOCK_SIDEBAR_CONFIG } from "../../api/ui-config-mock"
import { useSelector } from "react-redux"
import { Skeleton } from "../ui/skeleton"
// import { useSidebarCounts } from "../../hooks/use-sidebar-counts"

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile }) {
  const location = useLocation();
  const pathname = location.pathname
  const [sidebarGroups, setSidebarGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profile } = useSelector((state) => state.profile);
  console.log(profile, "profile in sidebar");

  // Fetch Services with Pipeline for Sidebar Dropdown
  const { data: servicesData } = useFetch(
    apiEndpoints.fetchServicesWithPipeline,
    {},
    true,
  );
  console.log(servicesData, "servicesData");

  // Create service structure upfront with filtering
  const serviceStructure = React.useMemo(() => {
    if (!servicesData?.success || !servicesData?.data) return [];

    // Filter out unwanted services
    const excludedServices = ['offline-service', 'online-service', 'upi-payout']; // Add service names to exclude

    return servicesData.data
      .filter(service => !excludedServices.includes(service.name?.toLowerCase()))
      .map((service) => {
        const pipelines = service.pipeline || [];

        return {
          label: service.label,
          value: service.name,
          pipelines: pipelines,
          // If only one pipeline, create direct navigation
          hasMultiplePipelines: pipelines.length > 1,
          directPipeline: pipelines.length === 1 ? pipelines[0] : null
        };
      });
  }, [servicesData]);

  useEffect(() => {
    const config = MOCK_SIDEBAR_CONFIG;
    const transformedConfig = config.map((group) => ({
      ...group,
      items: group.items
        .filter((item) =>
          profile?.permissions?.some(
            (perm) => perm.name === item.key
          )
        )
        .map((item) => ({
          ...item,
          icon: getIcon(item.iconName),
        })),
    })).filter(group => group.items.length > 0);
    setSidebarGroups(transformedConfig);
    if (profile) {
      setIsLoading(false);
    }
  }, [profile])

  const { refetch: fetchPermissions } = useFetch(
    `${apiEndpoints.permissionList}`,
    {
      onSuccess: (data) => {
        if (data.success) {

        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch service details",
        );
      },
    },
    false,
  );

  // Use Custom Hooks for Data
  // const { sidebarGroups, isLoading } = useSidebar();
  const { branding } = useBranding();
  const navigate = useNavigate();
  // const counts = useSidebarCounts();

  const currentServiceId = new URLSearchParams(location.search).get("service") || "";
  const currentPipelineId = new URLSearchParams(location.search).get("pipeline") || "";
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [openServiceMenus, setOpenServiceMenus] = useState({});

  // Auto-open submenu if active
  useEffect(() => {
    if (pathname.includes("/reports/service-wise") || currentServiceId) {
      setOpenSubMenus(prev => ({ ...prev, "Service Wise Report": true }));
      if (currentServiceId) {
        setOpenServiceMenus(prev => ({ ...prev, [currentServiceId]: true }));
      }
    }
  }, [pathname, currentServiceId]);

  const toggleSubMenu = (title) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleServiceMenu = (serviceId) => {
    setOpenServiceMenus(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Handle service click logic
  const handleServiceClick = (service) => {
    if (service.hasMultiplePipelines) {
      // Multiple pipelines - show dropdown
      toggleServiceMenu(service.value);
    } else if (service.directPipeline) {
      // Single pipeline - direct navigation
      navigate(`/reports/service-wise?service=${service.value}&pipeline=${service.directPipeline.code}`);
      if (isMobile) setIsCollapsed(true);
    } else {
      // No pipelines - navigate to service page
      navigate(`/reports/service-wise?service=${service.value}`);
      if (isMobile) setIsCollapsed(true);
    }
  };

  if (isLoading) {
    return (
      <>
        {/* Mobile Overlay Backdrop */}
        <AnimatePresence>
          {isMobile && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollapsed(true)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={isMobile ? { x: -300 } : { width: 280 }}
          animate={isMobile
            ? { x: isCollapsed ? -300 : 0, width: 280 }
            : { width: isCollapsed ? 72 : 280, x: 0 }
          }
          transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          className={cn(
            "flex-shrink-0 relative bg-white will-change-transform z-[100] shadow-sm",
            isMobile
              ? "fixed left-0 top-0 bottom-0 h-full w-[280px]"
              : "block h-full border border-amber-100 rounded-[1.5rem] md:rounded-[2.5rem]"
          )}
        >
          <div className={cn("flex h-full flex-col py-6 relative", isCollapsed ? "px-2" : "px-4")}>
            {/* Header Skeleton */}
            <div className={cn("flex items-center mb-5 min-h-[44px] relative", isCollapsed ? "justify-center" : "justify-between pl-1")}>
              {isCollapsed ? (
                <Skeleton className="w-9 h-9 rounded-[0.9rem]" />
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-9 h-9 rounded-[0.9rem]" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </>
              )}
            </div>

            {/* Navigation Skeleton */}
            <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-1">
              <nav className="flex flex-col gap-1">
                {[1, 2, 3].map((group) => (
                  <div key={group} className="flex flex-col gap-2">
                    {!isCollapsed && (
                      <div className="px-4 mt-4 mb-1 flex items-center gap-3">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-[1px] flex-1" />
                      </div>
                    )}

                    {isCollapsed && <Skeleton className="h-[1px] mx-4 my-2" />}

                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className={cn("flex items-center gap-3 px-3 py-2.5", isCollapsed ? "justify-center px-0 w-11 h-11 mx-auto" : "")}>
                        <Skeleton className="w-[1.1rem] h-[1.1rem] rounded" />
                        {!isCollapsed && <Skeleton className="h-4 flex-1" />}
                      </div>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={isMobile ? { x: -300 } : { width: 280 }}
        animate={isMobile
          ? { x: isCollapsed ? -300 : 0, width: 280 }
          : { width: isCollapsed ? 72 : 280, x: 0 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
        className={cn(
          "flex-shrink-0 relative bg-white border-amber-50 will-change-transform z-[100]",
          isMobile
            ? "fixed left-0 top-0 bottom-0 shadow-sm h-full w-[280px]"
            : "block h-full border border-amber-50 shadow-sm rounded-[1.5rem] md:rounded-[2.5rem]"
        )}
      >
        <div className={cn("flex h-full flex-col py-6 relative", isCollapsed ? "px-2" : "px-4")}>
          {/* Header & Toggle */}
          <div className={cn("flex items-center mb-5 min-h-[44px] relative", isCollapsed ? "justify-center" : "justify-between pl-1")}>

            {/* Collapsed State: "ChatGPT Style" Toggle */}
            {isCollapsed ? (
              <Button
                asChild
                className="group relative w-9 h-9 rounded-[0.9rem] bg-slate-900 flex items-center justify-center text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:scale-105 cursor-ew-resize! p-0"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCollapsed(false)}
                >
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="w-6 h-6 object-contain absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0"
                    />
                  ) : (
                    <span className="font-bold text-lg absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0">
                      {branding.logoText}
                    </span>
                  )}
                  <PanelLeftOpen className="w-5 h-5 absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100" />

                  {/* Tooltip for Toggle (Right Side) */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 hidden md:block">
                    <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                      Open Sidebar
                    </div>
                  </div>
                </motion.button>
              </Button>
            ) : (
              /* Expanded State: Logo Link + Close Button */
              <>
                <div className="flex items-center gap-4 overflow-hidden relative z-20">
                  <motion.div
                    layout
                    className="w-9 h-9 rounded-[0.9rem] bg-slate-900 border border-slate-900 flex items-center justify-center text-white shrink-0"
                  >
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="font-bold text-lg">{branding.logoText}</span>
                    )}
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[1.35rem] text-slate-900 tracking-tight leading-none">
                      {branding.logoExpandedText.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                      {branding.logoExpandedText.subtitle}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-700 transition-all duration-150 p-1.5 hover:bg-slate-100 rounded-lg group relative cursor-ew-resize h-auto bg-transparent border-none shadow-none"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCollapsed(true)}
                  >
                    <PanelLeftClose className="w-5 h-5" />
                    {/* Tooltip for Close - Bottom */}
                    <div className="absolute right-0 top-full mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 z-50">
                      <div className="bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded-md shadow-xl whitespace-nowrap">
                        Close Sidebar
                      </div>
                    </div>
                  </motion.button>
                </Button>
              </>
            )}

          </div>

          {/* Navigation */}
          <div
            className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-1 scrollbar-none"
          >
            <nav className="flex flex-col gap-1">
              {sidebarGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-2">
                  {!isCollapsed && group.label && (
                    <div className="px-4 mt-4 mb-1 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.12em] whitespace-nowrap">{group.label}</span>
                      <div className="h-[1px] bg-slate-200 flex-1" />
                    </div>
                  )}

                  {group.label && isCollapsed && <div className="h-[1px] bg-slate-200 mx-4 my-2" />}

                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon;
                    return (
                      <div key={item.href} className="flex flex-col">
                        <div
                          onClick={() => {
                            if (item.title === "Service Wise Report") {
                              toggleSubMenu(item.title);
                            } else {
                              navigate(item.href);
                              if (isMobile) setIsCollapsed(true);
                            }
                          }}
                          className="relative block cursor-pointer"
                        >
                          <div
                            className={cn(
                              "group flex items-center gap-3 px-3 py-2.5 relative z-10 duration-150 transition-all",
                              isCollapsed ? "justify-center px-0 w-11 h-11 mx-auto" : ""
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-bg"
                                className={cn("absolute inset-0 bg-amber-50", isCollapsed ? "rounded-xl" : "rounded-xl")}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            {!isActive && (
                              <div className={cn("absolute inset-0 bg-white/0 group-hover:bg-slate-50 transition-colors duration-150", isCollapsed ? "rounded-xl" : "rounded-xl")} />
                            )}

                            <Icon className={cn("h-[1.1rem] w-[1.1rem] flex-shrink-0 relative z-10 transition-colors duration-150", isActive ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600")} />
                            <AnimatePresence>
                              {!isCollapsed && (
                                <div className="flex items-center justify-between flex-1 relative z-10">
                                  <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    className={cn("font-medium text-[0.85rem] whitespace-nowrap tracking-[-0.01em]", isActive ? "text-amber-700 font-bold" : "text-slate-500 group-hover:text-slate-800")}
                                  >
                                    {item.title}
                                  </motion.span>

                                  <div className="flex items-center gap-2">
                                    {item.title === "Service Wise Report" && serviceStructure.length > 0 && (
                                      <motion.div
                                        animate={{ rotate: openSubMenus[item.title] ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronDown className={cn("w-3.5 h-3.5", isActive ? "text-amber-600/60" : "text-slate-400")} />
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Custom Nested Sub-menu for Service Wise Report */}
                        {item.title === "Service Wise Report" && !isCollapsed && serviceStructure.length > 0 && (
                          <AnimatePresence>
                            {openSubMenus[item.title] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden flex flex-col relative ml-[26px] mt-0.5 border-l border-slate-100"
                              >
                                {serviceStructure.map((service, index) => {
                                  const isServiceActive = currentServiceId === service.value;
                                  const hasActivePipeline = service.pipelines?.some(pipeline => currentPipelineId === pipeline.code);

                                  return (
                                    <div key={service.value} className="flex flex-col">
                                      {/* Service Level */}
                                      <div
                                        onClick={() => handleServiceClick(service)}
                                        className={cn(
                                          "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-all duration-200 relative group w-full text-left cursor-pointer",
                                          index !== serviceStructure.length - 1 && "border-b border-slate-50",
                                          isServiceActive || hasActivePipeline
                                            ? "text-orange-500 font-bold bg-orange-50/30"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                          isServiceActive || hasActivePipeline
                                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                            : "bg-slate-200 group-hover:bg-slate-300"
                                        )} />
                                        <span className="capitalize flex-1">{service.label}</span>

                                        {/* Show chevron only for services with multiple pipelines */}
                                        {service.hasMultiplePipelines && (
                                          <motion.div
                                            animate={{ rotate: openServiceMenus[service.value] ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <ChevronDown className="w-3 h-3 text-slate-400" />
                                          </motion.div>
                                        )}

                                        {(isServiceActive || hasActivePipeline) && (
                                          <motion.div
                                            layoutId="service-active-glow"
                                            className="absolute left-0 w-[2px] h-5 bg-amber-500 rounded-full"
                                            style={{ left: "-1px" }}
                                          />
                                        )}
                                      </div>

                                      {/* Pipeline Level - Only show for services with multiple pipelines */}
                                      {service.hasMultiplePipelines && (
                                        <AnimatePresence>
                                          {openServiceMenus[service.value] && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                              className="overflow-hidden flex flex-col relative ml-4 border-l border-slate-100"
                                            >
                                              {service.pipelines.map((pipeline, pipelineIndex) => {
                                                const isPipelineActive = currentPipelineId === pipeline.code;

                                                return (
                                                  <button
                                                    key={pipeline.code}
                                                    onClick={() => {
                                                      navigate(`/reports/service-wise?service=${service.value}&pipeline=${pipeline.code}`);
                                                      if (isMobile) setIsCollapsed(true);
                                                    }}
                                                    className={cn(
                                                      "flex items-center gap-2 px-4 py-2 text-[12px] font-medium transition-all duration-200 relative group w-full text-left",
                                                      pipelineIndex !== service.pipelines.length - 1 && "border-b border-slate-50",
                                                      isPipelineActive
                                                        ? "text-blue-600 font-bold bg-blue-50/30"
                                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                                                    )}
                                                  >
                                                    <div className={cn(
                                                      "w-1 h-1 rounded-full transition-all duration-200",
                                                      isPipelineActive
                                                        ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                                                        : "bg-slate-200 group-hover:bg-slate-300"
                                                    )} />
                                                    <span className="capitalize">{pipeline.label}</span>

                                                    {isPipelineActive && (
                                                      <motion.div
                                                        layoutId="pipeline-active-glow"
                                                        className="absolute left-0 w-[2px] h-4 bg-blue-500 rounded-full"
                                                        style={{ left: "-1px" }}
                                                      />
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      )}
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </motion.div>
    </>
  )
}
