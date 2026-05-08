
import { useState, useEffect } from "react";
import { fetchBrandingConfig } from "../api/ui-service";

export function useBranding() {
  const [branding, setBranding] = useState({
    appName: "Admin Dashboard",
    logoText: "C",
    logoUrl: "", 
    faviconUrl: "/favicon.ico",
    logoExpandedText: {
        title: "Digital Gram",
        subtitle: "Dashboard"
    },
    colors: {
        primary: "orange-500",
        primaryLight: "orange-100",
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await fetchBrandingConfig();
        if (config) {
            setBranding(config);
        }
      } catch (error) {
        console.error("Failed to load branding config", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBranding();
  }, []);

  return {
    branding,
    isLoading
  };
}
