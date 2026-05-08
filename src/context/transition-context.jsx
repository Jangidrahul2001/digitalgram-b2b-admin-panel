import React, { createContext, useContext, useState, useEffect } from "react";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [origin, setOrigin] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // We capture the click coordinates for the transition origin
      setOrigin({ x: `${e.clientX}px`, y: `${e.clientY}px` });
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <TransitionContext.Provider value={{ origin }}>
      {children}
    </TransitionContext.Provider>
  );
}

export const useTransitionOrigin = () => useContext(TransitionContext);
