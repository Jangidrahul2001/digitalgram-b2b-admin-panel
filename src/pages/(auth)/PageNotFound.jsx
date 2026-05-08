import React from "react";
import { motion } from "framer-motion";
import { PageLayout } from "../../components/layouts/page-layout";
import { FileX, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

const PageNotFound = () => {
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
              <FileX className="w-24 h-24 sm:w-32 sm:h-32 text-slate-500" />
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
          
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">
              Page <span className="text-slate-500">Not Found</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[280px] sm:max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
              Please check the URL or return to the homepage.
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
            <Button
              className="w-full xs:w-auto h-11 sm:h-12 px-6 sm:px-8 gap-2 rounded-2xl text-sm sm:text-base font-bold"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PageNotFound;
