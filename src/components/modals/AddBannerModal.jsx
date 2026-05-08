
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createPortal } from "react-dom"
import { X, Upload, Image } from "lucide-react"
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function AddBannerModal({ isOpen, onClose, onAdd, isLoading = false }) {
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

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
      setTitle("")
      setImage(null)
      setImagePreview(null)
    }
  }, [isOpen])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !image) {
      return
    }
    onAdd({ title: title.trim(), image })
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Add New Banner</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-600 font-medium">Banner Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter banner title"
                    className="bg-white"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-600 font-medium">Banner Image</Label>

                  {/* Image Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      id="banner-image"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      required
                      disabled={isLoading}
                    />

                    {imagePreview ? (
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-md">
                            Click to change image
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Image className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Click to upload banner image</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start gap-3 p-6 pt-2">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-black/5"
                  disabled={isLoading || !title.trim() || !image}
                >
                  {isLoading ? "Adding..." : "Add Banner"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                  disabled={isLoading}
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
