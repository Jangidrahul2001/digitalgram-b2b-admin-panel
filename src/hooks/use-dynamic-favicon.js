import { useEffect } from 'react';

// This custom hook handles dynamic favicon updates
// In the future, you can replace the hardcoded 'favicon.ico' with
// a value from your API response.
export function useDynamicFavicon(faviconUrl) {
  useEffect(() => {
    // If no URL is provided, we can either do nothing or set a default.
    // For now, let's assume we want to resolve to the provided URL or default to favicon.ico
    const link = document.querySelector("link[rel~='icon']");
    
    if (!link) {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        document.head.appendChild(newLink);
    }
    
    // Simulate API resolution logic (fallback to default if url is empty)
    // You can replace '/favicon.ico' with your API data variable later.
    const finalFavicon = faviconUrl || '/favicon.ico'; 

    if (link) {
      link.href = finalFavicon;
    } else {
        // If link was just created in the if(!link) block above, re-select or use reference
        document.querySelector("link[rel~='icon']").href = finalFavicon;
    }

  }, [faviconUrl]); // Re-run if the faviconUrl changes
}
