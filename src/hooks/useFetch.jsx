import { useEffect, useState, useCallback, useContext } from "react";
import api from "../api/api";
// import { GlobalContext } from "../context/GlobalContext";

export function useFetch(
  url,
  { onSuccess, onError } = {},
  auto = true,
  showLoading = true,
) {
  // const { loading, setLoading } = useContext(GlobalContext);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(auto);

  const fetchData = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.get(url, { params });

        if (res.success) {
          setData(res);
          onSuccess?.(res, res);
          setIsLoading(false);
          return res;
        } else {
          setError(res.message);
          onError?.(res.message);
          setIsLoading(false);
        }
      } catch (error) {
        setError(error);
        onError?.(error);
        setIsLoading(false);
        throw error;
      } finally {
        // setIsLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    if (auto) fetchData();
  }, [fetchData, auto]);

  return { data, error, isLoading, refetch: fetchData };
}
