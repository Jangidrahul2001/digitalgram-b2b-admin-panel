import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "@/components/icons";
import { cn } from "../../lib/utils";
import { butteryDropdown } from "../../lib/animations";
import { useClickOutside } from "../../hooks/use-click-outside";
import { CustomDualCalendar } from "./custom-dual-calendar";

export function DateRangePicker({
  date,
  setDate,
  placeholder = "Pick a Date Range",
  onApply,
  onReset,
  className,
  triggerClassName,
  align = "right", // "left" or "right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Close on outside click
  useClickOutside(containerRef, () => setIsOpen(false), "#mobile-calendar-portal");

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApply = () => {
    setIsOpen(false);
    if (onApply) onApply();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setDate({ from: null, to: null });
    }
    setIsOpen(false);
  };
  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 md:h-10 px-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-[12px] min-w-[150px] font-medium text-slate-700 shadow-xs cursor-pointer hover:border-slate-900/20 transition-all select-none group",
          !date?.from && "text-slate-400",
          isOpen && "border-slate-900 ring-2 ring-slate-900/5",
          triggerClassName
        )}
      >
        <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
        <span className="truncate">
          {date?.from ? (
            <>
              {format(date.from, "MMM dd")} - {date.to ? format(date.to, "MMM dd") : "..."}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
      </div>
      {/* Desktop Dropdown */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            {...butteryDropdown}
            className={cn(
              "absolute top-full mt-2 z-50 origin-top shadow-md rounded-2xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-900/5",
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            )}
            style={{ width: 'max-content', maxWidth: '94vw' }}
          >
            <CustomDualCalendar 
              date={date} 
              setDate={setDate} 
              onApply={handleApply}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Portal / Bottom Sheet */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && isMobile && (
            <div id="mobile-calendar-portal" className="fixed inset-0 z-[99999] flex flex-col justify-end">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 350, mass: 0.5 }}
                className="relative bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
              >
                {/* Drag Handle or Header indicator */}
                <div className="w-full flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
                
                <div className="max-h-[85vh] overflow-y-auto">
                   <CustomDualCalendar 
                    date={date} 
                    setDate={setDate} 
                    onApply={handleApply}
                    onReset={handleReset}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
