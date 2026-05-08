// c:\Piyush Projects\b2b\admin-pannel\src\pages\(dashboard)\support\components\remark-dialog.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "../../../../components/icons";
import { Button } from "../../../../components/ui/button";
import { usePatch } from "../../../../hooks/usePatch";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
import { apiEndpoints } from "../../../../api/apiEndpoints";

export function RemarkDialog({ isOpen, onClose, ticketId, onSuccess }) {
    const [mounted, setMounted] = useState(false);
    const [remark, setRemark] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const { patch: addRemark } = usePatch({
        onSuccess: (data) => {
            if (data.success) {
                toast.success("Remark added successfully");
                setRemark("");
                onClose();
                onSuccess?.();
            }
            setIsSubmitting(false);
        },
        onError: (error) => {
            toast.error(handleValidationError(error) || "Failed to add remark");
            setIsSubmitting(false);
        },
    });

    const handleSubmit = () => {
        if (!remark.trim()) {
            toast.error("Please enter a remark");
            return;
        }

        setIsSubmitting(true);
        addRemark(`${apiEndpoints.addRemarkInSupportTicket}/${ticketId}`, { remark: remark.trim() });
    };

    if (!mounted) return null;

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
                        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Add Remark</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Add a note or comment to this support ticket for internal reference.
                                    </p>

                                    <div className="mt-4">
                                        <textarea
                                            className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-all resize-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 focus-visible:bg-white"
                                            placeholder="Enter your remark here..."
                                            value={remark}
                                            onChange={(e) => setRemark(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !remark.trim()}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-black/5"
                                >
                                    {isSubmitting ? "Adding..." : "Add Remark"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
