import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm ring-offset-white transition-all duration-300 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/5 focus-visible:border-slate-950/40 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus-visible:ring-red-500/10 focus-visible:border-red-500/50" : "",
          className,
        )}
        ref={ref}
        onWheel={(e) => e.target.blur()}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
