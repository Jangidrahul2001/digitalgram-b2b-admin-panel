import React from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { cn } from "../../lib/utils";

const ClickToCopy = ({ text, className, children }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;

    // Check if navigator.clipboard is available (Secure context only)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success("Copied to clipboard", {
            description: text,
          });
        })
        .catch((err) => {
          console.error("Clipboard write failed", err);
          fallbackCopyTextToClipboard(text);
        });
    } else {
      // Fallback for non-secure contexts or older browsers
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is not visible
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Copied to clipboard", {
          description: text,
        });
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all group active:scale-95",
        className
      )}
      title="Click to copy"
    >
      {children || <span className="truncate max-w-[120px]">{text}</span>}
      {/* <Copy size={10} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" /> */}
    </div>
  );
};

export default ClickToCopy;
