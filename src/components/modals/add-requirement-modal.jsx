import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createPortal } from "react-dom"
import { X } from "@/components/icons"
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { InputSlice } from "../../utils/helperFunction"

export function AddRequirementModal({ isOpen, onClose, onAdd, type }) {
  const [mounted, setMounted] = useState(false)
  const [label, setLabel] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setLabel("")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!label.trim()) return;
    onAdd({ type, label })
    onClose()
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  {type === "document" ? "Add New Document" : "Add New Data Field"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-slate-600 font-medium">
                    {type === "document" ? "Document Name" : "Field Name"}
                  </Label>
                  <Input
                    id="label"
                    value={InputSlice(label, 20)}
                    onChange={(e) => setLabel(InputSlice(e.target.value, 20))}
                    placeholder={type === "document" ? "e.g. Passport" : "e.g. Father's Name"}
                    className="bg-white capitalize"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-black/5"
                  disabled={!label.trim()}
                >
                  {type === "document" ? "Add Document" : "Add Field"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
