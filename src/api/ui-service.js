
import { MOCK_SIDEBAR_CONFIG, MOCK_BRANDING_CONFIG } from "./ui-config-mock";

/**
 * Fetches the sidebar configuration (menu items).
 */
export const fetchSidebarConfig = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve(MOCK_SIDEBAR_CONFIG);
    }, 200);
  });
};

/**
 * Fetches branding configuration (logo, colors, etc).
 */
export const fetchBrandingConfig = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve(MOCK_BRANDING_CONFIG);
    }, 150);
  });
};
