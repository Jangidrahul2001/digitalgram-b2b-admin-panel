import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97] active:duration-75 active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white hover:bg-slate-800 shadow-sm shadow-slate-950/10",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/10",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900",
        link: "text-slate-950 underline-offset-4 hover:underline",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-slate-900 hover:bg-white/20 shadow-sm",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-500 hover:text-white shadow-sm shadow-emerald-500/10",
        failure: "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-500 hover:text-white shadow-sm shadow-rose-500/10",
        warning: "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-500 hover:text-white shadow-sm shadow-amber-500/10",
        info: "bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-500 hover:text-white shadow-sm shadow-indigo-500/10",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        xs: "h-8 px-3 text-[11px] font-bold rounded-lg",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
