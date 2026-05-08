"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5, // Lightweight feel
      }}
      className="w-full min-h-full"
    >
      {children}
    </motion.div>
  );
}
