import { useEffect, useRef, useState } from "react";
import {
  Bell, LogOut, Settings, User, LayoutDashboard, Wallet,
  Megaphone, RotateCw, Activity, Smartphone, FileText, Send,
  PanelLeftOpen, PanelLeftClose, X, Fingerprint
} from "@/components/icons";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { butteryDropdown, getButteryOrigin } from "../../lib/animations";
import { useHeaderData } from "../../hooks/use-header-data";
import { useClickOutside } from "../../hooks/use-click-outside";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminWallet } from "../../store/slices/walletSlice";
import { toast } from "sonner";
import { fetchProfile } from "../../store/slices/profileSlice";
import { cn } from "../../lib/utils";

// Reusable Premium Action Button Component
const HeaderActionButton = ({
  onClick,
  disabled,
  className,
  icon: Icon,
  spin,
  children,
  variant = "filled",
}) => {
  const baseStyles =
    "h-10 w-10 relative rounded-full hover:scale-105 active:scale-95 transition-all duration-300 border flex items-center justify-center";

  const variants = {
    filled:
      "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-950/10 border-transparent",
    ghost:
      "bg-white/50 hover:bg-white text-slate-500 border-slate-200/50 shadow-sm hover:shadow-md hover:text-slate-900",
  };

  return (
    <Button
      size="icon"
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className={`h-4.5 w-4.5 ${spin ? "animate-spin" : ""}`} />}
      {children}
    </Button>
  );
};

