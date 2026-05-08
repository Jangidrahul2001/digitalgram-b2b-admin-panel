
import { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutside(ref, handler, ignoreSelector) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (ignoreSelector && event.target.closest(ignoreSelector)) {
          return;
        }
        handler();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}
