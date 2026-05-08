"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { SidebarPageTransition } from "../../../../components/ui/sidebar-page-transition"
import { usePost } from "../../../../hooks/usePost"
import { MoveLeft } from "@/components/icons"
import { apiEndpoints } from "../../../../api/apiEndpoints"
import { toast } from "sonner"
import { handleValidationError } from "../../../../utils/helperFunction"

export default function NewNotificationPage() {
  const navigate = useNavigate()

  const [heading, setHeading] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { post } = usePost(`${apiEndpoints.createNotification}`, {
    onSuccess: (data) => {
      toast.success(data.message || 'Notification created successfully')
      navigate('/settings?tab=notification')
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to create notification")
      setIsSubmitting(false)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!heading.trim() || !description.trim()) return
    setIsSubmitting(true)
    post({ name: heading.trim(), description: description.trim() })
  }

  const handleBack = () => {
    navigate('/settings?tab=notification')
  }

  return (
    <SidebarPageTransition className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
          >
            <MoveLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center gap-2 px-1">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Notification</h1>
              <p className="text-slate-500 text-xs">Create and broadcast a notification to all users.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="bg-white rounded-[1.5rem] border border-slate-200/60 p-6 md:p-8 space-y-8 transition-shadow duration-300">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                Notification Details
              </h3>

              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Notification Heading *
                  </Label>
                  <Input
                    id="heading"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="e.g. System Maintenance Update"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-slate-700 font-medium text-sm placeholder:text-slate-400 bg-white"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Detailed Description *
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter the full notification message here..."
                    className="flex min-h-[220px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus-visible:outline-none transition-all resize-y text-slate-700 font-medium placeholder:text-slate-400 hover:border-slate-300"
                    required
                  />
                  <p className="text-[11px] text-slate-400 font-medium italic mt-1">
                    This text will be visible when users expand the notification card.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-11 px-8 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !heading.trim() || !description.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-10 rounded-xl font-semibold shadow-lg shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publishing..." : "Publish Notification"}
            </Button>
          </div>
        </form>
      </div>
    </SidebarPageTransition>
  )
}