export function Header({ isCollapsed, setIsCollapsed, isMobile }) {
  const { data: profile } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTicker, setShowTicker] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileView = windowWidth <= 668;
  const isSmallMobile = windowWidth < 498;

  // Custom Hooks usage
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const walletRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));
  useClickOutside(notifRef, () => setIsNotifOpen(false));
  useClickOutside(walletRef, () => setIsWalletOpen(false));

  const {
    notifications,
    newsTicker,
    setNotifications,
  } = useHeaderData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAdminWallet());
    setIsRefreshing(false);
  };

  const hasUnreadNotifications = notifications.some((n) => !n.isRead);
  const { data: adminwallet, loading: walletLoading } = useSelector(
    (state) => state.wallet,
  );

  useEffect(() => {
    dispatch(fetchAdminWallet());
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    toast.success("logout successfully!!");
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col bg-amber-50/10 sticky top-0 z-50 border-b border-slate-200/40">
        <AnimatePresence>
          {showTicker && isMobileView && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "1.6rem", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-tr from-white to-indigo-50/30 flex items-center px-6 overflow-hidden relative group"
            >
              <div className="flex items-center text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] gap-2">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                Live Update
              </div>
              <div className="flex-1 overflow-hidden relative h-4 ml-8">
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute whitespace-nowrap text-[10px] font-semibold text-slate-500 flex items-center gap-12"
                >
                  {(newsTicker && newsTicker.length > 0)
                    ? [...newsTicker, ...newsTicker, ...newsTicker].map((text, i) => (
                      <span key={i} className="flex items-center gap-3">
                        <span className="text-slate-200">/</span> {text}
                      </span>
                    ))
                    : "System performance is optimal • All services operational • Security protocols active"}
                </motion.div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTicker(false)}
                className="h-5 w-5 ml-4 hover:bg-indigo-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 bg-transparent border-none shadow-none"
              >
                <X className="h-2.5 w-2.5 text-slate-400" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex h-13 md:h-15 lg:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-6 lg:px-8">

          {/* Left Section: Branding/Ticker/Status */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2 md:pr-4">
            {/* Sidebar toggle - Only shown on mobile (< 768px) */}
            {isSmallMobile && (
              <HeaderActionButton
                icon={isCollapsed ? PanelLeftOpen : PanelLeftClose}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="!h-9 !w-9 bg-slate-800 text-white rounded-full shadow-md border-white/5 active:scale-90"
              />
            )}

            {/* Desktop Ticker - Inline Header Version (Shown only on > 668px) */}
            {!isMobileView && showTicker && (
              <div className="flex items-center gap-2 md:gap-3 bg-white/50 border border-blue-100/40 px-3 md:px-4 py-1.5 rounded-full overflow-hidden relative flex-1 max-w-[300px] lg:max-w-[450px] xl:max-w-[800px] group/ticker shadow-sm">
                <div className="flex items-center text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-widest gap-1.5 md:gap-2 flex-shrink-0 z-10">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-sm" />
                  Live
                </div>
                <div className="flex-1 overflow-hidden relative h-4">
                  <motion.div
                    key={newsTicker.length}
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                      duration: 30 + (newsTicker.length * 5),
                      repeat: Infinity,
                      ease: "linear",
                      repeatType: "loop"
                    }}
                    className="absolute whitespace-nowrap text-[9px] md:text-[10px] font-semibold text-slate-500 flex items-center"
                  >
                    <div className="flex items-center gap-8 md:gap-10 pr-10">
                      {((newsTicker && newsTicker.length > 0) ? [...newsTicker, ...newsTicker, ...newsTicker] : [
                        "System performance is optimal",
                        "All services operational",
                        "Security protocols active"
                      ]).map((text, i) => (
                        <span key={i} className="flex items-center gap-3 md:gap-4">
                          <span className="text-slate-300">/</span> {text}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            )
            }
          </div>

          {/* Right Section: Wallets & Profile Actions */}
          <div className="flex items-center gap-1.5 md:gap-4 lg:gap-6 flex-shrink-0">

            {/* Themed Wallet Control Bar - Compact & Responsive */}
            <div className="flex items-center bg-slate-100/50 md:bg-slate-100/50 p-0.5 rounded-full border border-slate-200/50 shadow-sm transition-all duration-300 flex-shrink-0">

              {/* AEPS Theme - Amber */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 md:gap-2 px-1.5 md:px-2.5 lg:px-3 py-1 md:py-1.2 rounded-l-full bg-white/50 hover:bg-white transition-all cursor-pointer flex-shrink-0 group"
              >
                <div className="h-6.5 w-6.5 md:h-7.5 lg:h-8 md:w-7.5 lg:w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <Activity className="w-3 md:w-4 h-3 md:h-4 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-0.5 md:mb-1">AEPS</span>
                  <span className={cn(
                    "text-[10px] md:text-[12px] lg:text-[13px] font-bold text-slate-950 leading-none tabular-nums transition-opacity duration-300",
                    walletLoading && "opacity-60"
                  )}>
                    ₹{(!adminwallet && walletLoading) ? "..." : (adminwallet?.aepsWallet ?? "0")}
                  </span>
                </div>
              </motion.div>

              {/* Minimalist Separator */}
              <div className="w-px h-5 md:h-5.5 lg:h-6 bg-slate-200 mx-0.5 md:mx-1 flex-shrink-0" />

              {/* Main Wallet Theme - Slate/Black */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 md:gap-2 px-1.5 md:px-2.5 lg:px-3 py-1 md:py-1.2 rounded-r-full bg-white/50 hover:bg-white transition-all cursor-pointer flex-shrink-0 group"
              >
                <div className="h-6.5 w-6.5 md:h-7.5 lg:h-8 md:w-7.5 lg:w-8 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <Wallet className="w-3 md:w-4 h-3 md:h-4 text-white transition-colors" />
                </div>
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 md:mb-1">MAIN</span>
                  <span className={cn(
                    "text-[10px] md:text-[12px] lg:text-[13px] font-bold text-slate-950 leading-none tabular-nums transition-opacity duration-300",
                    walletLoading && "opacity-60"
                  )}>
                    ₹{(!adminwallet && walletLoading) ? "..." : (adminwallet?.mainWallet ?? "0")}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions & Profile */}
            <div className="flex items-center gap-1 md:gap-2 lg:gap-3 pl-1.5 md:pl-4 lg:pl-5 border-l border-amber-200/60 flex-shrink-0">
              <HeaderActionButton
                icon={RotateCw}
                onClick={handleRefresh}
                spin={isRefreshing}
                variant="ghost"
                className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 !rounded-full !bg-slate-50/50 hover:!bg-white border-slate-200/80 shadow-sm hover:shadow-sm"
              />

              <div className="relative" ref={notifRef}>
                <HeaderActionButton
                  icon={Bell}
                  variant="ghost"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 !rounded-full !bg-slate-50/50 hover:!bg-white border-slate-200/80 shadow-sm hover:shadow-sm"
                >
                  {hasUnreadNotifications && (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                  )}
                </HeaderActionButton>
                <AnimatePresence>
                  {isNotifOpen && (
                    <NotificationDropdown
                      notifications={notifications || []}
                      setNotifications={setNotifications}
                      onClose={() => setIsNotifOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={dropdownRef}>
                <Button
                  asChild
                  variant="ghost"
                  className="h-8 w-8 md:h-9 lg:h-10 md:w-9 lg:w-10 p-0 rounded-full border border-slate-200/60 shadow-sm overflow-hidden hover:scale-105 active:scale-95 transition-all bg-transparent"
                >
                  <motion.button onClick={() => setIsOpen(!isOpen)}>
                    <img
                      src={
                        profile?.imgUrl ||
                        `https://ui-avatars.com/api/?name=${profile?.name?.charAt(0)}&background=0f172a&color=fff`
                      }
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </motion.button>
                </Button>
                <AnimatePresence>
                  {isOpen ? (
                    <motion.div
                      {...butteryDropdown}
                      {...getButteryOrigin("top right")}
                      className="absolute right-0 top-full mt-3 w-56 p-2 rounded-2xl border border-slate-200/60 bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-[100] overflow-hidden"
                    >
                      <div className="p-3 mb-1">
                        <p className="text-[12px] font-bold text-slate-900 truncate leading-tight">{profile?.name || "Administrator"}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1 tracking-tight">{profile?.email || "admin@system.com"}</p>
                      </div>
                      <div className="h-px bg-slate-100/60 mx-2 mb-1" />
                      <div className="flex flex-col gap-1">
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold rounded-xl hover:bg-slate-100/60 text-slate-600 transition-all">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Account Settings
                        </Link>
                        <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold rounded-xl hover:bg-slate-100/60 text-slate-600 transition-all">
                          <Settings className="w-3.5 h-3.5 text-slate-400" /> System Settings
                        </Link>
                        <div className="h-px bg-slate-100/60 mx-2 my-1" />
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-start gap-3 px-3 py-2 text-[11px] font-extrabold rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-all h-auto bg-transparent border-none shadow-none"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Secure Sign out
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
      </div>
    </TooltipProvider>
  );
}

function NotificationDropdown({ onClose, notifications, setNotifications }) {
  const navigate = useNavigate();
  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, isRead: true })));
  };

  return (
    <motion.div
      {...butteryDropdown}
      {...getButteryOrigin("top right")}
      className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200/60 bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-[100] overflow-hidden p-2"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100/60 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest">Notifications</span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[9px] font-bold text-blue-600 border border-blue-100/50">
            {notifications?.filter(n => !n.isRead).length || 0}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-[9px] text-slate-400 font-bold hover:text-blue-600 transition-colors h-auto p-1 bg-transparent hover:bg-blue-50/50 rounded-lg shadow-none"
        >
          MARK ALL READ
        </Button>
      </div>

      <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto px-1 scrollbar-none">
        {(notifications || []).length > 0 ? (
          notifications.slice(0, 5).map((notif) => (
            <div key={notif.id} className="p-3 rounded-xl hover:bg-slate-50 transition-all flex gap-3 items-start group relative border border-transparent hover:border-slate-100/60">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.05)]",
                notif.isRead ? "bg-slate-200" : (notif.color || "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]")
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] font-bold leading-tight truncate group-hover:text-blue-600 transition-colors",
                  notif.isRead ? "text-slate-500" : "text-slate-900"
                )}>
                  {notif.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium line-clamp-2">
                  {notif.description || "You have a new update in your system dashboard."}
                </p>
                <p className="text-[8px] text-slate-400 mt-1.5 font-bold uppercase tracking-tight">{notif.time}</p>
              </div>
              {!notif.isRead && (
                <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100/60">
              <Bell className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Inbox Zero</span>
              <span className="text-[10px] text-slate-400 font-medium lowercase">all notifications caught up</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100/60">
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-900 py-2 h-auto rounded-xl hover:bg-slate-50 transition-all bg-transparent border-none shadow-none"
        >
          VIEW ALL UPDATES
        </Button>
      </div>
    </motion.div>
  );
}
