import { useState, useEffect, useCallback } from "react";
import { contentData } from "../data/content-data";

export function useContent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(contentData);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    data,
    isLoading,
    refreshContent: fetchContent
  };
}
