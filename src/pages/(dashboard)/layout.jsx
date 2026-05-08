import { Sidebar } from "../../components/layouts/sidebar"
import { Header } from "../../components/layouts/header"

import { useState, useEffect } from "react"

export default function DashboardLayout({
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 500)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-transparent overflow-hidden gap-0">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 flex flex-col h-full bg-transparent transition-all duration-300 ${isSmallScreen ? "rounded-none" : ""}`}>
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth antialiased min-h-0 relative">
          {children}
        </main>
      </div>
    </div>

  )
}

