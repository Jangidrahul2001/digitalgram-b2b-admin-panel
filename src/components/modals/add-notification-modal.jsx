"use client"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createPortal } from "react-dom"
import { X, Upload } from "@/components/icons"
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function AddNotificationModal({ isOpen, onClose, onAdd }) {
  const [mounted, setMounted] = useState(false)
  const [heading, setHeading] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)

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
      setHeading("")
      setDescription("")
      setFile(null)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({ heading, description, file })
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
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Add Notification</h3>
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
                  <Label htmlFor="heading" className="text-slate-600 font-medium">Heading</Label>
                  <Input
                    id="heading"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Enter notification heading"
                    className="bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-600 font-medium">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter notification details"
                    className="bg-white"
                  />
                  {/* Note: User image shows Description as an Input-like field, but traditionally descriptions are Textareas. 
                                        Using Input for now to match visual weight of the screenshot provided by user if they provided one, 
                                        but standard input is safer if they want multiline later we can swap to Textarea. */}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Notification Banner</Label>
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-1 pr-4 bg-white">
                    <div className="relative">
                      <input
                        type="file"
                        id="banner-file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      <Button type="button" variant="outline" className="pointer-events-none bg-slate-50 border-slate-200 text-slate-600">
                        Choose File
                      </Button>
                    </div>
                    <span className="text-sm text-slate-500 truncate flex-1">
                      {file ? file.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start gap-3 p-6 pt-2">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-black/5"
                >
                  Add Notification
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                >
                  Cancel
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
