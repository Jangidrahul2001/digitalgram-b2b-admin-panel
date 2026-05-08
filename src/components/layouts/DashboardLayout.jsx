import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Outlet } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { cn } from "../../lib/utils"

export default function DashboardLayout() {
  const scrollRef = useRef(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 1. Handle Responsive Logic
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 500;
      setIsMobile(mobile);
      // Auto-collapse on mobile if just resized
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
