import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Users, UserCheck, UserPlus, Clock } from "@/components/icons";
import { Skeleton } from "../../../../components/ui/skeleton";

export function SupportStats({ stats, isLoading }) {
  const statsConfig = {
    total: {
      label: "All Tickets",
      footer: "Comprehensive count",
      icon: <Users className="w-5 h-5" />,
      theme: "indigo",
      gradient: "from-white to-indigo-50/40",
      border: "border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-500/10",
      accent: "bg-indigo-500",
      bg: "bg-indigo-50/50",
      color: "text-indigo-600",
    },
    pending: {
      label: "Pending Tickets",
      footer: "Awaiting action",
      icon: <Clock className="w-5 h-5" />,
      theme: "amber",
      gradient: "from-white to-amber-50/40",
      border: "border-amber-100 hover:border-amber-200 hover:shadow-amber-500/10",
      accent: "bg-amber-500",
      bg: "bg-amber-50/50",
      color: "text-amber-600",
    },
    resolved: {
      label: "Resolved Tickets",
      footer: "Successfully closed",
      icon: <UserCheck className="w-5 h-5" />,
      theme: "emerald",
      gradient: "from-white to-emerald-50/40",
      border: "border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-500/10",
      accent: "bg-emerald-500",
      bg: "bg-emerald-50/50",
      color: "text-emerald-600",
    },
    closed: {
      label: "Closed Tickets",
      footer: "Archived requests",
      icon: <UserCheck className="w-5 h-5" />,
      theme: "rose",
      gradient: "from-white to-rose-50/40",
      border: "border-rose-100 hover:border-rose-200 hover:shadow-rose-500/10",
      accent: "bg-rose-500",
      bg: "bg-rose-50/50",
      color: "text-rose-600",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="h-32 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between animate-pulse"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
      {stats?.map((stat, index) => {
        const config = statsConfig[stat.label] || statsConfig.total;
        return (
          <div 
            key={index} 
            className={`
              relative overflow-hidden group rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md cursor-default
              bg-linear-to-tr ${config.gradient} ${config.border}
            `}
          >
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {config.label}
                  </span>
                  
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">
                      {stat.value}
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase flex items-center gap-1.5">
                    <span className={`h-1 w-1 rounded-full ${config.accent}`} />
                    {config.footer}
                  </p>
                </div>

                <div className={`
                  p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm
                  ${config.bg}
                `}>
                   <div className={config.color}>
                     {config.icon}
                   </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none rotate-12">
               <div className="scale-[5]">
                 {config.icon}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
