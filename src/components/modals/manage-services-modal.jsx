import React, { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Check,
  Search,
  Layers,
  ShieldCheck,
  ArrowRightLeft,
  Fingerprint,
  Smartphone,
  Receipt,
  Banknote,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ClipboardList,
  Search as SearchIcon
} from "@/components/icons"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { handleValidationError } from "../../utils/helperFunction"
import { toast } from "sonner"
import { useFetch } from "../../hooks/useFetch"
import { apiEndpoints } from "../../api/apiEndpoints"
import { cn } from "../../lib/utils"

// Helper to assign icons to dynamic categories
const getCategoryIcon = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("aeps")) return Fingerprint;
  if (lowerName.includes("money") || lowerName.includes("transfer") || lowerName.includes("dmt")) return ArrowRightLeft;
  if (lowerName.includes("recharge") || lowerName.includes("mobile")) return Smartphone;
  if (lowerName.includes("bill") || lowerName.includes("bbps") || lowerName.includes("receipt")) return Receipt;
  if (lowerName.includes("payout") || lowerName.includes("settlement")) return Banknote;
  if (lowerName.includes("ecommerce") || lowerName.includes("shop")) return ShoppingBag;
  return Sparkles; // Default fallback
};

export function ManageServicesModal({ isOpen, onClose, selectedServices = [], onAssign }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [localSelected, setLocalSelected] = useState([])
  const [servicesWithPipeline, setServicesWithPipeline] = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [isPipelineAccessModal, setIsPipelineAccessModal] = useState(false)
  const [selectedServiceForPipeline, setSelectedServiceForPipeline] = useState(null)

  // Dynamically generate categories from fetched services
  const dynamicCategories = useMemo(() => {
    const groups = new Set();
    servicesWithPipeline.forEach(s => {
      const name = s.label || s.name;
      if (name) groups.add(name);
    });

    const categories = Array.from(groups).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, "_"),
      name: name,
      icon: getCategoryIcon(name)
    }));

    return [{ id: "all", name: "All Services", icon: Layers }, ...categories];
  }, [servicesWithPipeline]);

  const { refetch: fetchServicesWithPipeline, isLoading } = useFetch(
    `${apiEndpoints.fetchServicesWithPipeline}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setServicesWithPipeline(data.data)
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch service details");
      },
    },
    isOpen,
  );

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedServices)
      setActiveCategory("all")
      setSearchQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const getSubServices = (service) => {
    if (service.pipeline && service.pipeline.length > 0) {
      return service.pipeline
        .filter(pipeline => pipeline.isActive)
        .map(pipeline => ({
          id: `${service._id}_${pipeline.code}`,
          name: pipeline.label,
          code: pipeline.code,
          parentId: service._id,
          pipelineId: pipeline._id
        }));
    }
    return [
      { id: `${service._id}_basic`, name: "Basic Access", code: "basic", parentId: service._id },
      { id: `${service._id}_premium`, name: "Premium", code: "premium", parentId: service._id }
    ];
  }

  const isServiceSelected = (serviceId) => localSelected.some(item => item.serviceId === serviceId);
  const isPipelineSelected = (serviceId, pipelineCode) => {
    const service = localSelected.find(item => item.serviceId === serviceId);
    return service?.pipelineCodes?.includes(pipelineCode) || false;
  }
  const getSelectedPipelines = (serviceId) => localSelected.find(item => item.serviceId === serviceId)?.pipelineCodes || [];

  const toggleService = (service) => {
    const subServices = getSubServices(service);
    const allPipelineCodes = subServices.map(s => s.code);
    const selectedPipelines = getSelectedPipelines(service._id);
    const allSelected = allPipelineCodes.every(code => selectedPipelines.includes(code));

    setLocalSelected(prev => {
      const filtered = prev.filter(item => item.serviceId !== service._id);
      return allSelected ? filtered : [...filtered, { serviceId: service._id, pipelineCodes: allPipelineCodes }];
    });
  }

  const toggleSubService = (pipelineCode, serviceId) => {
    setLocalSelected(prev => {
      const existingServiceIndex = prev.findIndex(item => item.serviceId === serviceId);
      if (existingServiceIndex === -1) {
        return [...prev, { serviceId, pipelineCodes: [pipelineCode] }];
      } else {
        const existingService = prev[existingServiceIndex];
        const pipelineCodes = [...existingService.pipelineCodes];
        if (pipelineCodes.includes(pipelineCode)) {
          const updatedCodes = pipelineCodes.filter(code => code !== pipelineCode);
          if (updatedCodes.length === 0) return prev.filter(item => item.serviceId !== serviceId);
          const updated = [...prev];
          updated[existingServiceIndex] = { ...existingService, pipelineCodes: updatedCodes };
          return updated;
        } else {
          const updated = [...prev];
          updated[existingServiceIndex] = { ...existingService, pipelineCodes: [...pipelineCodes, pipelineCode] };
          return updated;
        }
      }
    });
  }
  const handleSave = () => {
    onAssign(localSelected)
    onClose()
  }

  // Flatten all pipelines into a single list for the grid display
  const allFlattenedCards = useMemo(() => {
    const cards = [];
    servicesWithPipeline.forEach(service => {
      const pipelines = getSubServices(service);
      if (pipelines.length === 0) {
        cards.push({
          id: `${service._id}_default`,
          serviceId: service._id,
          pipelineCode: service.name,
          pipelineName: service.label || service.name,
          parentName: service.label || service.name,
          service: service
        });
      } else {
        pipelines.forEach(pipe => {
          cards.push({
            id: `${service._id}_${pipe.code}`,
            serviceId: service._id,
            pipelineCode: pipe.code,
            pipelineName: pipe.name,
            parentName: service.label || service.name,
            service: service
          });
        });
      }
    });
    return cards;
  }, [servicesWithPipeline]);

  const displayCards = useMemo(() => {
    let filtered = allFlattenedCards;

    if (activeCategory !== "all") {
      const category = dynamicCategories.find(c => c.id === activeCategory);
      if (category) {
        filtered = filtered.filter(card => card.parentName === category.name);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.pipelineName.toLowerCase().includes(query) ||
        card.parentName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allFlattenedCards, activeCategory, searchQuery, dynamicCategories]);

  const totalSelections = localSelected.reduce((total, s) => total + (s.pipelineCodes?.length || 0), 0);

  const handleCardToggle = (card) => {
    toggleSubService(card.pipelineCode, card.serviceId);
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" />
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 sm:px-6 border-b border-slate-100 bg-white shrink-0 gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 sm:p-2 sm:rounded-xl">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">Assign Services</h2>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Granular Selection</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-all sm:hidden">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 w-full max-w-sm relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Quick search options (e.g. AEPS 1)..."
                  className="pl-9 h-9 bg-slate-50/50 border-slate-200 rounded-lg text-[12px] focus:ring-slate-900 focus:border-slate-900 transition-all shadow-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all group hidden sm:block">
                <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
              <div className="sm:hidden border-b border-slate-100 bg-slate-50/30 overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-2 shrink-0">
                {dynamicCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                      activeCategory === cat.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white border border-slate-100 text-slate-500"
                    )}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex w-[180px] border-r border-slate-100 flex-col bg-slate-50/30 overflow-y-auto scroll-smooth custom-scrollbar shrink-0">
                <div className="p-3 space-y-1">
                  <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Groups</p>
                  {dynamicCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors duration-300 relative group",
                          isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeGroup"
                            className="absolute inset-0 bg-slate-900 rounded-xl shadow-md shadow-slate-900/10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <cat.icon className={cn("w-4 h-4 relative z-10", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                        <span className="relative z-10">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="flex-1 overflow-y-auto scroll-smooth p-4.5 sm:p-5 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                      <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading</p>
                    </div>
                  ) : (
                    <motion.div
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
                    >
                      <AnimatePresence>
                        {displayCards.map((card) => {
                          const isSelected = isPipelineSelected(card.serviceId, card.pipelineCode);

                          return (
                            <motion.div
                              layout
                              key={card.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              whileHover={{ scale: 1.01, translateY: -1 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{
                                layout: { duration: 0.3, ease: "easeOut" },
                                opacity: { duration: 0.2 },
                                y: { duration: 0.2 }
                              }}
                              onClick={() => handleCardToggle(card)}
                              className={cn(
                                "group relative p-4 rounded-2xl border cursor-pointer transition-colors duration-200 flex items-center gap-4.5 overflow-hidden",
                                isSelected
                                  ? "border-slate-900 bg-slate-50 shadow-sm"
                                  : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40"
                              )}
                            >
                              <div className={cn(
                                "w-10.5 h-10.5 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 border",
                                isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-100"
                              )}>
                                <ShieldCheck className="w-5 h-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  "text-[10.5px] font-bold uppercase tracking-widest mb-0.5",
                                  isSelected ? "text-slate-900" : "text-slate-400"
                                )}>
                                  {card.parentName}
                                </p>
                                <h4 className={cn(
                                  "text-[14px] font-bold truncate leading-tight tracking-tight",
                                  isSelected ? "text-slate-900" : "text-slate-800"
                                )}>
                                  {card.pipelineName}
                                </h4>
                              </div>

                              <div className={cn(
                                "w-5.5 h-5.5 rounded-lg flex items-center justify-center border-2 transition-all duration-200 shrink-0",
                                isSelected
                                  ? "bg-slate-900 border-slate-900 text-white scale-110 shadow-sm"
                                  : "bg-white border-slate-100 group-hover:border-slate-300"
                              )}>
                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {!isLoading && displayCards.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <SearchIcon className="w-7 h-7 text-slate-200 mb-2" />
                      <p className="text-slate-400 text-[10.5px] uppercase tracking-widest font-bold">No results found</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4.5 px-6 sm:px-7 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 gap-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[12px] sm:text-[13px] font-bold text-slate-900">{totalSelections} Active Permissions</span>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Selections</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" onClick={onClose} className="px-4 rounded-xl h-9 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</Button>
                <Button onClick={handleSave} className="bg-slate-900 text-white px-7 rounded-xl h-9 text-[11px] font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                  Assign Services
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
