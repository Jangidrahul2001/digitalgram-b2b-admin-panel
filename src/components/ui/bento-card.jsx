import { cn } from "../../lib/utils"

export function BentoCard({ children, className, hasHover = true, ...props }) {
  return (
    <div 
      className={cn(
        "bg-white border border-slate-200/50 shadow-sm relative overflow-hidden transition-all duration-500",
        "rounded-[2.5rem]",
        "p-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
