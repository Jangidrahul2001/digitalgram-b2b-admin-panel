import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Outlet } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { cn } from "../../lib/utils"
import { useDispatch, useSelector } from "react-redux"
import { Skeleton } from "../ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { fetchProfile } from "../../store/slices/profileSlice"

// Skeleton Components
const SidebarSkeleton = ({ isCollapsed, isMobile }) => (
  <>
    {/* Mobile Overlay Backdrop */}
    <AnimatePresence>
      {isMobile && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
)

const HeaderSkeleton = ({ isMobile }) => (
  <div className="flex flex-col bg-amber-50/10 sticky top-0 z-50 border-b border-slate-200/40">
    <header className="flex h-13 md:h-15 lg:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-6 lg:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2 md:pr-4">
        {isMobile && <Skeleton className="!h-9 !w-9 rounded-full" />}
        <div className="flex items-center gap-2 md:gap-3 bg-white/50 border border-blue-100/40 px-3 md:px-4 py-1.5 rounded-full flex-1 max-w-[300px] lg:max-w-[450px] xl:max-w-[800px]">
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 md:gap-4 lg:gap-6 flex-shrink-0">
        {/* Wallet Skeleton */}
        <div className="flex items-center bg-slate-100/50 p-0.5 rounded-full border border-slate-200/50">
          <div className="flex items-center gap-1 md:gap-2 px-1.5 md:px-2.5 lg:px-3 py-1 md:py-1.2 rounded-l-full bg-white/50">
            <Skeleton className="h-6.5 w-6.5 md:h-7.5 lg:h-8 md:w-7.5 lg:w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <div className="w-px h-5 md:h-5.5 lg:h-6 bg-slate-200 mx-0.5 md:mx-1" />
          <div className="flex items-center gap-1 md:gap-2 px-1.5 md:px-2.5 lg:px-3 py-1 md:py-1.2 rounded-r-full bg-white/50">
            <Skeleton className="h-6.5 w-6.5 md:h-7.5 lg:h-8 md:w-7.5 lg:w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 md:gap-2 lg:gap-3 pl-1.5 md:pl-4 lg:pl-5 border-l border-amber-200/60">
          <Skeleton className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 rounded-full" />
          <Skeleton className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 rounded-full" />
          <Skeleton className="h-8 w-8 md:h-9 lg:h-10 md:w-9 lg:w-10 rounded-full" />
        </div>
      </div>
    </header>
  </div>
)

const OutletSkeleton = ({ isMobile }) => (
  <div className={cn("pb-24 min-h-full bg-linear-to-tr from-white to-amber-50/30", isMobile ? "p-4" : "p-4 md:p-6")}>
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="p-4 bg-white rounded-xl border border-slate-100 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function DashboardLayout() {
  const scrollRef = useRef(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: profile, loading: profileLoading } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Handle Responsive Logic
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 500;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (profileLoading) {
    return (
      <div className={cn(
        "flex h-screen bg-amber-50 overflow-hidden transition-all duration-300 relative",
        isMobile ? "p-0" : "p-2 gap-1"
      )}>
        <SidebarSkeleton isCollapsed={isCollapsed} isMobile={isMobile} />

        <div className={cn(
          "flex-1 flex flex-col transition-all duration-500 relative shadow-sm",
          isMobile
            ? "h-full w-full bg-white rounded-none border-none"
            : "bg-white border border-amber-50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden"
        )}>
          <div className="flex-shrink-0">
            <HeaderSkeleton isMobile={isMobile} />
          </div>

          <main ref={scrollRef} className="flex-1 min-h-0 relative h-full overflow-y-auto custom-scrollbar">
            <OutletSkeleton isMobile={isMobile} />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-screen bg-amber-50 overflow-hidden transition-all duration-300 relative",
      isMobile ? "p-0" : "p-2 gap-1"
    )}>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500 relative shadow-sm",
        isMobile
          ? "h-full w-full bg-white rounded-none border-none"
          : "bg-white border border-amber-50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden"
      )}>
        <div className="flex-shrink-0">
          <Header
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobile={isMobile}
          />
        </div>

        <main ref={scrollRef} className="flex-1 min-h-0 relative h-full overflow-y-auto custom-scrollbar">
          <div className={cn("pb-24 min-h-full bg-linear-to-tr from-white to-amber-50/30", isMobile ? "p-4" : "p-4 md:p-6")}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
