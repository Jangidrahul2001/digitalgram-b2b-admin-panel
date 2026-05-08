import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "@/components/icons";
import { cn } from "../../lib/utils";
import { checkmarkAnimation } from "../../lib/animations";

export function Select({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  label,
  disabled,
  className,
  searchable = true,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = (isInitial = false) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // Estimated max height including search

      const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setCoords(prev => ({
        top: rect.bottom + window.scrollY + 8,
        bottom: window.innerHeight - (rect.top + window.scrollY) + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
        placement: isInitial ? (openUpwards ? "top" : "bottom") : prev.placement,
      }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOnTrigger =
        triggerRef.current && triggerRef.current.contains(event.target);
      const isClickOnDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!isClickOnTrigger && !isClickOnDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updatePosition(true);
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", () => updatePosition(false));
      window.addEventListener("scroll", () => updatePosition(false), true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => updatePosition(false));
      window.removeEventListener("scroll", () => updatePosition(false), true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setSearchQuery(""); // Reset search on open
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase()),
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-4 h-11 text-sm bg-slate-50/40 border rounded-xl transition-all duration-300 outline-none active:scale-[0.99]",
          isOpen
            ? "border-slate-900 bg-white ring-4 ring-slate-950/5"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60",
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50"
            : "cursor-pointer",
          error ? "border-red-500 focus:ring-red-500/10" : "", // Add error styling
          className,
        )}
      >
        <span
          className={
            selectedOption ? "text-slate-900 font-semibold" : "text-slate-400"
          }
        >
          {selectedOption ? (selectedOption.shortLabel || selectedOption.label) : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-slate-900" : ""}`}
        />
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Dropdown Menu */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{
                opacity: 0,
                y: coords.placement === "top" ? 8 : -8,
                scale: 0.98
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: coords.placement === "top" ? 8 : -8,
                scale: 0.98
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
              style={{
                position: "absolute",
                top: coords.placement === "bottom" ? coords.top : "auto",
                bottom: coords.placement === "top" ? coords.bottom : "auto",
                left: coords.left,
                width: coords.width,
                zIndex: 99999,
                transformOrigin: coords.placement === "top" ? "bottom center" : "top center",
              }}
              className="bg-white border border-slate-200/60 rounded-2xl shadow-lg overflow-hidden pointer-events-auto ring-1 ring-black/5"
            >
              {/* Header/Footer Search depending on placement */}
              {searchable && coords.placement === "bottom" && (
                <div className="px-3 py-2.5 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search..."
                      className="w-full h-8.5 pl-9 pr-3 text-xs bg-slate-100/50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900/20 focus:ring-4 focus:ring-slate-950/5 transition-all placeholder:text-slate-400 font-medium"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus={true}
                    />
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto py-1.5 custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-xs text-slate-400 text-center font-medium">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`
                        flex items-center justify-between px-4 py-2 text-xs cursor-pointer transition-all group mx-1.5 rounded-lg mb-0.5 last:mb-0
                        ${index === highlightedIndex ? "bg-slate-100 text-slate-900" : ""}
                        ${value === option.value ? "bg-slate-950 text-white font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                      `}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {option.label}
                      </span>
                      {value === option.value && (
                        <motion.div {...checkmarkAnimation}>
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Search for Upward Opening */}
              {searchable && coords.placement === "top" && (
                <div className="px-3 py-2.5 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-md z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search..."
                      className="w-full h-8.5 pl-9 pr-3 text-xs bg-slate-100/50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900/20 focus:ring-4 focus:ring-slate-950/5 transition-all placeholder:text-slate-400 font-medium"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus={true}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
