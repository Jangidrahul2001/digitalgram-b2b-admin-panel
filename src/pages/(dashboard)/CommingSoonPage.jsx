import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { PageLayout } from "../../components/layouts/page-layout";
import CommingSoon from "../../assets/coming-soon.lottie"


const CommingSoonPage = ({ title, subtitle }) => {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
    >
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="w-full max-w-3xl aspect-video relative flex items-center justify-center"
        >
          {/* Lottie Container with Glass Design */}
          <div className="relative w-full h-full backdrop-blur-xl rounded-[3rem] overflow-hidden flex items-center justify-center p-6 md:p-12">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-3xl -z-10" />

            <DotLottieReact
              src={CommingSoon}
              loop
              autoplay
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center space-y-3"
        >
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Feature Integration in Progress</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            We are currently working on integrating this feature.
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default CommingSoonPage;
