// import React, { useState, useEffect } from "react"
// import { createPortal } from "react-dom"
// import { motion, AnimatePresence } from "framer-motion"
// import { X, Copy, Check } from "@/components/icons"
// import { Button } from "../../components/ui/button"

// export function UserDetailsModal({ isOpen, onClose, user }) {
//     const [mounted, setMounted] = useState(false)
//     const [copied, setCopied] = useState(false)

//     useEffect(() => {
//         setMounted(true)
//     }, [])

//     useEffect(() => {
//         const handleEsc = (e) => {
//             if (e.key === 'Escape') onClose();
//         };
//         if (isOpen) {
//             window.addEventListener('keydown', handleEsc);
//         }
//         return () => window.removeEventListener('keydown', handleEsc);
//     }, [isOpen, onClose]);

//     if (!mounted) return null

//     const copyToClipboard = () => {
//         if (!user) return;
//         const text = `
// Full Name: ${user.name}
// Email: ${user.email}
// Password: ${user.password || '******'}
// Pin: ${user.pin || '******'}
// Registered At: ${user.registeredAt || '20 Jan 2026, 12:00 am'}
//         `.trim();
        
//         navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     }

//     return createPortal(
//         <AnimatePresence>
//             {isOpen && user && (
//                 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//                     {/* Backdrop */}
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         onClick={onClose}
//                         className="fixed inset-0 bg-black/40 backdrop-blur-sm"
//                     />
                    
//                     {/* Modal Content */}
//                     <motion.div
//                         initial={{ scale: 0.95, opacity: 0, y: 20 }}
//                         animate={{ scale: 1, opacity: 1, y: 0 }}
//                         exit={{ scale: 0.95, opacity: 0, y: 20 }}
//                         className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
//                     >
//                         {/* Header */}
//                         <div className="flex items-center justify-between p-5 border-b border-gray-100">
//                             <h2 className="text-lg font-semibold text-slate-800">User Details</h2>
//                             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
//                                 <X className="h-5 w-5 text-slate-500" />
//                             </button>
//                         </div>

//                         {/* Body */}
//                         <div className="p-6">
//                             <div className="border rounded-lg overflow-hidden text-sm">
//                                 <div className="grid grid-cols-[120px_1fr] border-b last:border-0">
//                                     <div className="bg-slate-50 p-3 font-semibold text-slate-700 border-r">Full Name:</div>
//                                     <div className="p-3 text-slate-600 font-medium">{user.name}</div>
//                                 </div>
//                                 <div className="grid grid-cols-[120px_1fr] border-b last:border-0">
//                                     <div className="bg-slate-50 p-3 font-semibold text-slate-700 border-r">Email:</div>
//                                     <div className="p-3 text-slate-600 font-medium">{user.email}</div>
//                                 </div>
//                                 <div className="grid grid-cols-[120px_1fr] border-b last:border-0">
//                                     <div className="bg-slate-50 p-3 font-semibold text-slate-700 border-r">Password:</div>
//                                     <div className="p-3 text-slate-600 font-medium">{user.password || '123456'}</div>
//                                 </div>
//                                 <div className="grid grid-cols-[120px_1fr] border-b last:border-0">
//                                     <div className="bg-slate-50 p-3 font-semibold text-slate-700 border-r">Pin:</div>
//                                     <div className="p-3 text-slate-600 font-medium">{user.pin || '111111'}</div>
//                                 </div>
//                                 <div className="grid grid-cols-[120px_1fr] border-b last:border-0">
//                                     <div className="bg-slate-50 p-3 font-semibold text-slate-700 border-r">Registered At:</div>
//                                     <div className="p-3 text-slate-600 font-medium">{user.createdAt || '12 Jan 2026, 11:04 am'}</div>
//                                 </div>
//                             </div>

//                             <div className="mt-6 flex justify-end">
//                                 <Button 
//                                     onClick={copyToClipboard}
//                                     variant="outline" 
//                                     className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
//                                 >
//                                     {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
//                                     {copied ? "Copied!" : "Copy Details"}
//                                 </Button>
//                             </div>
//                         </div>
//                     </motion.div>
//                 </div>
//             )}
//         </AnimatePresence>,
//         document.body
//     )
// }
