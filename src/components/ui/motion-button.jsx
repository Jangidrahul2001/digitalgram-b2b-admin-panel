import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

const MotionButton = React.forwardRef(({ className, variant, size, whileHover, whileTap, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={whileTap || { scale: 0.97 }}
      whileHover={whileHover || { y: -1 }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})
MotionButton.displayName = "MotionButton"

export { MotionButton }
