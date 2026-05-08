import React from "react";
import { motion } from "framer-motion";
import { PageLayout } from "../../components/layouts/page-layout";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

const NoPermission = () => {
    const navigate = useNavigate();

    return (
        <PageLayout title="" subtitle="">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 min-h-[calc(100vh-150px)] -mt-8 sm:-mt-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="w-full max-w-[280px] sm:max-w-lg aspect-square sm:aspect-video relative flex items-center justify-center"
                >
                    <div className="relative w-full h-full backdrop-blur-xl rounded-[3rem] overflow-hidden flex items-center justify-center p-6 md:p-12 group">
                        <div className="w-full h-full flex items-center justify-center">
                            <ShieldAlert className="w-24 h-24 sm:w-32 sm:h-32 text-rose-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-8 sm:mt-12 text-center space-y-4 sm:space-y-6"
                >
                    <div className="space-y-2 sm:space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                            <div className="h-px w-6 sm:w-12 bg-rose-200/50" />
                            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                            <div className="h-px w-6 sm:w-12 bg-rose-200/50" />
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                            Restricted <span className="text-rose-500">Access</span>
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[280px] sm:max-w-md mx-auto leading-relaxed">
                            Your account lacks the necessary permissions for this service.
                            Contact your system administrator for activation.
                        </p>
                    </div>

                    <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                        <Button
                            variant="ghost"
                            className="w-full xs:w-auto h-11 sm:h-12 px-6 sm:px-8 gap-2 rounded-2xl border-slate-200 text-sm sm:text-base font-bold shadow-sm"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    </div>
                </motion.div>
            </div>
        </PageLayout>
    );
};

export default NoPermission;
