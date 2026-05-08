import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <div className={cn(
        "relative flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50/50 transition-all duration-300 hover:bg-slate-50 overflow-hidden",
        error ? "border-red-500 focus-within:ring-red-500/10 focus-within:border-red-500/50" : "",
        className
      )}>
        <textarea
          className={cn(
            "w-full h-full min-h-[120px] bg-transparent px-4 text-sm placeholder:text-slate-400 focus:outline-none resize-none overflow-y-auto custom-scrollbar",
          )}
          ref={ref}
          {...props}
        />
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
