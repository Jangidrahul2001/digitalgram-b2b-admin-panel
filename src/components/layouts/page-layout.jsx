"use client"
import React from "react"
import { useNavigate } from "react-router-dom"
import { MoveLeft } from "@/components/icons"
import { Button } from "../ui/button"
import { SidebarPageTransition } from "../ui/sidebar-page-transition"
import { cn } from "../../lib/utils"

export function PageLayout({
  title,
  subtitle,
  children,
  actions,
  showBackButton = false,
  className
}) {
  const navigate = useNavigate()

  return (
    <SidebarPageTransition className={cn("flex flex-col gap-6 font-sans", className)}>
      {/* Header Section */}
      {(title || actions || showBackButton) && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-start gap-4 md:gap-5 w-full md:w-auto">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl h-10 w-10 hover:bg-slate-900/5 transition-all text-slate-600 shrink-0 border border-slate-200/50"
              >
                <MoveLeft className="w-5 h-5" />
              </Button>
            )}

            {(title || subtitle) && (
              <div className="flex flex-col items-center md:items-start pt-1 w-full md:w-auto text-center md:text-left">
                {title && (
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-slate-500 text-[14px] md:text-[15px] font-medium mt-1.5 max-w-[320px] md:max-w-none leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {actions && (
            <div className="flex items-center justify-center md:justify-end gap-3 pr-0.5 flex-wrap w-full md:w-auto pt-1">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 pb-32 md:pb-20">
        {children}
      </div>
    </SidebarPageTransition>
  )
}
